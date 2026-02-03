
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
  // Populated user details (for vendor view)
  user?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  // Populated vendor details (for client view)
  vendor?: {
    businessName: string;
    avatar?: string;
  };
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  vendorId: string;
  senderUserId: string;
  senderSide: ChatUserSide;
  type: 'text' | 'file' | 'system';  // Backend message types
  text?: string;
  attachments?: any[];
  clientMessageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageRequest {
  type: 'text' | 'file' | 'system';  // Backend only accepts these types
  text?: string;
  clientMessageId: string;
  attachments?: { fileId: string }[];
}

export interface ChatAttachment {
  _id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface ApiListResponse<T> {
  message: string;
  data: T[];
}

export interface ApiSingleResponse<T> {
  message: string;
  data: T;
}
