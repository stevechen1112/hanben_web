"use client";

import { useEffect } from "react";
import { createAnalyticsItem, trackPurchase } from "@/lib/analytics";

function getPurchaseEventId(orderId: string) {
  return `order-${orderId}-paid`;
}

export function PurchaseEventTracker({
  order,
}: {
  order: {
    city?: string | null;
    country?: string | null;
    email?: string | null;
    id: string;
    orderNumber: string;
    paymentStatus: string;
    phone?: string | null;
    total: number;
    items: Array<{
      variantId: string;
      productTitle: string;
      variantTitle: string;
      quantity: number;
      unitPrice: number;
      sku?: string | null;
    }>;
  };
}) {
  useEffect(() => {
    if (order.paymentStatus !== "PAID") {
      return;
    }

    const storageKey = `hb_purchase_tracked:${order.id}`;
    if (sessionStorage.getItem(storageKey) === "1") {
      return;
    }

    trackPurchase({
      eventId: getPurchaseEventId(order.id),
      transactionId: order.orderNumber,
      customer: {
        city: order.city ?? undefined,
        country: order.country ?? undefined,
        email: order.email ?? undefined,
        phone: order.phone ?? undefined,
      },
      value: order.total,
      items: order.items.map((item) =>
        createAnalyticsItem({
          itemId: item.variantId,
          itemName: item.productTitle,
          itemVariant: item.variantTitle,
          price: item.unitPrice,
          quantity: item.quantity,
          sku: item.sku,
        }),
      ),
    });
    sessionStorage.setItem(storageKey, "1");
  }, [order.id, order.items, order.orderNumber, order.paymentStatus, order.total]);

  return null;
}