"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  conversations as conversationSeed,
  defaultActiveThreadId,
  messageThreads,
  type ConversationMessage,
  type ConversationMeta,
  type MessageThread,
} from "./data";

import { ConversationHeader } from "./_components/conversation-header";
import { MessageComposer } from "./_components/message-composer";
import { MessageHistory } from "./_components/message-history";
import { ThreadSidebar } from "./_components/thread-sidebar";

const timeLabel = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const makeConversationState = (seed: Record<string, ConversationMeta>) => {
  return Object.fromEntries(
    Object.entries(seed).map(([key, value]) => [
      key,
      {
        ...value,
        messages: [...value.messages],
      },
    ])
  );
};

const ClientMessagesPage = () => {
  const router = useRouter();
  const isMobile = useIsMobile();

  const [threads, setThreads] = useState<MessageThread[]>(() =>
    messageThreads.map((thread) => ({
      ...thread,
      isActive: thread.id === defaultActiveThreadId,
      unreadCount: thread.unreadCount ?? 0,
    }))
  );
  const [conversationMap, setConversationMap] = useState<
    Record<string, ConversationMeta>
  >(() => makeConversationState(conversationSeed));
  const [activeThreadId, setActiveThreadId] = useState(defaultActiveThreadId);
  const [query, setQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [typingThreadId, setTypingThreadId] = useState<string | null>(null);
  const pendingReplyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeConversation = conversationMap[activeThreadId];

  const filteredThreads = useMemo(() => {
    const q = query.toLowerCase();
    return threads.filter((thread) =>
      thread.vendorName.toLowerCase().includes(q)
    );
  }, [query, threads]);

  useEffect(() => {
    return () => {
      if (pendingReplyRef.current) {
        clearTimeout(pendingReplyRef.current);
      }
    };
  }, []);

  const setActiveThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setThreads((prev) =>
      prev.map((thread) => ({
        ...thread,
        isActive: thread.id === threadId,
        unreadCount: thread.id === threadId ? 0 : thread.unreadCount ?? 0,
      }))
    );
  };

  const updateThreadPreview = (
    threadId: string,
    snippet: string,
    time: string
  ) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              snippet,
              time,
            }
          : thread
      )
    );
  };

  const pushMessage = (threadId: string, message: ConversationMessage) => {
    setConversationMap((prev) => {
      const current = prev[threadId];
      const updatedMessages = [...current.messages, message];

      return {
        ...prev,
        [threadId]: {
          ...current,
          messages: updatedMessages,
          lastActiveLabel: `Today | ${message.time}`,
        },
      };
    });

    updateThreadPreview(threadId, message.message, message.time);
  };

  const mockVendorReply = (threadId: string) => {
    setTypingThreadId(threadId);

    if (pendingReplyRef.current) {
      clearTimeout(pendingReplyRef.current);
    }

    pendingReplyRef.current = setTimeout(() => {
      const reply: ConversationMessage = {
        id: `vendor-${Date.now()}`,
        sender: "vendor",
        message: "Thanks for the update! I will review and confirm soon.",
        time: timeLabel(new Date()),
      };

      pushMessage(threadId, reply);
      setTypingThreadId(null);
    }, 900 + Math.random() * 600);
  };

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    const now = timeLabel(new Date());
    const newMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      message: trimmed,
      time: now,
    };

    pushMessage(activeThreadId, newMessage);
    setMessageText("");
    mockVendorReply(activeThreadId);
  };

  const handleThreadClick = (threadId: string) => {
    if (isMobile) {
      router.push(`/client/(dashboard)/messages/${threadId}`);
      return;
    }

    setActiveThread(threadId);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">
          {threads.length} Active conversations
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <ThreadSidebar
          threads={filteredThreads}
          activeThreadId={activeThreadId}
          query={query}
          onQueryChange={setQuery}
          onThreadClick={handleThreadClick}
        />

        <div className="hidden rounded-2xl border bg-card shadow-sm lg:block">
          <ConversationHeader
            vendorName={activeConversation?.vendorName}
            avatar={activeConversation?.avatar}
            rating={activeConversation?.rating}
            reviewCount={activeConversation?.reviewCount}
            lastActiveLabel={activeConversation?.lastActiveLabel}
            actions={
              <>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </>
            }
          />

          <div className="flex h-155 flex-col">
            <MessageHistory
              messages={activeConversation?.messages ?? []}
              isTyping={typingThreadId === activeThreadId}
              typingLabel={`${
                activeConversation?.vendorName ?? "Vendor"
              } is typing...`}
            />
            <MessageComposer
              value={messageText}
              onChange={setMessageText}
              onSend={handleSend}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientMessagesPage;
