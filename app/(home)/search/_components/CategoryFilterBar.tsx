"use client";

import {
  Camera,
  PartyPopper,
  Sparkles,
  Music,
  Building2,
  Cake,
  Users,
  Palette,
} from "lucide-react";
import { categories } from "../_data/vendors";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  PartyPopper,
  Camera,
  Sparkles,
  Users,
  Cake,
  Palette,
  Music,
  Building2,
};

interface CategoryFilterBarProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryFilterBar({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterBarProps) {
  return (
    <div className="border-b bg-background/80 backdrop-blur-sm sticky top-14 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
          {categories.map((category) => {
            const Icon = iconMap[category.icon];
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
