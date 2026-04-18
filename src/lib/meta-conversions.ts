import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";
import { getSiteSettingMap } from "@/lib/site-settings";

function hashValue(value: string | null | undefined, normalize: (value: string) => string) {
  if (!value) {
    return undefined;
  }

  const normalized = normalize(value);
  if (!normalized) {
    return undefined;
  }

  return createHash("sha256").update(normalized).digest("hex");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function getPurchaseEventId(orderId: string) {
  return `order-${orderId}-paid`;
}

export async function sendMetaPurchaseEvent(orderId: string) {
  const [order, settings] = await Promise.all([
    db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          orderBy: { id: "asc" },
        },
      },
    }),
    getSiteSettingMap(),
  ]);

  if (!order || order.paymentStatus !== "PAID") {
    return;
  }

  const accessToken = settings.get("meta_capi_access_token")?.trim() || process.env.META_CONVERSIONS_API_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    return;
  }

  const pixelId = settings.get("facebook_pixel_id") || process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
  if (!pixelId) {
    return;
  }

  const apiVersion = settings.get("meta_graph_api_version")?.trim() || process.env.META_GRAPH_API_VERSION?.trim() || "v22.0";
  const testEventCode = settings.get("meta_capi_test_event_code")?.trim() || process.env.META_CONVERSIONS_API_TEST_EVENT_CODE?.trim();
  const payload = {
    data: [
      {
        action_source: "website",
        custom_data: {
          content_ids: order.items.map((item) => item.variantId),
          contents: order.items.map((item) => ({
            id: item.variantId,
            item_price: Number(item.unitPrice),
            quantity: item.quantity,
          })),
          content_type: "product",
          currency: "TWD",
          num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
          order_id: order.orderNumber,
          value: Number(order.total),
        },
        event_id: getPurchaseEventId(order.id),
        event_name: "Purchase",
        event_source_url: `${getSiteUrl()}/checkout/result?orderId=${order.id}`,
        event_time: Math.floor((order.paidAt ?? order.updatedAt).getTime() / 1000),
        user_data: {
          em: [hashValue(order.email, normalizeEmail)].filter(Boolean),
          ph: [hashValue(order.phone, normalizePhone)].filter(Boolean),
        },
      },
    ],
    test_event_code: testEventCode,
  };

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Meta Conversions API request failed: ${message}`);
  }
}