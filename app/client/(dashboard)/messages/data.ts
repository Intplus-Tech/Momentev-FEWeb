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
    id: "elegant-weddings",
    vendorName: "Elegant Weddings Photography",
    snippet: "Hi Sarah, I uploaded the sample timeline for your review.",
    day: "Today",
    time: "02:15 PM",
    avatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=120&h=120&q=80",
    unreadCount: 2,
  },
  {
    id: "harbor-catering",
    vendorName: "Harbor & Co. Catering",
    snippet: "Menu looks great! Shall we lock the vegetarian options?",
    day: "Today",
    time: "01:40 PM",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&h=120&q=80",
    isActive: true,
  },
  {
    id: "aurora-events",
    vendorName: "Aurora Events Styling",
    snippet: "Sending over the revised centerpiece concepts now.",
    day: "Yesterday",
    time: "09:50 PM",
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=120&h=120&q=80",
  },
];

export const defaultActiveThreadId = "harbor-catering";

const sharedMessages: ConversationMessage[] = [
  {
    id: "msg-1",
    sender: "vendor",
    message: "Thanks for the brief! I can share updated menus this afternoon.",
    time: "01:25 PM",
  },
  {
    id: "msg-2",
    sender: "user",
    message: "Perfect, we want a few gluten-free desserts if possible.",
    time: "01:27 PM",
  },
  {
    id: "msg-3",
    sender: "vendor",
    message: "Noted. I will highlight them for quick reference.",
    time: "01:30 PM",
  },
  {
    id: "msg-4",
    sender: "user",
    message: "Appreciate it!",
    time: "01:31 PM",
  },
];

export const conversations: Record<string, ConversationMeta> = {
  "elegant-weddings": {
    vendorName: "Elegant Weddings Photography",
    rating: 4.9,
    reviewCount: 132,
    avatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=120&h=120&q=80",
    lastActiveLabel: "Today | 02:15 PM",
    messages: sharedMessages,
  },
  "harbor-catering": {
    vendorName: "Harbor & Co. Catering",
    rating: 4.7,
    reviewCount: 86,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&h=120&q=80",
    lastActiveLabel: "Today | 01:40 PM",
    messages: sharedMessages,
  },
  "aurora-events": {
    vendorName: "Aurora Events Styling",
    rating: 4.8,
    reviewCount: 54,
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=120&h=120&q=80",
    lastActiveLabel: "Yesterday | 09:50 PM",
    messages: sharedMessages,
  },
};
