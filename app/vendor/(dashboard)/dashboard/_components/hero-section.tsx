import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  location: string;
  name: string;
  helperText: string;
  ctaLabel: string;
}

export function HeroSection({
  location,
  name,
  helperText,
  ctaLabel,
}: HeroSectionProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{location}</p>
        <h1 className="mt-1 text-3xl font-semibold text-foreground">
          Welcome, {name}
        </h1>
      </div>
      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-6">
        <p>{helperText}</p>
        <Button>{ctaLabel}</Button>
      </div>
    </div>
  );
}
