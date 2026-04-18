"use client";

import type { TrackingConsentState } from "@/lib/tracking-consent";

type ClientTrackingSettings = {
  gaId?: string;
  gtmId?: string;
  googleAdsConversionLabel?: string;
  googleAdsId?: string;
  pixelId?: string;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __hanbenConsent?: TrackingConsentState | null;
    __hanbenMetaPixelIds?: string[];
    __hanbenTracking?: ClientTrackingSettings;
  }
}

export type AnalyticsCustomer = {
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
};

export type AnalyticsItem = {
  index?: number;
  item_id: string;
  item_list_id?: string;
  item_list_name?: string;
  item_name: string;
  item_variant?: string;
  price: number;
  quantity: number;
  sku?: string | null;
};

type RemarketingPageType = "cart" | "category" | "checkout" | "home" | "product" | "purchase" | "searchresults";

export type EcommerceTrackingPayload = {
  currency?: string;
  customer?: AnalyticsCustomer;
  listId?: string;
  listName?: string;
  value?: number;
  items: AnalyticsItem[];
  contentName?: string;
  eventId?: string;
  transactionId?: string;
};

const DEFAULT_CURRENCY = "TWD";

export function createAnalyticsItem(input: {
  index?: number;
  itemId: string;
  itemListId?: string;
  itemListName?: string;
  itemName: string;
  itemVariant?: string;
  price: number;
  quantity?: number;
  sku?: string | null;
}): AnalyticsItem {
  return {
    index: input.index,
    item_id: input.itemId,
    item_list_id: input.itemListId,
    item_list_name: input.itemListName,
    item_name: input.itemName,
    item_variant: input.itemVariant,
    price: input.price,
    quantity: input.quantity ?? 1,
    sku: input.sku,
  };
}

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeItems(items: AnalyticsItem[]) {
  return items.map((item) => ({
    google_business_vertical: "retail",
    id: item.item_id,
    index: item.index,
    item_id: item.item_id,
    item_list_id: item.item_list_id,
    item_list_name: item.item_list_name,
    item_name: item.item_name,
    item_variant: item.item_variant,
    price: item.price,
    quantity: item.quantity,
    sku: item.sku ?? undefined,
  }));
}

function normalizeEcommercePayload(payload: EcommerceTrackingPayload) {
  const items = normalizeItems(payload.items);
  const value = payload.value ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    currency: payload.currency ?? DEFAULT_CURRENCY,
    item_list_id: payload.listId,
    item_list_name: payload.listName,
    value,
    items,
    transaction_id: payload.transactionId,
  };
}

function toMetaPayload(payload: EcommerceTrackingPayload) {
  const normalized = normalizeEcommercePayload(payload);
  return {
    content_ids: normalized.items.map((item) => item.item_id),
    contents: normalized.items.map((item) => ({
      id: item.item_id,
      quantity: item.quantity,
      item_price: item.price,
    })),
    content_name: payload.contentName,
    content_type: "product",
    currency: normalized.currency,
    num_items: normalized.items.reduce((sum, item) => sum + item.quantity, 0),
    order_id: payload.transactionId,
    value: normalized.value,
  };
}

