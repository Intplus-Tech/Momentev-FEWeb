import type { NextConfig } from "next";

const resolvedBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL?.trim() ||
  process.env.BACKEND_URL?.trim() ||
  (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "");

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL?.trim() || resolvedBackendUrl,
    NEXT_PUBLIC_BACKEND_URL: resolvedBackendUrl,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Increased from default 1MB to support image uploads
    },
  },
};

export default nextConfig;
