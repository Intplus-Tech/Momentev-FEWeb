"use client";

import { useMemo, useState } from "react";
import { useSelectedLayoutSegment, useRouter } from "next/navigation";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  useConversations,
  useVendorProfiles,
} from "@/lib/react-query/hooks/use-chat";
import type { ChatConversation } from "@/types/chat";
import type { MessageThread } from "./data";
import { ThreadSidebar } from "./_components/thread-sidebar";
import { cn } from "@/lib/utils";

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

  // Get all vendor IDs from conversations and fetch their profiles
  const vendorIds = conversations.map((c: ChatConversation) => c.vendorId);
  const { profiles: vendorProfiles, isLoading: isLoadingProfiles } =
    useVendorProfiles(vendorIds);

  const mappedThreads: MessageThread[] = useMemo(() => {
    return conversations
      .map((c: ChatConversation) => {
        const profile = vendorProfiles[c.vendorId];
        const isLoading = !profile && isLoadingProfiles;
        const vendorName =
          profile?.businessProfile?.businessName ||
          (isLoading ? undefined : "Vendor");
        const vendorAvatar = profile?.profilePhoto?.url;

        return {
          id: c._id,
          vendorName,
          snippet: c.lastMessagePreview || "No messages",
          day: c.lastMessageAt
            ? format(new Date(c.lastMessageAt), "MMM d")
            : "",
          time: c.lastMessageAt ? format(new Date(c.lastMessageAt), "p") : "",
          avatar: vendorAvatar,
          unreadCount: 0,
          isActive: c._id === activeThreadId,
        };
      })
      .filter((t: MessageThread) =>
        (t.vendorName || "").toLowerCase().includes(query.toLowerCase()),
      );
  }, [conversations, activeThreadId, query, vendorProfiles]);

  const handleThreadClick = (threadId: string) => {
    router.push(`/client/messages/${threadId}`);
  };

  // Mobile View Logic:
  // - If acting as "List" (Root): Show Sidebar, Hide Children
  // - If acting as "Detail" (Thread): Hide Sidebar, Show Children
  // Desktop View Logic:
  // - Show Both side-by-side

  const isDetailView = !!activeThreadId;

  return (
    <section className="space-y-4 lg:space-y-2 h-[85vh] xl:h-fit">
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
