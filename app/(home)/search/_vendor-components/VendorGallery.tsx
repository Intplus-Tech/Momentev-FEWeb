"use client";

import { useState } from "react";
import Image from "next/image";

interface VendorGalleryProps {
  images: string[];
  vendorName: string;
}

export function VendorGallery({ images, vendorName }: VendorGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const mainImage = images[selectedImage] || images[0];
  const thumbnails = images.slice(0, 5);

  return (
    <div className="flex gap-2">
      {/* Main Image */}
      <div className="relative flex-1 aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
        <Image
          src={mainImage}
          alt={`${vendorName} - Main image`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="flex flex-col gap-2 w-24 md:w-32">
        {thumbnails.slice(1).map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index + 1)}
            className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-muted transition-all ${
              selectedImage === index + 1
                ? "ring-2 ring-primary ring-offset-2"
                : "opacity-80 hover:opacity-100"
            }`}
          >
            <Image
              src={image}
              alt={`${vendorName} - Image ${index + 2}`}
              fill
              className="object-cover"
              sizes="128px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
