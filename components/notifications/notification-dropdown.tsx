"use client";

import { useNotifications, useMarkAllAsRead } from "@/hooks/api/use-notifications";
import { NotificationItem } from "./notification-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BellOff, Check } from "lucide-react";

export function NotificationDropdown({ onClose }: { onClose?: () => void }) {
  const { data, isLoading } = useNotifications("active", 1, 10);
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const notifications = data?.data || [];
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="w-80 flex flex-col sm:w-96">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h4 className="font-semibold">Notifications</h4>
        {hasUnread && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-2 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full min-h-[300px]">
            <BellOff className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">No new notifications</p>
            <p className="text-xs mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification._id} 
                notification={notification} 
                onClosePopover={onClose}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
