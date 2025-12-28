import { Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { MessageThread } from "../data";

export type ThreadSidebarProps = {
  threads: MessageThread[];
  activeThreadId?: string;
  query: string;
  onQueryChange: (value: string) => void;
  onThreadClick: (threadId: string) => void;
};

export const ThreadSidebar = ({
  threads,
  activeThreadId,
  query,
  onQueryChange,
  onThreadClick,
}: ThreadSidebarProps) => {
  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="space-y-3 border-b px-4 pb-4 pt-5">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Inbox</span>
          <span className="text-xs">Updated just now</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search vendor"
            className="h-10 rounded-xl bg-muted/60 pl-9"
          />
        </div>
      </div>

      <ScrollArea className="h-155">
        <div className="divide-y">
          {threads.map((thread) => {
            const isActive = thread.id === activeThreadId;

            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => onThreadClick(thread.id)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 transition",
                  "hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  isActive ? "bg-muted/80" : "bg-transparent"
                )}
              >
                <Avatar size="lg">
                  {thread.avatar ? (
                    <AvatarImage src={thread.avatar} alt={thread.vendorName} />
                  ) : (
                    <AvatarFallback>
                      {thread.vendorName
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-1 flex-col gap-1 text-left">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {thread.vendorName}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {thread.time}
                    </span>
                  </div>
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {thread.snippet}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {thread.day}
                    </span>
                    {thread.unreadCount ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                        {thread.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
