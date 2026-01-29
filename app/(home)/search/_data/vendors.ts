// Types for vendor data
import { Vendor } from "./types";

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
    _id: "1",
    slug: "the-glow-loft",
    name: "The Glow Loft",
    address: "123 Curtain Road, London, EC2A 3QX",
    rate: 5.0,
    totalReviews: 1142,
    coverImage: vendorImages.makeup1,
    serviceCategory: { _id: "cat1", name: "Makeup", description: "", coverImage: "" },
    serviceSpecialty: { _id: "spec1", name: "Bridal" },
  },
  {
    _id: "2",
    slug: "beauty-and-well-being",
    name: "Beauty and Well being",
    address: "10 Brick Lane, London, E1 6QR",
    rate: 4.9,
    totalReviews: 872,
    coverImage: vendorImages.makeup2,
    serviceCategory: { _id: "cat1", name: "Makeup", description: "", coverImage: "" },
    serviceSpecialty: { _id: "spec2", name: "Party" },
  },
  {
    _id: "3",
    slug: "cheshire-and-north-west-bridal",
    name: "Cheshire & North West Bridal",
    address: "Unit 2, 55 Cable Street, London, E1 8EP",
    rate: 5.0,
    totalReviews: 653,
    coverImage: vendorImages.makeup3,
    serviceCategory: { _id: "cat2", name: "Bridal", description: "", coverImage: "" },
    serviceSpecialty: { _id: "spec1", name: "Bridal" },
  },
  {
    _id: "4",
    slug: "hitched",
    name: "Hitched",
    address: "Office 7, 181 Queen's Gate, London, SW7 5HY",
    rate: 4.8,
    totalReviews: 1034,
    coverImage: vendorImages.makeup4,
    serviceCategory: { _id: "cat3", name: "Planning", description: "", coverImage: "" },
    serviceSpecialty: { _id: "spec3", name: "Wedding" },
  },
];

// Empty array as we fetch data now.
export const allVendors: Vendor[] = [];

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
