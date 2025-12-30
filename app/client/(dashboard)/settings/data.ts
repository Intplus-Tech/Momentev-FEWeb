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

export const clientReviews: ClientReview[] = [
  {
    id: "r-1",
    vendorName: "Elegant Weddings Photography",
    date: "October 25, 2024",
    rating: 5,
    text: "Заказывали у ребят разработку интернет-магазина. Что могу сказать, я очень довольна: магазин сделали под ключ сразу с базовыми настройками для SEO и мы планируем продвигать, но уже будет возможность это делать. Рекомендую, цена, качество и коммуникация на 100%.",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=96&h=96&q=80",
  },
  {
    id: "r-2",
    vendorName: "Elegant Weddings Photography",
    date: "October 25, 2024",
    rating: 5,
    text: "Заказывали у ребят разработку интернет-магазина. Что могу сказать, я очень довольна: магазин сделали под ключ сразу с базовыми настройками для SEO и мы планируем продвигать, но уже будет возможность это делать. Рекомендую, цена, качество и коммуникация на 100%.",
  },
  {
    id: "r-3",
    vendorName: "Elegant Weddings Photography",
    date: "October 25, 2024",
    rating: 5,
    text: "Заказывали у ребят разработку интернет-магазина. Что могу сказать, я очень довольна: магазин сделали под ключ сразу с базовыми настройками для SEO и мы планируем продвигать, но уже будет возможность это делать. Рекомендую, цена, качество и коммуникация на 100%.",
  },
  {
    id: "r-4",
    vendorName: "Elegant Weddings Photography",
    date: "October 25, 2024",
    rating: 5,
    text: "Заказывали у ребят разработку интернет-магазина. Что могу сказать, я очень довольна: магазин сделали под ключ сразу с базовыми настройками для SEO и мы планируем продвигать, но уже будет возможность это делать. Рекомендую, цена, качество и коммуникация на 100%.",
  },
];
