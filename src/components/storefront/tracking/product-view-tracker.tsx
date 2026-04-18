"use client";

import { useEffect } from "react";
import { createAnalyticsItem, trackViewContent } from "@/lib/analytics";

export function ProductViewTracker({
  product,
}: {
  product: {
    id: string;
    title: string;
    variantId: string;
    variantTitle?: string;
    price: number;
    sku?: string | null;
  };
}) {
  useEffect(() => {
    if (!product.price) {
      return;
    }

    trackViewContent({
      value: product.price,
      contentName: product.title,
      items: [
        createAnalyticsItem({
          itemId: product.variantId,
          itemName: product.title,
          itemVariant: product.variantTitle,
          price: product.price,
          sku: product.sku,
        }),
      ],
    });
  }, [product.id, product.price, product.sku, product.title, product.variantId, product.variantTitle]);

  return null;
}