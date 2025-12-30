"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Paperclip, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import {
  conversations as conversationSeed,
  type ConversationMessage,
  type ConversationMeta,
} from "../data";

import { ConversationHeader } from "../_components/conversation-header";
import { MessageComposer } from "../_components/message-composer";
import { MessageHistory } from "../_components/message-history";

const timeLabel = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const cloneConversation = (conversation?: ConversationMeta | null) => {
  if (!conversation) return null;
  return {
    ...conversation,
    messages: [...conversation.messages],
  };
};

const MobileThreadPage = () => {
  const router = useRouter();
  const params = useParams<{ threadId: string }>();
  const isMobile = useIsMobile();
  const threadId = useMemo(() => {
    const value = params?.threadId;
    return Array.isArray(value) ? value[0] : value;
  }, [params?.threadId]);

  const [conversation, setConversation] = useState<ConversationMeta | null>(
    () => cloneConversation(conversationSeed[threadId])
  );
  const [messageText, setMessageText] = useState("");
  const [typing, setTyping] = useState(false);
  const pendingReplyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversation) {
      router.replace("/vendor/(dashboard)/messages");
    }
  }, [conversation, router]);

  useEffect(() => {
    return () => {
      if (pendingReplyRef.current) {
        clearTimeout(pendingReplyRef.current);
      }
    };
  }, []);

  const pushMessage = (message: ConversationMessage) => {
    setConversation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, message],
        lastActiveLabel: `Today | ${message.time}`,
      };
    });
  };

  const mockVendorReply = () => {
    setTyping(true);

    if (pendingReplyRef.current) {
      clearTimeout(pendingReplyRef.current);
    }

    pendingReplyRef.current = setTimeout(() => {
      const reply: ConversationMessage = {
        id: `vendor-${Date.now()}`,
        sender: "vendor",
        message: "Appreciate the details! I will review and confirm soon.",
        time: timeLabel(new Date()),
      };

      pushMessage(reply);
      setTyping(false);
    }, 900 + Math.random() * 600);
  };

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed || !conversation) return;

    const newMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      message: trimmed,
      time: timeLabel(new Date()),
    };

    pushMessage(newMessage);
    setMessageText("");
    mockVendorReply();
  };

  if (!conversation || !threadId) return null;

  return (
    <section className="space-y-4 lg:hidden">
      <ConversationHeader
        vendorName={conversation.vendorName}
        avatar={conversation.avatar}
        rating={conversation.rating}
        reviewCount={conversation.reviewCount}
        lastActiveLabel={conversation.lastActiveLabel}
        className="px-4"
        leftSlot={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={() => router.push("/vendor/(dashboard)/messages")}
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

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex h-155 flex-col">
          <MessageHistory
            messages={conversation.messages}
            isTyping={typing}
            typingLabel={`${conversation.vendorName} is typing...`}
            className="px-4 py-4"
          />

          <MessageComposer
            value={messageText}
            onChange={setMessageText}
            onSend={handleSend}
          />
        </div>
      </div>
    </section>
  );
};

export default MobileThreadPage;
