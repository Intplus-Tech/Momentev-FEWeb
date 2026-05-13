"use server";

import { fetchWithAuthRetry } from "@/lib/actions/auth-retry";
import { getAccessToken } from "@/lib/session";
import type { NotificationListResponse } from "@/types/notification";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Fetch notifications
 * GET /api/v1/notifications
 */
export async function fetchNotifications(
  page = 1,
  limit = 10,
  status: "active" | "unread" | "read" | "archived" | "all" = "active",
  type?: string
): Promise<ActionResponse<NotificationListResponse>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status,
      ...(type && { type }),
    });

    const { response, error } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/notifications?${queryParams.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })
    );

    console.log("[DEBUG] fetchNotifications Response Object:", response?.status, response?.ok);

    if (!response) {
      console.log("[DEBUG] fetchNotifications No Response:", error);
      return { success: false, error: error || "Authentication required" };
    }

    if (!response.ok) {
      console.error("[DEBUG] fetchNotifications Error Status:", response.status, response.statusText);
      if (response.status === 401) return { success: false, error: "Session expired" };
      return {
        success: false,
        error: `Failed to fetch notifications: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log("[DEBUG] fetchNotifications Data:", JSON.stringify(data, null, 2));
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetch unread notification count
 * GET /api/v1/notifications/unread-count
 */
export async function fetchUnreadCount(): Promise<ActionResponse<{ count: number }>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const { response, error } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/notifications/unread-count`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })
    );

    console.log("[DEBUG] fetchUnreadCount Response Object:", response?.status, response?.ok);

    if (!response) {
      console.log("[DEBUG] fetchUnreadCount No Response:", error);
      return { success: false, error: error || "Authentication required" };
    }

    if (!response.ok) {
      console.error("[DEBUG] fetchUnreadCount Error Status:", response.status, response.statusText);
      if (response.status === 401) return { success: false, error: "Session expired" };
      return {
        success: false,
        error: `Failed to fetch unread count: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log("[DEBUG] fetchUnreadCount Data:", JSON.stringify(data, null, 2));
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Mark all notifications as read
 * PATCH /api/v1/notifications/read
 */
export async function markAllAsRead(): Promise<ActionResponse> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const { response, error } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/notifications/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ all: true }),
      })
    );

    if (!response) {
      return { success: false, error: error || "Authentication required" };
    }

    if (!response.ok) {
      if (response.status === 401) return { success: false, error: "Session expired" };
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        error: data.message || `Failed to mark all as read (${response.status})`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Mark a single notification as read
 * PATCH /api/v1/notifications/:id/read
 */
export async function markAsRead(id: string): Promise<ActionResponse> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const { response, error } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    );

    if (!response) {
      return { success: false, error: error || "Authentication required" };
    }

    if (!response.ok) {
      if (response.status === 401) return { success: false, error: "Session expired" };
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        error: data.message || `Failed to mark as read (${response.status})`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Archive a notification
 * PATCH /api/v1/notifications/:id/archive
 */
export async function archiveNotification(id: string): Promise<ActionResponse> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const { response, error } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/notifications/${id}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    );

    if (!response) {
      return { success: false, error: error || "Authentication required" };
    }

    if (!response.ok) {
      if (response.status === 401) return { success: false, error: "Session expired" };
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        error: data.message || `Failed to archive notification (${response.status})`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error archiving notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
