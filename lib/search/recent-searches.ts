const RECENT_SEARCHES_KEY = "momentev:recent-searches";
const MAX_RECENT_SEARCHES = 6;

function isBrowser() {
  return typeof window !== "undefined";
}

export function getRecentSearches(): string[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function addRecentSearch(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed || !isBrowser()) {
    return getRecentSearches();
  }

  const existing = getRecentSearches();
  const normalized = trimmed.toLowerCase();

  const next = [
    trimmed,
    ...existing.filter((item) => item.toLowerCase() !== normalized),
  ].slice(0, MAX_RECENT_SEARCHES);

  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  } catch {
    return existing;
  }

  return next;
}