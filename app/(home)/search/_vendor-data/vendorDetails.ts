// Review type
export interface Review {
  id: string;
  author: string;
  initials: string;
  date: string;
  rating: number;
  category: string;
  content: string;
}

// Service item type
export interface ServiceItem {
  name: string;
  price: string;
}

// Service category type
export interface ServiceCategory {
  category: string;
  items: ServiceItem[];
}

// Review stats type
export interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    stars: number;
    count: number;
  }[];
}

// Extended vendor type with additional details for the vendor page
export interface VendorDetails {
  id: string;
  slug: string; // SEO-friendly URL slug
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  address: string;
  promoted: boolean;
  distance?: string;
  website: string;
  email: string;
  phone: string;
  contactName?: string;
  tags: string[];
  social: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  about: string;
  gallery: string[];
  servicesList: ServiceCategory[];
  reviews: Review[];
  reviewStats: ReviewStats;
}

// Helper function to create URL slugs from vendor names
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Default review stats for vendors without detailed reviews
const defaultReviewStats = (rating: number, total: number): ReviewStats => ({
  average: rating,
  total,
  distribution: [
    { stars: 5, count: Math.round(total * 0.75) },
    { stars: 4, count: Math.round(total * 0.18) },
    { stars: 3, count: Math.round(total * 0.05) },
    { stars: 2, count: Math.round(total * 0.02) },
    { stars: 1, count: 0 },
  ],
});

// Default about text
const defaultAbout = (name: string) =>
  `${name} is dedicated to providing exceptional service with attention to detail and professionalism. Our team of experienced professionals ensures every client receives personalized care in a welcoming environment.`;

