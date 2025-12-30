export type RequestQuoteEntry = {
  vendor: string;
  amount: string;
  rating: number;
  reviews: number;
  summary?: string;
};

export type RequestCardData = {
  id: string;
  postedDate: string;
  expiresIn?: string;
  title: string;
  location: string;
  budget: string;
  eventType: string;
  eventDate: string;
  status: {
    label: string;
    sentCount: number;
  };
  quotes: {
    received: number;
    target: number;
    entries: RequestQuoteEntry[];
  };
  primaryAction: {
    label: string;
    variant?: "default" | "outline" | "secondary" | "ghost";
    href?: string;
  };
  secondaryActions: string[];
};

export const REQUESTS: RequestCardData[] = [
  {
    id: "vintage-film-photography",
    postedDate: "October 25, 2024",
    title: "Vintage Film Photography",
    location: "London",
    budget: "£1,500–£2,500",
    eventType: "1950s-themed wedding",
    eventDate: "October 25, 2024",
    status: {
      label: "Sent to Vendor",
      sentCount: 8,
    },
    quotes: {
      received: 3,
      target: 3,
      entries: [
        {
          vendor: "Retro Shots UK",
          amount: "£2,300",
          rating: 4.7,
          reviews: 89,
          summary: "Digital + Prints",
        },
        {
          vendor: "Vintage Lens Co",
          amount: "£1,950",
          rating: 4.5,
          reviews: 45,
          summary: "Digital only",
        },
        {
          vendor: "Classic Capture",
          amount: "£2,100",
          rating: 4.9,
          reviews: 120,
          summary: "Digital + USB + album",
        },
      ],
    },
    primaryAction: {
      label: "Compare Quotes",
      href: "/client/requests/compare-requests",
    },
    secondaryActions: ["Edit Request", "Share"],
  },
  {
    id: "wedding-transport",
    postedDate: "October 25, 2024",
    expiresIn: "6 days",
    title: "Vintage Film Photography",
    location: "Manchester to Lake District",
    budget: "£400–£600",
    eventType: "Wedding Transport",
    eventDate: "October 25, 2024",
    status: {
      label: "Sent to Vendor",
      sentCount: 5,
    },
    quotes: {
      received: 0,
      target: 3,
      entries: [],
    },
    primaryAction: {
      label: "Send Reminder",
    },
    secondaryActions: ["Edit Request", "+ Add Vendors"],
  },
];

export type QuoteComparisonCard = {
  vendor: string;
  amount: string;
  rating: number;
  reviews: number;
  experience: string;
  specs: {
    label: string;
    value: string;
  }[];
  extras: {
    label: string;
    value: string;
  }[];
};

export const COMPARISON_QUOTES: QuoteComparisonCard[] = [
  {
    vendor: "Retro Shots UK",
    amount: "£2,300",
    rating: 4.7,
    reviews: 89,
    experience: "5 Years Experience",
    specs: [
      { label: "Hours", value: "8" },
      { label: "Photographer", value: "1" },
      { label: "Delivery", value: "Digital + Prints" },
      { label: "Timeline", value: "4 Weeks" },
    ],
    extras: [
      { label: "Engagement", value: "+£200" },
      { label: "Second", value: "+£300" },
      { label: "Album", value: "+£400" },
    ],
  },
  {
    vendor: "Vintage Lens Co",
    amount: "£1,950",
    rating: 4.5,
    reviews: 45,
    experience: "3 Years Experience",
    specs: [
      { label: "Hours", value: "6" },
      { label: "Photographer", value: "1" },
      { label: "Delivery", value: "Digital only" },
      { label: "Timeline", value: "3 Weeks" },
    ],
    extras: [
      { label: "Engagement", value: "Include" },
      { label: "Second", value: "Not available" },
      { label: "Album", value: "+£350" },
    ],
  },
  {
    vendor: "Classic Capture",
    amount: "£2,100",
    rating: 4.9,
    reviews: 120,
    experience: "8 Years Experience",
    specs: [
      { label: "Hours", value: "8" },
      { label: "Photographer", value: "2" },
      { label: "Delivery", value: "Digital + USB + album" },
      { label: "Timeline", value: "2 Weeks" },
    ],
    extras: [
      { label: "Engagement", value: "+£150" },
      { label: "Second", value: "Included" },
      { label: "Album", value: "Included" },
    ],
  },
];
