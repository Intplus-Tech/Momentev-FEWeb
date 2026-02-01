"use client";

import { useMemo, useState } from "react";
import { useSelectedLayoutSegment, useRouter } from "next/navigation";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

import { useConversations } from "@/lib/react-query/hooks/use-chat";
import type { ChatConversation } from "@/types/chat";
import type { MessageThread } from "./data";
import { ThreadSidebar } from "./_components/thread-sidebar";
import { cn } from "@/lib/utils";

const mapConversationToThread = (
  conv: ChatConversation,
  activeId: string | null,
): MessageThread => ({
  id: conv._id,
  vendorName: conv.userId || "Customer", // Vendor sees userId/Customer
  snippet: conv.lastMessagePreview || "No messages",
  day: conv.lastMessageAt ? format(new Date(conv.lastMessageAt), "MMM d") : "",
  time: conv.lastMessageAt ? format(new Date(conv.lastMessageAt), "p") : "",
  avatar: undefined,
  unreadCount: 0,
  isActive: conv._id === activeId,
});

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const isMobile = useIsMobile();
  const activeThreadId = segment;

  const { data: conversations = [] } = useConversations();
  const [query, setQuery] = useState("");

  const mappedThreads: MessageThread[] = useMemo(() => {
    return conversations
      .map((c: ChatConversation) => mapConversationToThread(c, activeThreadId))
      .filter((t: MessageThread) =>
        t.vendorName.toLowerCase().includes(query.toLowerCase()),
      );
  }, [conversations, activeThreadId, query]);

  const handleThreadClick = (threadId: string) => {
    router.push(`/vendor/messages/${threadId}`);
  };

  const isDetailView = !!activeThreadId;

  return (
    <section className="space-y-4 lg:space-y-2">
      <div className="grid h-full gap-4 lg:grid-cols-[320px_1fr] lg:h-[calc(100vh-10rem)]">
        {/* Sidebar Column */}
        <div
          className={cn(
            "h-full overflow-hidden",
            // Mobile: Hide if reviewing a specific thread
            isDetailView ? "hidden lg:block" : "block",
          )}
        >
          <ThreadSidebar
            threads={mappedThreads}
            activeThreadId={activeThreadId || undefined}
            query={query}
            onQueryChange={setQuery}
            onThreadClick={handleThreadClick}
          />
        </div>

        {/* Content Column (Chat or Empty State) */}
        <div
          className={cn(
            "h-full overflow-hidden rounded-2xl",
            // Mobile: Hide if NO thread selected (i.e. showing list)
            !isDetailView ? "hidden lg:block" : "block",
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
