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

  // Ensure we always have 4 thumbnails on the side, looping if necessary
  const sideImages = Array.from({ length: 4 }).map((_, i) => {
    // Start from index 1 (relative to start) or offset from selected?
    // Usually static thumbnails 1-4 are best for stability, looping if < 5 total images
    // If we want them to be "next" images, we can do (selectedImage + 1 + i) % len
    // But fixed set is less jarring for layout filling unless user asks for carousel.
    // Let's use simple cyclic filling from the original array skipping index 0 (main default)
    // actually, let's just cycle through all images starting at index 1 for the sidebar slots
    const index = (i + 1) % images.length;
    return { src: images[index], originalIndex: index };
  });

  return (
    <div className="flex gap-2 rounded-2xl p-2">
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

      <div className="flex flex-col gap-2 w-24 md:w-32 h-auto">
        {sideImages.map((item, index) => (
          <button
            key={`${item.originalIndex}-${index}`}
            onClick={() => setSelectedImage(item.originalIndex)}
            className={`relative flex-1 rounded-xl overflow-hidden bg-muted transition-all w-full ${
              selectedImage === item.originalIndex
                ? "ring-2 ring-primary ring-offset-2"
                : "opacity-80 hover:opacity-100"
            }`}
          >
            <Image
              src={item.src}
              alt={`${vendorName} - Gallery image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 96px, 128px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
