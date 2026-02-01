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
          return { success: false, error: retryData?.message || `Request failed (${retryResponse.status})` };
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }
      return { success: false, error: data?.message || `Request failed (${response.status})` };
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
  console.log('[Chat Action] getConversations: Fetching all conversations...');
  const result = await fetchWithAuth('/api/v1/chats');
  console.log('[Chat Action] getConversations:', result.success ? `Found ${result.data?.length || 0} conversations` : result.error);
  if (result.success && result.data?.length > 0) {
    console.log('[Chat Action] getConversations - First conversation sample:', JSON.stringify(result.data[0], null, 2));
  }
  return result;
}

/**
 * Get or create a conversation with a specific vendor
 * POST /api/v1/chats/vendor/{vendorId}
 */
export async function getOrCreateConversation(vendorId: string) {
  console.log('[Chat Action] getOrCreateConversation: vendorId=', vendorId);
  const result = await fetchWithAuth(`/api/v1/chats/vendor/${vendorId}`, { method: 'POST' });
  console.log('[Chat Action] getOrCreateConversation:', result.success ? `Conversation ${result.data?._id}` : result.error);
  return result;
}

/**
 * Get messages for a conversation
 * GET /api/v1/chats/{conversationId}/messages
 */
export async function getMessages(conversationId: string, limit: number = 30, before?: string) {
  console.log('[Chat Action] getMessages:', { conversationId, limit, before });
  const query = new URLSearchParams({ limit: limit.toString() });
  if (before) query.append('before', before);

  const result = await fetchWithAuth(`/api/v1/chats/${conversationId}/messages?${query.toString()}`);
  console.log('[Chat Action] getMessages:', result.success ? `Found ${result.data?.length || 0} messages` : result.error);
  return result;
}

/**
 * Send a message
 * POST /api/v1/chats/{conversationId}/messages
 */
export async function sendMessage(conversationId: string, payload: CreateMessageRequest) {
  console.log('[Chat Action] sendMessage:', {
    conversationId,
    type: payload.type,
    hasText: !!payload.text,
    attachments: payload.attachments,
    clientMessageId: payload.clientMessageId
  });
  console.log('[Chat Action] sendMessage payload:', JSON.stringify(payload));
  const result = await fetchWithAuth(`/api/v1/chats/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  console.log('[Chat Action] sendMessage result:', result.success ? `Message ${result.data?._id} sent` : result.error, result);
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

