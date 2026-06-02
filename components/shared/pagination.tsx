import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Page range calculation — always shows first, last, current ± siblings, and ellipsis. */
function getPageRange(
  current: number,
  total: number,
  siblings: number,
): (number | "...")[] {
  const totalVisible = siblings * 2 + 5;
  if (total <= totalVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblings, 2);
  const rightSibling = Math.min(current + siblings, total - 1);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  const pages: (number | "...")[] = [1];

  if (showLeftEllipsis) {
    pages.push("...");
  } else {
    for (let i = 2; i < leftSibling; i++) pages.push(i);
  }

  for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);

  if (showRightEllipsis) {
    pages.push("...");
  } else {
    for (let i = rightSibling + 1; i < total; i++) pages.push(i);
  }

  pages.push(total);
  return pages;
}

// ─── Shared props ──────────────────────────────────────────────────────────────

interface PaginationBaseProps {
  currentPage: number;
  totalPages: number;
  /** How many page-number buttons to show around the active page (default 1). */
  siblingCount?: number;
  className?: string;
}

// ─── Server-side (Link-based) ──────────────────────────────────────────────────

interface LinkPaginationProps extends PaginationBaseProps {
  /** Provide this for server-side navigation (renders <Link> elements). */
  buildHref: (page: number) => string;
  onPageChange?: never;
}

// ─── Client-side (callback-based) ─────────────────────────────────────────────

interface CallbackPaginationProps extends PaginationBaseProps {
  /** Provide this for client-side navigation (renders <button> elements). */
  onPageChange: (page: number) => void;
  buildHref?: never;
}

type PaginationProps = LinkPaginationProps | CallbackPaginationProps;

export function Pagination({
  currentPage,
  totalPages,
  siblingCount = 1,
  className,
  ...rest
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageRange(currentPage, totalPages, siblingCount);
  const isLinkMode = "buildHref" in rest && Boolean(rest.buildHref);

  /** Wraps a page-number in either a Link or a button, depending on mode. */
  const PageButton = ({
    page,
    isActive,
  }: {
    page: number;
    isActive: boolean;
  }) => {
    if (isActive) {
      return (
        <Button
          variant="default"
          size="icon"
          className="h-8 w-8 font-semibold"
          aria-current="page"
          aria-label={`Page ${page}`}
        >
          {page}
        </Button>
      );
    }

    if (isLinkMode) {
      return (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          asChild
          aria-label={`Go to page ${page}`}
        >
          <Link href={(rest as LinkPaginationProps).buildHref(page)}>
            {page}
          </Link>
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => (rest as CallbackPaginationProps).onPageChange(page)}
        aria-label={`Go to page ${page}`}
      >
        {page}
      </Button>
    );
  };

  const PrevButton = () => {
    const disabled = currentPage <= 1;
    if (disabled) {
      return (
        <Button variant="outline" size="icon" className="h-8 w-8" disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      );
    }
    if (isLinkMode) {
      return (
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link
            href={(rest as LinkPaginationProps).buildHref(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
      );
    }
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() =>
          (rest as CallbackPaginationProps).onPageChange(currentPage - 1)
        }
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );
  };

  const NextButton = () => {
    const disabled = currentPage >= totalPages;
    if (disabled) {
      return (
        <Button variant="outline" size="icon" className="h-8 w-8" disabled>
          <ChevronRight className="h-4 w-4" />
        </Button>
      );
    }
    if (isLinkMode) {
      return (
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link
            href={(rest as LinkPaginationProps).buildHref(currentPage + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      );
    }
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() =>
          (rest as CallbackPaginationProps).onPageChange(currentPage + 1)
        }
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );
  };

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center gap-1", className)}
    >
      <PrevButton />

      {pages.map((page, idx) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }
        return (
          <PageButton key={page} page={page} isActive={page === currentPage} />
        );
      })}

      <NextButton />
    </nav>
  );
}
