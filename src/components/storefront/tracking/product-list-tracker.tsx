"use client";

import { useEffect } from "react";
import { createAnalyticsItem, trackViewItemList } from "@/lib/analytics";

type ProductListTrackerItem = {
  id: string;
  title: string;
  variantId: string | null;
  variantTitle?: string | null;
  price: number | null;
  sku?: string | null;
};

export function ProductListTracker({
  items,
  listId,
  listName,
  pageType,
}: {
  items: ProductListTrackerItem[];
  listId: string;
  listName: string;
  pageType: "category" | "home" | "searchresults";
}) {
  useEffect(() => {
    const trackableItems = items
      .map((item, index) => {
        if (!item.variantId || item.price == null) {
          return null;
        }

        return createAnalyticsItem({
          index: index + 1,
          itemId: item.variantId,
          itemListId: listId,
          itemListName: listName,
          itemName: item.title,
          itemVariant: item.variantTitle ?? undefined,
          price: item.price,
          sku: item.sku,
        });
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (trackableItems.length === 0) {
      return;
    }

    trackViewItemList(
      {
        listId,
        listName,
        items: trackableItems,
      },
      { pageType },
    );
  }, [items, listId, listName, pageType]);

  return null;
}