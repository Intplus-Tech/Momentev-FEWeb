export type SavedVendor = {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
};

export type ClientReview = {
  id: string;
  vendorName: string;
  date: string;
  rating: number;
  text: string;
  avatar?: string;
};

export const savedVendors: SavedVendor[] = [
  {
    id: "1",
    name: "Elegant Weddings Photography",
    category: "Photography & Videography",
    rating: 4.9,
    reviewCount: 128,
  },
  {
    id: "2",
    name: "London Catering Co",
    category: "Catering",
    rating: 4.9,
    reviewCount: 96,
  },
  {
    id: "3",
    name: "Bloom Florists",
    category: "Florist",
    rating: 4.9,
    reviewCount: 74,
  },
  {
    id: "4",
    name: "Premier Venue Spaces",
    category: "Venue & Spaces",
    rating: 4.9,
    reviewCount: 112,
  },
];