// Mock vendor details data - IDs match vendors.ts
export const vendorDetails: Record<string, VendorDetails> = {
  // Promoted vendors (1-4)
  "the-glow-loft": {
    id: "1",
    slug: "the-glow-loft",
    name: "The Glow Loft",
    image: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 5.0,
    reviewCount: 1142,
    address: "123 Curtain Road, London, EC2A 3QX",
    promoted: true,
    website: "www.theglowloft.com",
    email: "hello@theglowloft.com",
    phone: "020 7946 1111",
    tags: ["Makeup Artist", "Skincare", "Premium"],
    social: {
      instagram: "https://instagram.com/theglowloft",
      facebook: "https://facebook.com/theglowloft",
    },
    about: defaultAbout("The Glow Loft"),
    gallery: [
      "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/3985330/pexels-photo-3985330.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    servicesList: [
      {
        category: "Glow Treatments",
        items: [
          { name: "Signature Glow Facial", price: "£60 - £120" },
          { name: "LED Light Therapy", price: "£45 - £85" },
          { name: "Hydrating Treatment", price: "£50 - £90" },
        ],
      },
    ],
    reviews: [],
    reviewStats: defaultReviewStats(5.0, 1142),
  },
  "beauty-and-well-being": {
    id: "2",
    slug: "beauty-and-well-being",
    name: "Beauty and Well being",
    image: "https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    reviewCount: 872,
    address: "10 Brick Lane, London, E1 6QR",
    promoted: true,
    website: "www.beautyandwellbeing.com",
    email: "hello@beautyandwellbeing.com",
    phone: "020 7946 5678",
    tags: ["Skincare", "Wellness", "Beauty"],
    social: {
      instagram: "https://instagram.com/beautyandwellbeing",
      facebook: "https://facebook.com/beautyandwellbeing",
    },
    about: defaultAbout("Beauty and Well being"),
    gallery: [
      "https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    servicesList: [
      {
        category: "Skincare",
        items: [
          { name: "Deep Cleansing Facial", price: "£50 - £80" },
          { name: "Anti-Aging Treatment", price: "£70 - £120" },
        ],
      },
    ],
    reviews: [],
    reviewStats: defaultReviewStats(4.9, 872),
  },
  "cheshire-and-north-west-bridal": {
    id: "3",
    slug: "cheshire-and-north-west-bridal",
    name: "Cheshire & North West Bridal",
    image: "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 5.0,
    reviewCount: 653,
    address: "Unit 2, 55 Cable Street, London, E1 8EP",
    promoted: true,
    website: "www.cheshirebridal.com",
    email: "bookings@cheshirebridal.com",
    phone: "020 7946 3333",
    tags: ["Bridal", "Wedding", "Makeup Artist"],
    social: {
      instagram: "https://instagram.com/cheshirebridal",
    },
    about: defaultAbout("Cheshire & North West Bridal"),
    gallery: [
      "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3985330/pexels-photo-3985330.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    servicesList: [
      {
        category: "Bridal Services",
        items: [
          { name: "Bridal Trial", price: "£75" },
          { name: "Wedding Day Makeup", price: "£150 - £250" },
          { name: "Bridesmaid Makeup", price: "£50 - £80" },
        ],
      },
    ],
    reviews: [],
    reviewStats: defaultReviewStats(5.0, 653),
  },
  "hitched": {
    id: "4",
    slug: "hitched",
    name: "Hitched",
    image: "https://images.pexels.com/photos/3985330/pexels-photo-3985330.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    reviewCount: 1034,
    address: "Office 7, 181 Queen's Gate, London, SW7 5HY",
    promoted: true,
    website: "www.hitched.co.uk",
    email: "info@hitched.co.uk",
    phone: "020 7946 4444",
    tags: ["Wedding", "Events", "Full Service"],
    social: {
      twitter: "https://twitter.com/hitched",
      facebook: "https://facebook.com/hitched",
      instagram: "https://instagram.com/hitched",
    },
    about: defaultAbout("Hitched"),
    gallery: [
      "https://images.pexels.com/photos/3985330/pexels-photo-3985330.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    servicesList: [
      {
        category: "Wedding Packages",
        items: [
          { name: "Full Wedding Package", price: "From £500" },
          { name: "Day-of Coordination", price: "£200 - £350" },
        ],
      },
    ],
    reviews: [],
    reviewStats: defaultReviewStats(4.8, 1034),
  },
  // Regular vendors (5-12)
  "the-polished-palette": {
    id: "5",
    slug: "the-polished-palette",
    name: "The Polished Palette",
    image: "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.5,
    reviewCount: 243,
    address: "10 Brick Lane, London, E1 6QR",
    promoted: false,
    distance: "2.4 miles",
    website: "www.polishedpalette.com",
    email: "craig@polishedpalette.com",
    phone: "020 7946 1234",
    tags: ["Makeup Artist", "Hairstylist", "Professional Services"],
    social: {
      twitter: "https://twitter.com/polishedpalette",
      linkedin: "https://linkedin.com/company/polishedpalette",
      facebook: "https://facebook.com/polishedpalette",
    },
    about: `Our standard studio and on-location attire is designed with the working artist in mind. We prioritize a clean, professional appearance that instills client confidence and meets high hygiene standards. Our uniform typically features a smart black tunic, tailored for comfort and movement, paired with practical, durable trousers and ergonomic footwear for long-duration wear. The look is polished, functional, and ensures we maintain a professional presence throughout every application, keeping the focus entirely on you, the client.`,
    gallery: [
      "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/2587370/pexels-photo-2587370.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    servicesList: [
      {
        category: "Occasion Makeup",
        items: [
          { name: "Day/Evening/Event Makeup", price: "£40 - £95" },
          { name: "Prom Makeup", price: "£40 - £95" },
          { name: "Full Glam (includes lashes)", price: "£40 - £95" },
        ],
      },
      {
        category: "Bridal Makeup",
        items: [
          { name: "Bridal Trial Session", price: "£40 - £95" },
          { name: "Wedding Day Bride Makeup", price: "£40 - £95" },
          { name: "Bridesmaid/Guest Makeup", price: "£40 - £95" },
        ],
      },
      {
        category: "Commercial/Media",
        items: [
          { name: "Half-Day Rate (e.g., photoshoots)", price: "£40 - £95" },
          { name: "Full-Day Rate (e.g., film/TV, fashion)", price: "£40 - £95" },
        ],
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Alex K.",
        initials: "AK",
        date: "Jan 20, 2025",
        rating: 5,
        category: "Bridal",
        content:
          "Absolutely fantastic service for my wedding day! Made me feel incredibly calm and beautiful. The makeup lasted all night, even through all the dancing and happy tears. Highly recommend for any bride!",
      },
      {
        id: "r2",
        author: "Emily R.",
        initials: "ER",
        date: "Nov 19, 2024",
        rating: 5,
        category: "Occasion",
        content:
          "Booked The Polished Palette for a big event, and I felt like a movie star! The application was flawless, and the artist really listened to what I wanted. I received compliments all evening.",
      },
    ],
    reviewStats: {
      average: 4.5,
      total: 243,
      distribution: [
        { stars: 5, count: 180 },
        { stars: 4, count: 45 },
        { stars: 3, count: 15 },
        { stars: 2, count: 3 },
        { stars: 1, count: 0 },
      ],
    },
  },
  "luxe-visage": {
    id: "6",
    slug: "luxe-visage",
    name: "Luxe Visage",
    image: "https://images.pexels.com/photos/3738355/pexels-photo-3738355.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.7,
    reviewCount: 189,
    address: "15 Oxford Street, London, W1D 2DQ",
    promoted: false,
    distance: "3.1 miles",
    website: "www.luxevisage.com",
    email: "hello@luxevisage.com",
    phone: "020 7946 6666",
    tags: ["Bridal", "HD Makeup", "Luxury"],
    social: {
      instagram: "https://instagram.com/luxevisage",
    },
    about: defaultAbout("Luxe Visage"),
    gallery: [
      "https://images.pexels.com/photos/3738355/pexels-photo-3738355.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    servicesList: [
      {
        category: "Makeup Services",
        items: [
          { name: "Bridal Makeup", price: "£120 - £200" },
          { name: "HD Makeup", price: "£80 - £120" },
          { name: "Airbrush Makeup", price: "£90 - £140" },
        ],
      },
    ],
    reviews: [],
    reviewStats: defaultReviewStats(4.7, 189),
  },
  "flawless-finish-artistry": {
    id: "7",
    slug: "flawless-finish-artistry",
    name: "Flawless Finish Artistry",
    image: "https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    reviewCount: 567,
    address: "42 Regent Street, London, W1B 5RA",
    promoted: false,
    distance: "1.8 miles",
    website: "www.flawlessfinishartistry.com",
    email: "book@flawlessfinishartistry.com",
    phone: "020 7946 7777",
    tags: ["Celebrity", "Editorial", "Fashion"],
    social: {
      instagram: "https://instagram.com/flawlessfinish",
      twitter: "https://twitter.com/flawlessfinish",
    },
    about: defaultAbout("Flawless Finish Artistry"),
    gallery: [
      "https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    servicesList: [
      {
        category: "Professional Makeup",
        items: [
          { name: "Celebrity Makeup", price: "£200 - £400" },
          { name: "Editorial Makeup", price: "£150 - £300" },
          { name: "Fashion Makeup", price: "£120 - £250" },
        ],
      },
    ],
    reviews: [],
    reviewStats: defaultReviewStats(4.9, 567),
  },
  "blend-and-vibe": {
    id: "8",
    slug: "blend-and-vibe",
    name: "Blend & Vibe",
    image: "https://images.pexels.com/photos/3373716/pexels-photo-3373716.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.6,
    reviewCount: 312,
    address: "88 High Street, London, E15 2PE",
    promoted: false,
    distance: "4.2 miles",
    website: "www.blendandvibe.com",
    email: "info@blendandvibe.com",
    phone: "020 7946 8888",
    tags: ["Natural", "Lessons", "Ethnic"],
    social: {
      facebook: "https://facebook.com/blendandvibe",
    },
    about: defaultAbout("Blend & Vibe"),
    gallery: [
      "https://images.pexels.com/photos/3373716/pexels-photo-3373716.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    servicesList: [
      {
        category: "Makeup",
        items: [
          { name: "Natural Makeup", price: "£45 - £70" },
          { name: "Glamour Makeup", price: "£60 - £90" },
          { name: "Makeup Lessons", price: "£80 - £150" },
        ],
      },
    ],
    reviews: [],
    reviewStats: defaultReviewStats(4.6, 312),
  },
};

export function getVendorById(id: string): VendorDetails | undefined {
  return Object.values(vendorDetails).find((v) => v.id === id);
}

export function getVendorBySlug(slug: string): VendorDetails | undefined {
  return vendorDetails[slug];
}

// Get all vendor slugs for static generation
export function getAllVendorSlugs(): string[] {
  return Object.keys(vendorDetails);
}
