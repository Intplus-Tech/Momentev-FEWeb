"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getVendorsAction } from "@/app/(home)/search/_data/actions";
import { useServiceCategories } from "@/hooks/api/use-service-categories";
import { getRecentSearches } from "@/lib/search/recent-searches";

export type SearchSuggestionSource =
  | "recent"
  | "category"
  | "tag"
  | "vendor";

export type SearchSuggestion = {
  value: string;
  source: SearchSuggestionSource;
};

const MIN_CHARS_FOR_REMOTE = 2;
const REMOTE_LIMIT = 5;
const MAX_SUGGESTIONS = 8;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getUniqueValues(items: SearchSuggestion[]): SearchSuggestion[] {
  const seen = new Set<string>();
  const unique: SearchSuggestion[] = [];

  for (const item of items) {
    const key = normalize(item.value);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(item);
  }

  return unique;
}

export function useSearchSuggestions(query: string) {
  const trimmedQuery = query.trim();
  const normalizedQuery = normalize(trimmedQuery);

  const [debouncedQuery, setDebouncedQuery] = useState(trimmedQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { data: categoriesData } = useServiceCategories();
  const categories = categoriesData?.data?.data || [];

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(trimmedQuery);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [trimmedQuery]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const { data: remoteSuggestions = [], isFetching: isRemoteFetching } =
    useQuery({
      queryKey: ["search-suggestions", debouncedQuery],
      enabled: debouncedQuery.length >= MIN_CHARS_FOR_REMOTE,
      queryFn: async () => {
        const result = await getVendorsAction({
          q: debouncedQuery,
          page: 1,
          limit: REMOTE_LIMIT,
        });

        if (!result.success) {
          return [] as SearchSuggestion[];
        }

        return result.data.data
          .map((vendor) => {
            const name = vendor.name || vendor.businessProfile?.businessName || "";
            return {
              value: name,
              source: "vendor" as const,
            };
          })
          .filter((item) => item.value.trim().length > 0);
      },
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    });

  const localSuggestions = useMemo(() => {
    const categorySuggestions: SearchSuggestion[] = categories.map((category) => ({
      value: category.name,
      source: "category",
    }));

    const tagSuggestions: SearchSuggestion[] = categories
      .flatMap((category) => category.suggestedTags || [])
      .map((tag) => ({
        value: tag,
        source: "tag",
      }));

    const recentSuggestions: SearchSuggestion[] = recentSearches.map((value) => ({
      value,
      source: "recent",
    }));

    return getUniqueValues([
      ...recentSuggestions,
      ...categorySuggestions,
      ...tagSuggestions,
    ]);
  }, [categories, recentSearches]);

  const filteredLocalSuggestions = useMemo(() => {
    if (!normalizedQuery) {
      return localSuggestions.slice(0, MAX_SUGGESTIONS);
    }

    const prefixMatches = localSuggestions.filter((item) =>
      normalize(item.value).startsWith(normalizedQuery),
    );
    const containsMatches = localSuggestions.filter((item) => {
      const normalizedItem = normalize(item.value);
      return (
        normalizedItem.includes(normalizedQuery) &&
        !normalizedItem.startsWith(normalizedQuery)
      );
    });

    return [...prefixMatches, ...containsMatches].slice(0, MAX_SUGGESTIONS);
  }, [localSuggestions, normalizedQuery]);

  const suggestions = useMemo(() => {
    const merged = getUniqueValues([...filteredLocalSuggestions, ...remoteSuggestions]);
    return merged.slice(0, MAX_SUGGESTIONS);
  }, [filteredLocalSuggestions, remoteSuggestions]);

  return {
    suggestions,
    isLoading: isRemoteFetching,
    refreshRecentSearches: () => setRecentSearches(getRecentSearches()),
  };
}