export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'system' | 'booking' | 'payment' | 'quote' | 'chat' | 'support' | 'review';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sourceType?: string;   
  sourceId?: string;     
  redirectUrl?: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  data: Notification[];
  total: number;
  page: number;
  pages: number;
}
