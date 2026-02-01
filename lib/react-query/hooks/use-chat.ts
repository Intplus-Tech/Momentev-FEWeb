"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getVendorPublicProfile
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
      // Messages might need sorting or processing here depending on API order
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
    mutationFn: async ({ conversationId, payload }: { conversationId: string, payload: CreateMessageRequest, senderSide?: ChatUserSide }) => {
      const result = await sendMessage(conversationId, payload);
      if (!result.success) {
        throw new Error(result.error || "Failed to send message");
      }
      return result.data;
    },
    onMutate: async ({ conversationId, payload, senderSide = 'user' }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.chat.messages(conversationId) });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(queryKeys.chat.messages(conversationId));

      // Optimistically update to the new value
      const optimisticMessage: ChatMessage = {
        _id: `temp-${Date.now()}`,
        conversationId,
        vendorId: 'optimistic-vendor',
        senderUserId: 'me', // placeholder
        senderSide, // 'user' or 'vendor' passed from component
        type: payload.type,
        text: payload.text,
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
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKeys.chat.messages(newTodo.conversationId), context.previousMessages);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(variables.conversationId) });
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
          // Avoid duplicates
          if (existing.some((m) => m._id === newMessage._id)) return existing;

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

    socket.on("chat:message", handleMessage);
    socket.on("chat:read", handleRead);

    return () => {
      socket.emit("chat:leave", { conversationId });
      socket.off("chat:message", handleMessage);
      socket.off("chat:read", handleRead);
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
 * Returns a Map of vendorId -> VendorPublicProfile
 */
export function useVendorProfiles(vendorIds: string[]) {
  const queryClient = useQueryClient();

  // Filter out empty/duplicate IDs
  const uniqueIds = [...new Set(vendorIds.filter(Boolean))];

  // Fetch all vendor profiles in parallel
  useEffect(() => {
    uniqueIds.forEach((vendorId) => {
      // Prefetch if not already in cache
      queryClient.prefetchQuery({
        queryKey: queryKeys.vendor.profile(vendorId),
        queryFn: async () => {
          const result = await getVendorPublicProfile(vendorId);
          if (!result.success) {
            throw new Error(result.error || "Failed to fetch vendor profile");
          }
          return result.data as VendorPublicProfile;
        },
        staleTime: 5 * 60 * 1000,
      });
    });
  }, [uniqueIds.join(','), queryClient]);

  // Return a function to get vendor name by ID from cache
  const getVendorName = (vendorId: string): string => {
    const data = queryClient.getQueryData<VendorPublicProfile>(
      queryKeys.vendor.profile(vendorId)
    );
    return data?.businessProfile?.businessName || vendorId;
  };

  const getVendorAvatar = (vendorId: string): string | undefined => {
    const data = queryClient.getQueryData<VendorPublicProfile>(
      queryKeys.vendor.profile(vendorId)
    );
    return data?.profilePhoto?.url;
  };

  return { getVendorName, getVendorAvatar };
}
