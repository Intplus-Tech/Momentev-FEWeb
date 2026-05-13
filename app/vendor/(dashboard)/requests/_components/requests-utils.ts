import type { QuoteRequestStatus } from "@/types/quote-request";

export const formatLongDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export const isQuoteRequestExpired = (
  status: QuoteRequestStatus,
  expiresAt?: string | null
) => {
  if (status !== "new") return false;
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
};

export const isQuoteRequestExpiringSoon = (
  status: QuoteRequestStatus,
  expiresAt?: string | null
) => {
  if (status !== "new") return false;
  if (!expiresAt) return false;

  const expiry = new Date(expiresAt).getTime();
  const now = Date.now();
  if (expiry <= now) return false;

  return expiry - now < 1000 * 60 * 60 * 24;
};

export const formatRelativeExpiry = (expiryDateString: string) => {
  const expiry = new Date(expiryDateString).getTime();
  const now = Date.now();
  const diffMs = expiry - now;

  if (diffMs <= 0) return "Expired";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Expires in less than an hour";
  if (diffHours < 24) {
    return `Expires in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  }
  if (diffDays === 1) return "Expires tomorrow";

  return `Expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
};

export const formatReceivedTime = (createdAtString: string) => {
  const created = new Date(createdAtString).getTime();
  const now = Date.now();
  const diffMs = now - created;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (diffHours < 1) return rtf.format(-Math.round(diffMs / (1000 * 60)), "minute");
  if (diffHours < 24) return rtf.format(-diffHours, "hour");
  if (diffDays < 7) return rtf.format(-diffDays, "day");
  if (diffWeeks < 4) return rtf.format(-diffWeeks, "week");
  return rtf.format(-diffMonths, "month");
};

export const buildPagination = (current: number, total: number) => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const valid = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const result: (number | string)[] = [];
  let prev = 0;
  for (const page of valid) {
    if (prev && page - prev > 1) {
      result.push("…");
    }
    result.push(page);
    prev = page;
  }

  return result;
};
