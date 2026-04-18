"use client";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackPageView(url: string) {
  window.gtag?.("event", "page_view", { page_location: url });
  window.fbq?.("track", "PageView");
}

export function trackViewContent(payload: Record<string, unknown>) {
  window.gtag?.("event", "view_item", payload);
  window.fbq?.("track", "ViewContent", payload);
}

export function trackAddToCart(payload: Record<string, unknown>) {
  window.gtag?.("event", "add_to_cart", payload);
  window.fbq?.("track", "AddToCart", payload);
}

export function trackInitiateCheckout(payload: Record<string, unknown>) {
  window.gtag?.("event", "begin_checkout", payload);
  window.fbq?.("track", "InitiateCheckout", payload);
}

export function trackPurchase(payload: Record<string, unknown>) {
  window.gtag?.("event", "purchase", payload);
  window.fbq?.("track", "Purchase", payload);
}