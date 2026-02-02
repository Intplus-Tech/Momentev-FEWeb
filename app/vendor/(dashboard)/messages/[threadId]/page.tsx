"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  useConversations,
  useChatMessages,
  useSendMessage,
  useChatRealtime,
} from "@/lib/react-query/hooks/use-chat";
import type { ChatConversation } from "@/types/chat";
import { uploadFile } from "@/lib/actions/upload";

import { ConversationHeader } from "../_components/conversation-header";
import {
  MessageComposer,
  type PendingAttachment,
} from "../_components/message-composer";
import {
  MessageHistory,
  type UploadingMessage,
} from "../_components/message-history";

const VendorThreadPage = () => {
  const router = useRouter();
  const params = useParams<{ threadId: string }>();

  const threadId = useMemo(() => {
    const value = params?.threadId;
    return Array.isArray(value) ? value[0] : value || "";
  }, [params?.threadId]);

  const [messageText, setMessageText] = useState("");
  const [pendingAttachment, setPendingAttachment] =
    useState<PendingAttachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingMessage, setUploadingMessage] =
    useState<UploadingMessage | null>(null);

  const { data: conversations = [] } = useConversations();
  const { data: messages = [] } = useChatMessages(threadId);
  const { mutate: sendMessage } = useSendMessage();

  useChatRealtime(threadId);

  const conversation = conversations.find(
    (c: ChatConversation) => c._id === threadId,
  );

  const handleFileSelect = (file: File) => {
    console.log("[Vendor Chat] File selected:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const previewUrl = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined;
    setPendingAttachment({ file, previewUrl });
  };

  const handleRemoveAttachment = () => {
    console.log("[Vendor Chat] Attachment removed");
    if (pendingAttachment?.previewUrl) {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    }
    setPendingAttachment(null);
  };

  const handleSend = async () => {
    const trimmed = messageText.trim();
    if (!threadId) return;

    if (pendingAttachment) {
      console.log("[Vendor Chat] Starting file upload...", {
        fileName: pendingAttachment.file.name,
        fileSize: pendingAttachment.file.size,
      });

      const isImage = pendingAttachment.file.type.startsWith("image/");

      setUploadingMessage({
        id: `uploading-${Date.now()}`,
        previewUrl: pendingAttachment.previewUrl,
        fileName: pendingAttachment.file.name,
        fileSize: pendingAttachment.file.size,
        isImage,
        status: "uploading",
        text: trimmed || undefined,
      });

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", pendingAttachment.file);

        console.log("[Vendor Chat] Uploading file to server...");
        const result = await uploadFile(formData);

        if (!result.success) {
          console.error("[Vendor Chat] Upload failed:", result.error);
          setUploadingMessage((prev) =>
            prev ? { ...prev, status: "error" } : null,
          );
          toast.error(result.error || "Failed to upload file");
          setIsUploading(false);
          return;
        }

        console.log("[Vendor Chat] Upload successful:", result.data);

        sendMessage({
          conversationId: threadId,
          payload: {
            type: isImage ? "image" : "file",
            text: trimmed || undefined,
            clientMessageId: `temp-${Date.now()}`,
            attachments: result.data ? [result.data.url] : undefined,
          },
          senderSide: "vendor",
        });

        console.log("[Vendor Chat] Message sent successfully");

        setUploadingMessage(null);
        handleRemoveAttachment();
        setMessageText("");
        toast.success("File sent successfully");
      } catch (error) {
        console.error("[Vendor Chat] Error during upload/send:", error);
        setUploadingMessage((prev) =>
          prev ? { ...prev, status: "error" } : null,
        );
        toast.error("Failed to send attachment");
      } finally {
        setIsUploading(false);
      }
      return;
    }

    if (!trimmed) return;

    console.log("[Vendor Chat] Sending text message...", {
      conversationId: threadId,
      textLength: trimmed.length,
    });

    sendMessage({
      conversationId: threadId,
      payload: {
        type: "text",
        text: trimmed,
        clientMessageId: `temp-${Date.now()}`,
      },
      senderSide: "vendor",
    });
    setMessageText("");
  };

  if (!threadId) return null;

  // Get display name from populated user data
  const displayName = conversation?.user
    ? `${conversation.user.firstName} ${conversation.user.lastName}`.trim()
    : "Customer";

  const userAvatar = conversation?.user?.avatar;

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card shadow-sm">
      <ConversationHeader
        vendorName={displayName}
        avatar={userAvatar}
        lastActiveLabel={
          conversation?.lastMessageAt
            ? format(new Date(conversation.lastMessageAt), "PP p")
            : ""
        }
        className="px-4"
        leftSlot={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full lg:hidden"
            onClick={() => router.push("/vendor/messages")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <MessageHistory
          messages={messages}
          className="h-full px-4 py-4"
          userSide="vendor"
          counterpartyLastReadAt={conversation?.userLastReadAt}
          uploadingMessage={uploadingMessage}
        />
        <MessageComposer
          value={messageText}
          onChange={setMessageText}
          onSend={handleSend}
          pendingAttachment={pendingAttachment}
          onFileSelect={handleFileSelect}
          onRemoveAttachment={handleRemoveAttachment}
          isUploading={isUploading}
        />
      </div>
    </div>
  );
};

export default VendorThreadPage;
