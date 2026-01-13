// Types for vendor data
export interface Vendor {
  id: number;
  slug: string; // SEO-friendly URL slug
  name: string;
  address: string;
  rating: number;
  reviews: number;
  image: string;
  promoted?: boolean;
  distance?: string;
  bookings?: number;
  isOpen?: boolean;
  closingTime?: string;
  services?: string[];
}

// Pexels images for makeup/beauty vendors
export const vendorImages = {
  makeup1: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800",
  makeup2: "https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800",
  makeup3: "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=800",
  makeup4: "https://images.pexels.com/photos/3985330/pexels-photo-3985330.jpeg?auto=compress&cs=tinysrgb&w=800",
  makeup5: "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800",
  makeup6: "https://images.pexels.com/photos/3738355/pexels-photo-3738355.jpeg?auto=compress&cs=tinysrgb&w=800",
  makeup7: "https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&w=800",
  makeup8: "https://images.pexels.com/photos/3373716/pexels-photo-3373716.jpeg?auto=compress&cs=tinysrgb&w=800",
};

// Promoted vendors data
export const promotedVendors: Vendor[] = [
  {
    id: 1,
    slug: "the-glow-loft",
    name: "The Glow Loft",
    address: "123 Curtain Road, London, EC2A 3QX",
    rating: 5.0,
    reviews: 1142,
    image: vendorImages.makeup1,
    promoted: true,
  },
  {
    id: 2,
    slug: "beauty-and-well-being",
    name: "Beauty and Well being",
    address: "10 Brick Lane, London, E1 6QR",
    rating: 4.9,
    reviews: 872,
    image: vendorImages.makeup2,
    promoted: true,
  },
  {
    id: 3,
    slug: "cheshire-and-north-west-bridal",
    name: "Cheshire & North West Bridal",
    address: "Unit 2, 55 Cable Street, London, E1 8EP",
    rating: 5.0,
    reviews: 653,
    image: vendorImages.makeup3,
    promoted: true,
  },
  {
    id: 4,
    slug: "hitched",
    name: "Hitched",
    address: "Office 7, 181 Queen's Gate, London, SW7 5HY",
    rating: 4.8,
    reviews: 1034,
    image: vendorImages.makeup4,
    promoted: true,
  },
];

// All vendors data (for pagination demo)
export const allVendors: Vendor[] = [
  ...promotedVendors,
  {
    id: 5,
    slug: "the-polished-palette",
    name: "The Polished Palette",
    address: "10 Brick Lane, London, E1 6QR",
    distance: "2.4 miles from you",
    rating: 4.5,
    reviews: 243,
    bookings: 523,
    isOpen: true,
    closingTime: "8:30 pm",
    image: vendorImages.makeup5,
    services: [
      "Signature Glow Facial",
      "Acne Detox Facial",
      "Sensitive Skin Facial",
      "Theme based makeup",
      "Overall Skin care",
      "SPA",
    ],
  },
  {
    id: 6,
    slug: "luxe-visage",
    name: "Luxe Visage",
    address: "15 Oxford Street, London, W1D 2DQ",
    distance: "3.1 miles from you",
    rating: 4.7,
    reviews: 189,
    bookings: 412,
    isOpen: true,
    closingTime: "9:00 pm",
    image: vendorImages.makeup6,
    services: [
      "Bridal Makeup",
      "HD Makeup",
      "Airbrush Makeup",
      "Party Makeup",
      "Hair Styling",
      "Nail Art",
    ],
  },
  {
    id: 7,
    slug: "flawless-finish-artistry",
    name: "Flawless Finish Artistry",
    address: "42 Regent Street, London, W1B 5RA",
    distance: "1.8 miles from you",
    rating: 4.9,
    reviews: 567,
    bookings: 891,
    isOpen: true,
    closingTime: "7:30 pm",
    image: vendorImages.makeup7,
    services: [
      "Celebrity Makeup",
      "Editorial Makeup",
      "Fashion Makeup",
      "Special Effects",
      "Contouring",
      "Lash Extensions",
    ],
  },
  {
    id: 8,
    slug: "blend-and-vibe",
    name: "Blend & Vibe",
    address: "88 High Street, London, E15 2PE",
    distance: "4.2 miles from you",
    rating: 4.6,
    reviews: 312,
    bookings: 645,
    isOpen: false,
    closingTime: "6:00 pm",
    image: vendorImages.makeup8,
    services: [
      "Natural Makeup",
      "Glamour Makeup",
      "Vintage Makeup",
      "Ethnic Makeup",
      "Skin Treatment",
      "Makeup Lessons",
    ],
  },
  // Additional vendors for pagination
  {
    id: 9,
    slug: "glamour-studio",
    name: "Glamour Studio",
    address: "25 Bond Street, London, W1S 4QR",
    distance: "2.9 miles from you",
    rating: 4.8,
    reviews: 445,
    bookings: 723,
    isOpen: true,
    closingTime: "8:00 pm",
    image: vendorImages.makeup1,
    services: [
      "Bridal Makeup",
      "Party Makeup",
      "HD Makeup",
      "Airbrush",
    ],
  },
  {
    id: 10,
    slug: "beauty-boudoir",
    name: "Beauty Boudoir",
    address: "56 King's Road, London, SW3 4UD",
    distance: "5.1 miles from you",
    rating: 4.4,
    reviews: 167,
    bookings: 298,
    isOpen: true,
    closingTime: "7:00 pm",
    image: vendorImages.makeup2,
    services: [
      "Wedding Makeup",
      "Special Occasion",
      "Photo Shoot",
      "Makeover",
    ],
  },
  {
    id: 11,
    slug: "radiant-beauty",
    name: "Radiant Beauty",
    address: "12 Piccadilly, London, W1J 0DA",
    distance: "1.5 miles from you",
    rating: 4.9,
    reviews: 892,
    bookings: 1245,
    isOpen: true,
    closingTime: "9:30 pm",
    image: vendorImages.makeup3,
    services: [
      "Luxury Makeup",
      "VIP Services",
      "On-location",
      "Masterclass",
    ],
  },
  {
    id: 12,
    slug: "artistry-hub",
    name: "Artistry Hub",
    address: "78 Camden High Street, London, NW1 0LT",
    distance: "3.7 miles from you",
    rating: 4.3,
    reviews: 234,
    bookings: 389,
    isOpen: false,
    closingTime: "6:30 pm",
    image: vendorImages.makeup4,
    services: [
      "Creative Makeup",
      "Body Art",
      "Face Painting",
      "SFX Makeup",
    ],
  },
];

// Categories data
export const categories = [
  { id: "bachelors", label: "Bachelor's Party", icon: "PartyPopper" },
  { id: "photography", label: "Photography", icon: "Camera" },
  { id: "wedding", label: "Wedding", icon: "Sparkles" },
  { id: "planners", label: "Event Planners", icon: "Users" },
  { id: "caterer", label: "Caterer", icon: "Cake" },
  { id: "makeup", label: "Make-Up Artist", icon: "Palette" },
  { id: "entertainment", label: "Entertainment & DJ", icon: "Music" },
  { id: "venue", label: "Venue Decorator", icon: "Building2" },
];
