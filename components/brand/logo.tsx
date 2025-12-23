import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  withWordmark?: boolean;
  className?: string;
  compact?: boolean;
};

function LogoMark({ compact }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-indigo-500 to-blue-600 text-white shadow-lg",
        compact ? "size-8" : "size-9"
      )}
    >
      <span className="absolute inset-1 rounded-full bg-white/15" />
      <span className="relative flex gap-1">
        <span className="size-1.5 rounded-full bg-white/80" />
        <span className="size-3 rounded-full bg-white" />
      </span>
    </span>
  );
}

export function Logo({
  href = "/",
  withWordmark = true,
  className,
  compact,
}: LogoProps) {
  const content = (
    <span
      className={cn("flex items-center gap-2 font-semibold text-lg", className)}
    >
      <LogoMark compact={compact} />
      {withWordmark ? (
        <span className="tracking-tight text-lg leading-none">momentev</span>
      ) : null}
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} aria-label="Momentev home">
      {content}
    </Link>
  );
}
