export type ServiceLineItem = {
  id: string;
  name: string;
  quantity: number;
  hours: number;
  rate: number;
};

export type PaymentTerm = {
  label: string;
  amount: string;
};

export type Service = {
  id: string;
  name: string;
  status: "active" | "inactive";
  category: string;
  subcategory: string;
  viewCount: number;
  bookings: number;
  price: string;
  seasonality?: string;
  defaultOpen?: boolean;
  lineItems: ServiceLineItem[];
  paymentTerms: PaymentTerm[];
  quoteValidity: string;
  quoteValidityOptions: string[];
  personalMessage: string;
};

export const services: Service[] = [
  {
    id: "svc-1",
    name: "Wedding Photography Package",
    status: "active",
    category: "Photography",
    subcategory: "Wedding",
    viewCount: 1342,
    bookings: 24,
    price: "£3,450",
    seasonality: undefined,
    defaultOpen: false,
    lineItems: [
      {
        id: "svc-1-li-1",
        name: "Full Day Photography Coverage",
        quantity: 1,
        hours: 8,
        rate: 250,
      },
      {
        id: "svc-1-li-2",
        name: "Second Photographer",
        quantity: 1,
        hours: 8,
        rate: 100,
      },
    ],
    paymentTerms: [
      { label: "Deposit", amount: "50% (£1,725)" },
      { label: "Balance", amount: "50% (£1,725)" },
    ],
    quoteValidity: "7 days from sending",
    quoteValidityOptions: [
      "7 days from sending",
      "14 days from sending",
      "30 days from sending",
    ],
    personalMessage:
      "Hi Team, I'd love to capture your product launch! My style blends documentary storytelling with bold editorial portraits.",
  },
  {
    id: "svc-2",
    name: "Corporate Catering Package",
    status: "active",
    category: "Catering",
    subcategory: "Corporate",
    viewCount: 892,
    bookings: 12,
    price: "£1,830",
    seasonality: "Seasonal (Jan-Mar)",
    defaultOpen: true,
    lineItems: [
      {
        id: "svc-2-li-1",
        name: "Executive Buffet",
        quantity: 1,
        hours: 6,
        rate: 180,
      },
      {
        id: "svc-2-li-2",
        name: "On-site Chef Team",
        quantity: 1,
        hours: 6,
        rate: 125,
      },
    ],
    paymentTerms: [
      { label: "Deposit", amount: "40% (£732)" },
      { label: "Balance", amount: "60% (£1,098)" },
    ],
    quoteValidity: "10 days from sending",
    quoteValidityOptions: ["5 days from sending", "10 days from sending"],
    personalMessage:
      "Thanks for considering us! This menu balances vibrant flavors with corporate polish—happy to tailor specific dietary requirements.",
  },
  {
    id: "svc-3",
    name: "Product Photoshoot Package",
    status: "inactive",
    category: "Photography",
    subcategory: "Commercial",
    viewCount: 512,
    bookings: 8,
    price: "£2,150",
    seasonality: undefined,
    defaultOpen: false,
    lineItems: [
      {
        id: "svc-3-li-1",
        name: "Creative Direction Session",
        quantity: 1,
        hours: 3,
        rate: 150,
      },
      {
        id: "svc-3-li-2",
        name: "Studio Shoot",
        quantity: 1,
        hours: 6,
        rate: 220,
      },
    ],
    paymentTerms: [
      { label: "Deposit", amount: "30% (£645)" },
      { label: "Balance", amount: "70% (£1,505)" },
    ],
    quoteValidity: "30 days from sending",
    quoteValidityOptions: ["14 days from sending", "30 days from sending"],
    personalMessage:
      "Perfect for product reveals—includes direction, styling, and high-res delivery within 5 business days.",
  },
];
