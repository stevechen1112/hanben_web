"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trackPageView } from "@/lib/analytics";
import type { TrackingSettings } from "@/lib/site-settings";
import {
  TRACKING_CONSENT_EVENT,
  buildGoogleConsentState,
  getResolvedTrackingConsent,
  type TrackingConsentState,
} from "@/lib/tracking-consent";

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...callArgs: unknown[]) => void;
  push?: (...args: unknown[]) => void;
  loaded?: boolean;
  queue?: unknown[];
  version?: string;
};

function ensureMetaPixel(pixelId: string) {
  if (window.__hanbenMetaPixelLoaded) {
    return;
  }

  window.fbq =
    window.fbq ||
    function (...args: unknown[]) {
      const fbqInstance = window.fbq as MetaPixelFunction;

      if (fbqInstance.callMethod) {
        fbqInstance.callMethod(...args);
        return;
      }

      fbqInstance.queue = [...(fbqInstance.queue ?? []), args];
    };

  const pixelFunction = window.fbq as MetaPixelFunction;

  pixelFunction.push = pixelFunction.push || pixelFunction;
  pixelFunction.loaded = true;
  pixelFunction.version = "2.0";
  pixelFunction.queue = pixelFunction.queue || [];

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  window.fbq("init", pixelId);
  window.__hanbenMetaPixelLoaded = true;
}

export function TrackingRuntime({
  tracking,
  initialConsent,
}: {
  tracking: TrackingSettings;
  initialConsent: TrackingConsentState | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrlRef = useRef<string | null>(null);
  const [consent, setConsent] = useState<TrackingConsentState>(
    getResolvedTrackingConsent(initialConsent),
  );

  useEffect(() => {
    function handleConsentUpdate(event: Event) {
      const nextConsent = (event as CustomEvent<TrackingConsentState>).detail;
      setConsent(getResolvedTrackingConsent(nextConsent));
    }

    window.addEventListener(TRACKING_CONSENT_EVENT, handleConsentUpdate);
    return () => window.removeEventListener(TRACKING_CONSENT_EVENT, handleConsentUpdate);
  }, []);

  useEffect(() => {
    const googleConsent = buildGoogleConsentState(consent);
    window.__hanbenTracking = tracking;
    window.__hanbenConsent = consent;
    window.gtag?.("consent", "update", googleConsent);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "consent_update", consent, ...googleConsent });

    if (tracking.pixelId && consent.ads) {
      ensureMetaPixel(tracking.pixelId);
      window.fbq?.("consent", "grant");
      return;
    }

    if (window.fbq) {
      window.fbq("consent", "revoke");
    }
  }, [consent, tracking.pixelId]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const query = searchParams.toString();
    const url = `${window.location.origin}${pathname}${query ? `?${query}` : ""}`;
    if (lastTrackedUrlRef.current === url) {
      return;
    }

    lastTrackedUrlRef.current = url;
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}