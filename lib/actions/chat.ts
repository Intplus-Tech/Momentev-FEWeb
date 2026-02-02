'use server';

import { getAccessToken, tryRefreshToken } from '@/lib/session';
import type {
  ChatConversation,
  ChatMessage,
  CreateMessageRequest,
  ApiListResponse,
  ApiSingleResponse
} from '@/types/chat';

const API_BASE = process.env.BACKEND_URL;

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  try {
    if (!API_BASE) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers, cache: 'no-store' });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Log full error response for debugging
      console.error('[fetchWithAuth] Error response:', {
        status: response.status,
        statusText: response.statusText,
        data: JSON.stringify(data, null, 2),
      });

      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          // Retry
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${refreshResult.token}`,
          };
          const retryResponse = await fetch(url, { ...options, headers: retryHeaders, cache: 'no-store' });
          const retryData = await retryResponse.json().catch(() => null);

          if (retryResponse.ok) {
            return { success: true, data: retryData.data, message: retryData.message };
          }
          console.error('[fetchWithAuth] Retry error:', retryData);
          return { success: false, error: retryData?.message || `Request failed (${retryResponse.status})`, details: retryData };
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }
      return { success: false, error: data?.message || `Request failed (${response.status})`, details: data };
    }

    return { success: true, data: data.data, message: data.message };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

/**
 * Get all conversations for the authenticated user/vendor
 * GET /api/v1/chats
 */
export async function getConversations() {
  const result = await fetchWithAuth('/api/v1/chats');
  return result;
}

/**
 * Get or create a conversation with a specific vendor
 * POST /api/v1/chats/vendor/{vendorId}
 */
export async function getOrCreateConversation(vendorId: string) {
  const result = await fetchWithAuth(`/api/v1/chats/vendor/${vendorId}`, { method: 'POST' });
  return result;
}

/**
 * Get messages for a conversation
 * GET /api/v1/chats/{conversationId}/messages
 * Also resolves attachment fileIds to full file details
 */
export async function getMessages(conversationId: string, limit: number = 30, before?: string) {
  const query = new URLSearchParams({ limit: limit.toString() });
  if (before) query.append('before', before);

  const result = await fetchWithAuth(`/api/v1/chats/${conversationId}/messages?${query.toString()}`);

  // Resolve attachment fileIds to full file details
  if (result.success && result.data) {
    const messages = result.data as any[];

    // Collect all unique fileIds that need resolving
    const fileIdsToResolve = new Set<string>();
    messages.forEach(msg => {
      if (msg.attachments?.length > 0) {
        msg.attachments.forEach((att: any) => {
          if (att.fileId && !att.url) {
            fileIdsToResolve.add(att.fileId);
          }
        });
      }
    });

    // Fetch all file details in parallel
    if (fileIdsToResolve.size > 0) {
      const { getFileById } = await import('./upload');
      const fileDetailsMap = new Map<string, any>();

      const filePromises = Array.from(fileIdsToResolve).map(async (fileId) => {
        const fileResult = await getFileById(fileId);
        if (fileResult.success && fileResult.data) {
          fileDetailsMap.set(fileId, fileResult.data);
        }
      });

      await Promise.all(filePromises);

      // Update message attachments with resolved file details
      messages.forEach(msg => {
        if (msg.attachments?.length > 0) {
          msg.attachments = msg.attachments.map((att: any) => {
            if (att.fileId && !att.url) {
              const fileDetails = fileDetailsMap.get(att.fileId);
              if (fileDetails) {
                return {
                  ...att,
                  url: fileDetails.url,
                  originalName: fileDetails.originalName,
                  mimeType: fileDetails.mimeType,
                  size: fileDetails.size,
                };
              }
            }
            return att;
          });
        }
      });
    }
  }

  return result;
}

/**
 * Send a message
 * POST /api/v1/chats/{conversationId}/messages
 */
export async function sendMessage(conversationId: string, payload: CreateMessageRequest) {
  const result = await fetchWithAuth(`/api/v1/chats/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!result.success) {
    console.error('[Chat] Send message failed:', result.error, result.details);
  }
  return result;
}

/**
 * Mark conversation as read
 * POST /api/v1/chats/{conversationId}/read
 */
export async function markAsRead(conversationId: string) {
  console.log('[Chat Action] markAsRead: conversationId=', conversationId);
  const result = await fetchWithAuth(`/api/v1/chats/${conversationId}/read`, { method: 'POST' });
  console.log('[Chat Action] markAsRead:', result.success ? 'Success' : result.error);
  return result;
}

/**
 * Get public vendor profile by ID
 * GET /api/v1/vendors/{vendorId}
 * Note: This is a public endpoint, no JWT required
 */
export async function getVendorPublicProfile(vendorId: string) {

  console.log("✅ [GetVendorPublicProfile] Vendor ID:", vendorId);
  try {
    if (!API_BASE) {
      return { success: false, error: 'Backend not configured' };
    }

    const url = `${API_BASE}/api/v1/vendors/${vendorId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);
    console.log("✅ [GetVendorPublicProfile] Data:", data);

    if (!response.ok) {
      return { success: false, error: data?.message || `Request failed (${response.status})` };
    }

    return { success: true, data: data.data, message: data.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

