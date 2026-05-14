"use client";

import {
  Info,
  Calendar,
  CreditCard,
  FileText,
  MessageSquare,
  HelpCircle,
  Star,
  Bell
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/types/notification";
import { useMarkAsRead } from "@/hooks/api/use-notifications";
import { cn } from "@/lib/utils";

const iconMap = {
  system: Info,
  booking: Calendar,
  payment: CreditCard,
  quote: FileText,
  chat: MessageSquare,
  support: HelpCircle,
  review: Star,
};

interface NotificationItemProps {
  notification: Notification;
  onClosePopover?: () => void;
}

export function NotificationItem({ notification, onClosePopover }: NotificationItemProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: markAsRead } = useMarkAsRead();

  const Icon = iconMap[notification.type] || Bell;

  const shouldRoute = notification.type !== "system" && notification.redirectUrl;

  const handleClick = (e?: React.MouseEvent) => {
    // If the event is from a direct click on the wrapper, we allow it.
    // We don't need to stopPropagation because this is the outermost clickable element.
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    if (shouldRoute) {
      let finalUrl = notification.redirectUrl!;
      
      // Determine the active role prefix
      const isClient = pathname.startsWith("/client");
      const isVendor = pathname.startsWith("/vendor");
      const isAdmin = pathname.startsWith("/admin");
      
      const rolePrefix = isVendor ? "/vendor" : isAdmin ? "/admin" : isClient ? "/client" : "";

      // Frontend route translation map for Client side
      // The backend returns raw entity paths (e.g. /customer-requests/123), 
      // but the Client UI uses specific dashboard paths without [id] routes.
      if (isClient) {
        if (finalUrl.startsWith("/customer-requests")) {
          finalUrl = "/requests"; // Routes to /client/requests
        } else if (finalUrl.startsWith("/quotes")) {
          finalUrl = "/requests/quotes"; // Routes to /client/requests/quotes (Quotes Inbox)
        } else if (finalUrl.startsWith("/quote-requests")) {
          finalUrl = "/quote-requests"; // Routes to /client/quote-requests
        }
      }
      
      // Prepend the role prefix if it doesn't already exist
      if (rolePrefix && !finalUrl.startsWith(rolePrefix)) {
        finalUrl = `${rolePrefix}${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
      }

      router.push(finalUrl);
    }

    if (onClosePopover) {
      onClosePopover();
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the item click (routing) from triggering
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-4 relative border-b last:border-0",
        !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
      )}
    >
      {!notification.isRead && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
      )}
      
      <div className="flex-shrink-0 mt-1 pl-1">
        <Icon className={cn(
          "h-5 w-5",
          !notification.isRead ? "text-blue-500" : "text-muted-foreground"
        )} />
      </div>

      <div className="flex-1 space-y-1 overflow-hidden">
        <p className="text-sm font-medium leading-none truncate">
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground pt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-1.5">
          {shouldRoute && (
            <button
              onClick={handleClick}
              className="text-xs font-medium cursor-pointer text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 whitespace-nowrap"
            >
              View
            </button>
          )}
          
          {!notification.isRead && (
            <button
              onClick={handleMarkAsRead}
              className="text-xs font-medium cursor-pointer text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 whitespace-nowrap"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
