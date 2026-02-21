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
  useVendorProfile,
} from "@/hooks/api/use-chat";
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

const ClientThreadPage = () => {
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

  // Fetch vendor profile for display
  const { data: vendorProfile } = useVendorProfile(conversation?.vendorId);
  const vendorDisplayName =
    vendorProfile?.businessProfile?.businessName || "Vendor";

  const handleFileSelect = (file: File) => {
    console.log("[Chat] File selected:", {
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
    console.log("[Chat] Attachment removed");
    if (pendingAttachment?.previewUrl) {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    }
    setPendingAttachment(null);
  };

  const handleSend = async () => {
    const trimmed = messageText.trim();
    if (!threadId) return;

    // If there's a pending attachment, upload it first
    if (pendingAttachment) {
      const isImage = pendingAttachment.file.type.startsWith("image/");
      // Capture the previewUrl before we potentially clear pendingAttachment
      const capturedPreviewUrl = pendingAttachment.previewUrl;
      const capturedFileName = pendingAttachment.file.name;
      const capturedFileSize = pendingAttachment.file.size;

      // Show uploading preview in message history
      setUploadingMessage({
        id: `uploading-${Date.now()}`,
        previewUrl: capturedPreviewUrl,
        fileName: capturedFileName,
        fileSize: capturedFileSize,
        isImage,
        status: "uploading",
        text: trimmed || undefined,
      });

      setIsUploading(true);
      // Clear the composer immediately so user can't double-send
      setPendingAttachment(null);
      setMessageText("");

      try {
        const formData = new FormData();
        formData.append("file", pendingAttachment.file);
        const result = await uploadFile(formData);

        if (!result.success) {
          console.error("[Chat] Upload failed:", result.error);
          setUploadingMessage((prev) =>
            prev ? { ...prev, status: "error" } : null,
          );
          toast.error(result.error || "Failed to upload file");
          setIsUploading(false);
          return;
        }

        const clientMessageId = `temp-${Date.now()}`;

        sendMessage(
          {
            conversationId: threadId,
            payload: {
              type: "file",
              text: trimmed || undefined,
              clientMessageId,
              attachments: result.data ? [{ fileId: result.data._id }] : undefined,
            },
            senderSide: "user",
            // Image: pass blob URL for live preview; non-image: pass metadata for a file card placeholder
            previewUrl: isImage ? capturedPreviewUrl : undefined,
            fileMetadata: !isImage ? {
              name: capturedFileName,
              size: capturedFileSize,
              mimeType: pendingAttachment?.file.type || 'application/octet-stream',
            } : undefined,
          },
          {
            onSuccess: () => {
              // Safe to revoke blob now — the optimistic message has been replaced by the real
              // message which uses the CDN URL instead of the blob URL
              if (capturedPreviewUrl) {
                URL.revokeObjectURL(capturedPreviewUrl);
              }
            },
          }
        );

        setUploadingMessage(null);
        toast.success("File sent successfully");
      } catch (error) {
        console.error("[Chat] Error during upload/send:", error);
        setUploadingMessage((prev) =>
          prev ? { ...prev, status: "error" } : null,
        );
        toast.error("Failed to send attachment");
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // Text-only message
    if (!trimmed) return;

    console.log("[Chat] Sending text message...", {
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
      senderSide: "user",
    });
    setMessageText("");
  };

  if (!threadId) return null;

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card shadow-sm">
      <ConversationHeader
        vendorName={vendorDisplayName}
        rating={vendorProfile?.rate}
        reviewCount={vendorProfile?.reviewCount}
        avatar={vendorProfile?.profilePhoto?.url}
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
            onClick={() => router.push("/client/messages")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <MessageHistory
          messages={messages}
          className="h-full px-4 py-4"
          userSide="user"
          counterpartyLastReadAt={conversation?.vendorLastReadAt}
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

export default ClientThreadPage;