function pushDataLayer(event: string, payload: Record<string, unknown>) {
  if (!isBrowser()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

function pushGoogleAdsRemarketing(
  event: string,
  payload: EcommerceTrackingPayload,
  pageType: RemarketingPageType,
) {
  if (!isBrowser()) return;

  const ecommerce = normalizeEcommercePayload(payload);
  pushDataLayer("google_ads_remarketing", {
    google_ads_remarketing: {
      ecomm_pagetype: pageType,
      ecomm_prodid: ecommerce.items.map((item) => item.item_id),
      ecomm_totalvalue: ecommerce.value,
      google_business_vertical: "retail",
      items: ecommerce.items,
    },
    source_event: event,
  });
}

function normalizeEmail(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizePhone(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return undefined;
  }

  if (digits.startsWith("886")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `+886${digits.slice(1)}`;
  }

  return digits.startsWith("+") ? digits : `+${digits}`;
}

function normalizeGoogleAdsUserData(customer: AnalyticsCustomer | undefined) {
  if (!customer) {
    return null;
  }

  const email = normalizeEmail(customer.email);
  const phoneNumber = normalizePhone(customer.phone);

  if (!email && !phoneNumber) {
    return null;
  }

  return {
    email,
    phone_number: phoneNumber,
    address: customer.city || customer.country
      ? {
          city: customer.city,
          country: customer.country,
        }
      : undefined,
  };
}

function trackGoogleAdsPurchaseConversion(payload: EcommerceTrackingPayload) {
  if (!isBrowser()) return;

  const tracking = window.__hanbenTracking;
  const googleAdsId = tracking?.googleAdsId?.trim();
  const conversionLabel = tracking?.googleAdsConversionLabel?.trim();
  if (!googleAdsId || !conversionLabel) {
    return;
  }

  const ecommerce = normalizeEcommercePayload(payload);
  const googleAdsPayload = {
    currency: ecommerce.currency,
    send_to: `${googleAdsId}/${conversionLabel}`,
    transaction_id: payload.transactionId,
    value: ecommerce.value,
  };
  const userData = window.__hanbenConsent?.ads
    ? normalizeGoogleAdsUserData(payload.customer)
    : null;

  pushDataLayer("google_ads_purchase", {
    google_ads: googleAdsPayload,
    user_data: userData ?? undefined,
  });

  if (tracking?.gtmId) {
    return;
  }

  if (userData) {
    window.gtag?.("set", "user_data", userData);
  }

  window.gtag?.("event", "conversion", googleAdsPayload);
}

export function trackPageView(url: string) {
  if (!isBrowser()) return;

  const payload = {
    page_location: url,
    page_path: new URL(url).pathname,
    page_title: document.title,
  };

  pushDataLayer("page_view", payload);
  window.gtag?.("event", "page_view", payload);
  window.fbq?.("track", "PageView");
}

export function trackViewContent(payload: EcommerceTrackingPayload) {
  if (!isBrowser()) return;

  const ecommerce = normalizeEcommercePayload(payload);
  pushDataLayer("view_item", { ecommerce });
  pushGoogleAdsRemarketing("view_item", payload, "product");
  window.gtag?.("event", "view_item", ecommerce);
  window.fbq?.("track", "ViewContent", toMetaPayload(payload));
}

export function trackAddToCart(payload: EcommerceTrackingPayload) {
  if (!isBrowser()) return;

  const ecommerce = normalizeEcommercePayload(payload);
  pushDataLayer("add_to_cart", { ecommerce });
  pushGoogleAdsRemarketing("add_to_cart", payload, "cart");
  window.gtag?.("event", "add_to_cart", ecommerce);
  window.fbq?.("track", "AddToCart", toMetaPayload(payload));
}

export function trackViewCart(payload: EcommerceTrackingPayload) {
  if (!isBrowser()) return;

  const ecommerce = normalizeEcommercePayload(payload);
  pushDataLayer("view_cart", { ecommerce });
  pushGoogleAdsRemarketing("view_cart", payload, "cart");
  window.gtag?.("event", "view_cart", ecommerce);
}

export function trackViewItemList(
  payload: EcommerceTrackingPayload,
  options: { pageType: RemarketingPageType },
) {
  if (!isBrowser()) return;

  const ecommerce = normalizeEcommercePayload(payload);
  pushDataLayer("view_item_list", { ecommerce });
  pushGoogleAdsRemarketing("view_item_list", payload, options.pageType);
  window.gtag?.("event", "view_item_list", ecommerce);
}

export function trackViewSearchResults(payload: {
  articleCount?: number;
  productCount?: number;
  searchTerm: string;
}) {
  if (!isBrowser()) return;

  const eventPayload = {
    article_count: payload.articleCount,
    product_count: payload.productCount,
    search_term: payload.searchTerm,
  };

  pushDataLayer("view_search_results", eventPayload);
  window.gtag?.("event", "view_search_results", {
    search_term: payload.searchTerm,
  });
}

export function trackInitiateCheckout(payload: EcommerceTrackingPayload) {
  if (!isBrowser()) return;

  const ecommerce = normalizeEcommercePayload(payload);
  pushDataLayer("begin_checkout", { ecommerce });
  pushGoogleAdsRemarketing("begin_checkout", payload, "checkout");
  window.gtag?.("event", "begin_checkout", ecommerce);
  window.fbq?.("track", "InitiateCheckout", toMetaPayload(payload));
}

export function trackPurchase(payload: EcommerceTrackingPayload) {
  if (!isBrowser()) return;

  const ecommerce = normalizeEcommercePayload(payload);
  const eventPayload: Record<string, unknown> = { ecommerce };

  if (payload.eventId) {
    eventPayload.event_id = payload.eventId;
  }

  pushDataLayer("purchase", eventPayload);
  pushGoogleAdsRemarketing("purchase", payload, "purchase");
  window.gtag?.("event", "purchase", ecommerce);
  window.fbq?.("track", "Purchase", {
    ...toMetaPayload(payload),
    eventID: payload.eventId,
  });
  trackGoogleAdsPurchaseConversion(payload);
}