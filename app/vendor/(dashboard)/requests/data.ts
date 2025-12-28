export type QuoteRequestStatus = "new" | "in-progress" | "awaiting" | "responded";

export type QuoteRequestAction = {
  label: string;
  tone: "primary" | "primaryOutline" | "secondary" | "danger";
};

export type QuoteRequest = {
  id: string;
  company: string;
  eventName: string;
  eventDate: string; // ISO date
  budgetRange: string;
  guests: number;
  location: string;
  note: string;
  receivedAt: string; // ISO timestamp
  status: QuoteRequestStatus;
  urgent?: boolean;
  helperText?: string;
  helperTone?: "danger" | "warning" | "muted";
  responseLabel?: string;
  actions?: QuoteRequestAction[];
  accepted?: boolean;
  declined?: boolean;
};

const defaultActionsByStatus: Record<QuoteRequestStatus, QuoteRequestAction[]> = {
  new: [
    { label: "Create Quote", tone: "primary" },
    { label: "Message Client", tone: "secondary" },
    { label: "Decline", tone: "danger" },
  ],
  "in-progress": [
    { label: "Send Quote", tone: "primary" },
    { label: "Message Client", tone: "secondary" },
    { label: "Decline", tone: "danger" },
  ],
  awaiting: [
    { label: "Send Reminder", tone: "primaryOutline" },
    { label: "Message Client", tone: "secondary" },
    { label: "Decline", tone: "danger" },
  ],
  responded: [
    { label: "Send Reminder", tone: "primaryOutline" },
    { label: "Message Client", tone: "secondary" },
    { label: "Decline", tone: "danger" },
  ],
};

const makeRequest = (request: Omit<QuoteRequest, "actions"> & { actions?: QuoteRequestAction[] }): QuoteRequest => ({
  ...request,
  actions: request.actions ?? defaultActionsByStatus[request.status],
});

export const quoteRequests: QuoteRequest[] = [
  makeRequest({
    id: "QR-1001",
    company: "Tech Startup Ltd",
    eventName: "Product Launch Event",
    eventDate: "2025-12-04",
    budgetRange: "£3,000-£5,000",
    guests: 200,
    location: "London Convention Centre",
    note: "Need full day coverage with 2 photographers and drone footage",
    receivedAt: "2025-10-26T08:30:00Z",
    status: "new",
    urgent: true,
    helperText: "Expires in 3 hours",
    helperTone: "danger",
  }),
  makeRequest({
    id: "QR-1002",
    company: "Blue Horizon Agency",
    eventName: "Executive Retreat",
    eventDate: "2025-11-15",
    budgetRange: "£4,500-£6,000",
    guests: 120,
    location: "Brighton Pavilion",
    note: "Intimate winter wedding, natural candid style preferred",
    receivedAt: "2025-10-26T06:10:00Z",
    status: "in-progress",
    helperText: "Received 2 hours ago",
    helperTone: "muted",
  }),
  makeRequest({
    id: "QR-1003",
    company: "Founders Collective",
    eventName: "Investor Summit",
    eventDate: "2025-11-22",
    budgetRange: "£7,500-£9,000",
    guests: 320,
    location: "Manchester Exchange",
    note: "Hybrid coverage with livestream and b-roll interviews",
    receivedAt: "2025-10-25T17:45:00Z",
    status: "awaiting",
    responseLabel: "Waiting for client",
    accepted: true,
  }),
  makeRequest({
    id: "QR-1004",
    company: "Northwind Events",
    eventName: "Annual Awards Night",
    eventDate: "2025-11-30",
    budgetRange: "£5,000-£7,500",
    guests: 260,
    location: "Edinburgh Assembly Rooms",
    note: "Need on-site editing for highlight reel",
    receivedAt: "2025-10-25T11:20:00Z",
    status: "responded",
    responseLabel: "Awaiting approval",
    accepted: true,
  }),
  makeRequest({
    id: "QR-1005",
    company: "Aurora Weddings",
    eventName: "Winter Wedding",
    eventDate: "2026-01-18",
    budgetRange: "£6,000-£8,000",
    guests: 180,
    location: "Lake District Manor",
    note: "Focus on documentary storytelling and film photography",
    receivedAt: "2025-10-24T13:05:00Z",
    status: "new",
  }),
  makeRequest({
    id: "QR-1006",
    company: "Urban Makers",
    eventName: "Product Showcase",
    eventDate: "2025-12-11",
    budgetRange: "£4,000-£5,500",
    guests: 150,
    location: "Shoreditch Studios",
    note: "Need social-first edits delivered within 48 hours",
    receivedAt: "2025-10-24T09:40:00Z",
    status: "in-progress",
    declined: true,
    helperText: "Declined on Oct 20",
    helperTone: "muted",
  }),
  makeRequest({
    id: "QR-1007",
    company: "Riverstone Hospitality",
    eventName: "Holiday Gala",
    eventDate: "2025-12-22",
    budgetRange: "£8,000-£10,000",
    guests: 410,
    location: "Bristol Harbour Hotel",
    note: "Cinematic highlight video with voice-over interviews",
    receivedAt: "2025-10-23T15:25:00Z",
    status: "awaiting",
    responseLabel: "Client reviewing",
    accepted: true,
  }),
  makeRequest({
    id: "QR-1008",
    company: "Atlas Logistics",
    eventName: "New HQ Opening",
    eventDate: "2025-11-05",
    budgetRange: "£5,500-£7,000",
    guests: 240,
    location: "Birmingham Innovation Hub",
    note: "Need expedited delivery for press releases",
    receivedAt: "2025-10-23T07:50:00Z",
    status: "new",
    urgent: true,
    helperText: "Respond today",
    helperTone: "warning",
  }),
];
