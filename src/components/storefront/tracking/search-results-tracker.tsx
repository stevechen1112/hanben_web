"use client";

import { useEffect } from "react";
import { trackViewSearchResults } from "@/lib/analytics";

export function SearchResultsTracker({
  articleCount,
  productCount,
  searchTerm,
}: {
  articleCount: number;
  productCount: number;
  searchTerm: string;
}) {
  useEffect(() => {
    if (!searchTerm) {
      return;
    }

    trackViewSearchResults({
      articleCount,
      productCount,
      searchTerm,
    });
  }, [articleCount, productCount, searchTerm]);

  return null;
}