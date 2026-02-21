"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getVendorPublicProfile,
  getOrCreateConversation,
} from "@/lib/actions/chat";
import { queryKeys } from "@/lib/react-query/keys";
import type { CreateMessageRequest, ChatMessage, ChatUserSide } from "@/types/chat";
import type { VendorPublicProfile } from "@/types/vendor";

/**
 * Hook to fetch all conversations
 */
export function useConversations() {
  return useQuery({
    queryKey: queryKeys.chat.conversations(),
    queryFn: async () => {
      const result = await getConversations();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch conversations");
      }
      return result.data || [];
    },
    // Refresh conversations every minute or on focus to check for new messages
    // Real-time updates should ideally be handled via socket/SSE in a full implementation
    refetchInterval: 30000,
  });
}

/**
 * Hook to fetch messages for a specific conversation
 */
export function useChatMessages(conversationId: string, limit: number = 50) {
  return useQuery({
    queryKey: queryKeys.chat.messages(conversationId),
    queryFn: async () => {
      if (!conversationId) return [];
      const result = await getMessages(conversationId, limit);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch messages");
      }
      const messages = result.data || [];
      // Sort messages by createdAt ascending (Oldest -> Newest) so newest is at the bottom
      return messages.sort((a: ChatMessage, b: ChatMessage) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
    },
    enabled: !!conversationId,
  });
}

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, payload }: {
      conversationId: string;
      payload: CreateMessageRequest;
      senderSide?: ChatUserSide;
      previewUrl?: string;
      fileMetadata?: { name: string; size: number; mimeType: string };
    }) => {
      const result = await sendMessage(conversationId, payload);
      if (!result.success) {
        throw new Error(result.error || "Failed to send message");
      }
      return result.data;
    },
    onMutate: async ({ conversationId, payload, senderSide = 'user', previewUrl, fileMetadata }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.chat.messages(conversationId) });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(queryKeys.chat.messages(conversationId));

      // Build optimistic attachment: image gets blob preview, non-image gets a typed file placeholder
      let optimisticAttachments: any[] | undefined;
      if (previewUrl) {
        // Image with local blob URL
        optimisticAttachments = [{ url: previewUrl, mimeType: 'image/jpeg', originalName: fileMetadata?.name || 'image' }];
      } else if (fileMetadata) {
        // Non-image file: no URL yet, but carry name/size/mimeType for a proper placeholder
        optimisticAttachments = [{ mimeType: fileMetadata.mimeType, originalName: fileMetadata.name, size: fileMetadata.size }];
      }

      const optimisticMessage: ChatMessage = {
        _id: payload.clientMessageId ? `temp-${payload.clientMessageId}` : `temp-${Date.now()}`,
        conversationId,
        vendorId: 'optimistic-vendor',
        senderUserId: 'me',
        senderSide,
        type: payload.type,
        text: payload.text,
        clientMessageId: payload.clientMessageId,
        attachments: optimisticAttachments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ChatMessage[]>(queryKeys.chat.messages(conversationId), (old) => {
        const existing = old ? [...old] : [];
        existing.push(optimisticMessage);
        return existing.sort((a: ChatMessage, b: ChatMessage) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError: (err, variables, context) => {
      // Roll back optimistic update on error
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKeys.chat.messages(variables.conversationId), context.previousMessages);
      }
      // Only invalidate on failure so the socket happy-path doesn't cause a redundant refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations() });
    },
    onSuccess: (_data, variables) => {
      // On success the socket will deliver the real message and update cache —
      // we only need to refresh the conversations list for the last-message preview.
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations() });
    },
  });
}

/**
 * Hook to mark conversation as read
 */
export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const result = await markAsRead(conversationId);
      if (!result.success) {
        throw new Error(result.error || "Failed to mark as read");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations() });
    },
  });
}

/**
 * Hook for real-time chat updates
 */
export function useChatRealtime(conversationId: string | undefined) {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected || !conversationId) return;

    // Join the conversation room
    socket.emit("chat:join", { conversationId });

    const handleMessage = (payload: { conversationId: string; data: ChatMessage }) => {
      if (payload.conversationId !== conversationId) return;
      const newMessage = payload.data;

      queryClient.setQueryData<ChatMessage[]>(
        queryKeys.chat.messages(conversationId),
        (old) => {
          const existing = old ? [...old] : [];

          // Avoid exact duplicates by _id
          if (existing.some((m) => m._id === newMessage._id)) return existing;

          // Replace an optimistic message that shares the same clientMessageId
          // This is what eliminates the sent-message duplicate flash
          if (newMessage.clientMessageId) {
            const optimisticIdx = existing.findIndex(
              (m) => m.clientMessageId === newMessage.clientMessageId && m._id.startsWith('temp-')
            );
            if (optimisticIdx !== -1) {
              const updated = [...existing];
              updated[optimisticIdx] = newMessage;
              return updated.sort(
                (a: ChatMessage, b: ChatMessage) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
            }
          }

          existing.push(newMessage);
          return existing.sort(
            (a: ChatMessage, b: ChatMessage) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
      );

      // Refresh conversation list for last message preview
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations() });
    };

    const handleRead = (payload: { conversationId: string }) => {
      // When a read receipt comes in, refresh conversations (stores read status)
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations() });
    };

    // On reconnect, re-fetch messages to catch anything missed during the disconnection window
    const handleReconnect = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(conversationId) });
    };

    socket.on("chat:message", handleMessage);
    socket.on("chat:read", handleRead);
    socket.io.on("reconnect", handleReconnect);

    return () => {
      socket.emit("chat:leave", { conversationId });
      socket.off("chat:message", handleMessage);
      socket.off("chat:read", handleRead);
      socket.io.off("reconnect", handleReconnect);
    };
  }, [socket, isConnected, conversationId, queryClient]);
}

/**
 * Hook to fetch vendor public profile for chat display
 */
export function useVendorProfile(vendorId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vendor.profile(vendorId || ''),
    queryFn: async () => {
      if (!vendorId) return null;
      const result = await getVendorPublicProfile(vendorId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch vendor profile");
      }
      return result.data as VendorPublicProfile;

    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes - vendor details don't change often
  });
}

/**
 * Hook to fetch multiple vendor profiles for sidebar display
 * Uses useQueries to properly trigger re-renders when data loads
 */
export function useVendorProfiles(vendorIds: string[]): {
  profiles: Record<string, VendorPublicProfile | undefined>;
  isLoading: boolean;
} {
  // Filter out empty/duplicate IDs
  const uniqueIds = [...new Set(vendorIds.filter(Boolean))];

  // Use useQueries to fetch all vendor profiles in parallel and trigger re-renders
  const queries = useQueries({
    queries: uniqueIds.map((vendorId) => ({
      queryKey: queryKeys.vendor.profile(vendorId),
      queryFn: async () => {
        const result = await getVendorPublicProfile(vendorId);
        if (!result.success) {
          throw new Error(result.error || "Failed to fetch vendor profile");
        }
        return result.data as VendorPublicProfile;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  // Check if any query is still loading
  const isLoading = queries.some((q) => q.isLoading);

  // Build a map of vendorId -> VendorPublicProfile
  const profiles: Record<string, VendorPublicProfile | undefined> = {};
  uniqueIds.forEach((vendorId, index) => {
    profiles[vendorId] = queries[index]?.data;
  });

  return { profiles, isLoading };
}

/**
 * Hook to get or create a conversation with a vendor
 * POST /api/v1/chats/vendor/{vendorId}
 */
export function useStartVendorConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      const result = await getOrCreateConversation(vendorId);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to start conversation");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations() });
    },
  });
}
