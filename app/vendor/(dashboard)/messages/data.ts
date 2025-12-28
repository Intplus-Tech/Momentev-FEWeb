export type MessageThread = {
  id: string;
  vendorName: string;
  snippet: string;
  day: string;
  time: string;
  avatar?: string;
  unreadCount?: number;
  isActive?: boolean;
};

export type ConversationMessage = {
  id: string;
  sender: "vendor" | "user";
  message: string;
  time: string;
};

export type ConversationMeta = {
  vendorName: string;
  rating: number;
  reviewCount: number;
  avatar?: string;
  lastActiveLabel: string;
  messages: ConversationMessage[];
};

export const messageThreads: MessageThread[] = [
  {
    id: "retro-shots",
    vendorName: "Retro Shots UK",
    snippet: "Hey! Did you finish the Hi-Fi wireframes for flora app design?",
    day: "Today",
    time: "05:30 PM",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80",
    unreadCount: 4,
  },
  {
    id: "vintage-lens",
    vendorName: "Vintage Lens Co",
    snippet: "Hey! Did you finish the Hi-Fi wireframes for flora app design?",
    day: "Today",
    time: "05:30 PM",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80",
    isActive: true,
  },
  {
    id: "flora-studios",
    vendorName: "Flora Studios",
    snippet: "Hey! Did you finish the Hi-Fi wireframes for flora app design?",
    day: "Today",
    time: "05:20 PM",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=120&h=120&q=80",
  },
];
export const defaultActiveThreadId = "vintage-lens";

const sharedMessages: ConversationMessage[] = [
  {
    id: "msg-1",
    sender: "vendor",
    message: "Oh, hello! All perfectly, I will check it and get back to you soon.",
    time: "04:35 PM",
  },
  {
    id: "msg-2",
    sender: "user",
    message: "Oh, hello! All perfectly, I will check it and get back to you soon.",
    time: "04:36 PM",
  },
  {
    id: "msg-3",
    sender: "vendor",
    message: "Oh, hello! All perfectly, I will check it and get back to you soon.",
    time: "04:45 PM",
  },
  {
    id: "msg-4",
    sender: "user",
    message: "Oh, hello! All perfectly, I will check it and get back to you soon.",
    time: "04:45 PM",
  },
  {
    id: "msg-5",
    sender: "user",
    message: "Oh, hello! All perfectly, I will check it and get back to you soon.",
    time: "04:45 PM",
  },
];

export const conversations: Record<string, ConversationMeta> = {
  "retro-shots": {
    vendorName: "Retro Shots UK",
    rating: 4.9,
    reviewCount: 112,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80",
    lastActiveLabel: "Today | 05:30 PM",
    messages: sharedMessages,
  },
  "vintage-lens": {
    vendorName: "Vintage Lens Co",
    rating: 4.7,
    reviewCount: 89,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80",
    lastActiveLabel: "Today | 05:32 PM",
    messages: sharedMessages,
  },
  "flora-studios": {
    vendorName: "Flora Studios",
    rating: 4.8,
    reviewCount: 64,
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=120&h=120&q=80",
    lastActiveLabel: "Today | 05:20 PM",
    messages: sharedMessages,
  },
};
