import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
} from "@/lib/actions/notifications";
import { toast } from "sonner";

const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  list: (status: string) => [...NOTIFICATION_KEYS.all, "list", status] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, "unread-count"] as const,
};

export function useNotifications(
  status: "active" | "unread" | "read" | "archived" | "all" = "active",
  page = 1,
  limit = 10
) {
  return useQuery({
    queryKey: [...NOTIFICATION_KEYS.list(status), page, limit],
    queryFn: async () => {
      const response = await fetchNotifications(page, limit, status);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch notifications");
      }
      return response.data;
    },
    refetchOnWindowFocus: true,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: async () => {
      const response = await fetchUnreadCount();
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch unread count");
      }
      return response.data;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // 60 seconds
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await markAsRead(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to mark as read");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error marking notification as read");
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await markAllAsRead();
      if (!response.success) {
        throw new Error(response.error || "Failed to mark all as read");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      toast.success("All notifications marked as read");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error marking all as read");
    },
  });
}

export function useArchiveNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await archiveNotification(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to archive notification");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error archiving notification");
    },
  });
}

