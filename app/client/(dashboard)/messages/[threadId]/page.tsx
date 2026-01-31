"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Paperclip, Video } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";

import {
  useConversations,
  useChatMessages,
  useSendMessage,
  useChatRealtime,
} from "@/lib/react-query/hooks/use-chat";

import { ConversationHeader } from "../_components/conversation-header";
import { MessageComposer } from "../_components/message-composer";
import { MessageHistory } from "../_components/message-history";

const ClientThreadPage = () => {
  const router = useRouter();
  const params = useParams<{ threadId: string }>();

  const threadId = useMemo(() => {
    const value = params?.threadId;
    return Array.isArray(value) ? value[0] : value || "";
  }, [params?.threadId]);

  const [messageText, setMessageText] = useState("");

  const { data: conversations = [] } = useConversations();
  const { data: messages = [] } = useChatMessages(threadId);
  const { mutate: sendMessage } = useSendMessage();

  useChatRealtime(threadId);

  const conversation = conversations.find((c) => c._id === threadId);

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed || !threadId) return;

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
        vendorName={conversation?.vendorId || "Vendor"}
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
        actions={
          <>
            <Button variant="outline" size="icon-sm" className="rounded-full">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon-sm" className="rounded-full">
              <Paperclip className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <MessageHistory
          messages={messages}
          className="h-full px-4 py-4"
          userSide="user"
          counterpartyLastReadAt={conversation?.vendorLastReadAt}
        />
        <MessageComposer
          value={messageText}
          onChange={setMessageText}
          onSend={handleSend}
        />
      </div>
    </div>
  );
};

export default ClientThreadPage;
