
export type ChatUserSide = 'user' | 'vendor';

export interface ChatConversation {
  _id: string;
  vendorId: string;
  userId: string;
  counterpartyType: string;
  status: 'open' | 'archived' | 'closed';
  lastMessageId?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  vendorLastReadAt?: string;
  userLastReadAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  vendorId: string;
  senderUserId: string;
  senderSide: ChatUserSide;
  type: 'text' | 'image' | 'file';
  text?: string;
  attachments?: any[];
  clientMessageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageRequest {
  type: 'text' | 'image' | 'file';
  text?: string;
  clientMessageId: string;
}

export interface ApiListResponse<T> {
  message: string;
  data: T[];
}

export interface ApiSingleResponse<T> {
  message: string;
  data: T;
}
