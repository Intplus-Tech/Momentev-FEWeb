export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleTone: string;
  access: string;
};

export type Review = {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Jade Adams",
    email: "jadeadams@gmail.com",
    role: "Super Admin",
    roleTone: "bg-pink-100 text-pink-700",
    access: "5 Permissions",
  },
  {
    id: "2",
    name: "Jade Adams",
    email: "jadeadams@gmail.com",
    role: "Admin",
    roleTone: "bg-blue-100 text-blue-700",
    access: "4 Permissions",
  },
  {
    id: "3",
    name: "Jade Adams",
    email: "jadeadams@gmail.com",
    role: "Therapist",
    roleTone: "bg-green-100 text-green-700",
    access: "3 Permissions",
  },
];

export const reviews: Review[] = [
  {
    id: "r1",
    name: "ChimaKa.",
    date: "Jan 20, 2025",
    rating: 5,
    text: "Absolutely fantastic service for my wedding day! [Artist Name] made me feel incredibly calm and beautiful. The makeup lasted all night, even through all the dancing and happy tears. Highly recommend for any bride!",
  },
  {
    id: "r2",
    name: "ChimaKa.",
    date: "Jan 20, 2025",
    rating: 5,
    text: "Absolutely fantastic service for my wedding day! [Artist Name] made me feel incredibly calm and beautiful. The makeup lasted all night, even through all the dancing and happy tears. Highly recommend for any bride!",
  },
  {
    id: "r3",
    name: "ChimaKa.",
    date: "Jan 20, 2025",
    rating: 5,
    text: "Absolutely fantastic service for my wedding day! [Artist Name] made me feel incredibly calm and beautiful. The makeup lasted all night, even through all the dancing and happy tears. Highly recommend for any bride!",
  },
];

export const supportPrefill = {
  name: "Jonas Kahnwald",
  email: "jonas_kahnwald@gmail.com",
};
