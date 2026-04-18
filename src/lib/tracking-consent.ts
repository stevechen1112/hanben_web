export const TRACKING_CONSENT_COOKIE = "hb_tracking_consent";
export const TRACKING_CONSENT_EVENT = "hanben:tracking-consent";

export type TrackingConsentState = {
  analytics: boolean;
  ads: boolean;
};

export type GoogleConsentState = {
  ad_personalization: "granted" | "denied";
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  analytics_storage: "granted" | "denied";
  functionality_storage: "granted" | "denied";
  personalization_storage: "granted" | "denied";
  security_storage: "granted" | "denied";
};

const DEFAULT_CONSENT: TrackingConsentState = {
  analytics: false,
  ads: false,
};

export function parseTrackingConsent(raw: string | null | undefined) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<TrackingConsentState>;
    return {
      analytics: Boolean(parsed.analytics),
      ads: Boolean(parsed.ads),
    };
  } catch {
    return null;
  }
}

export function serializeTrackingConsent(consent: TrackingConsentState) {
  return JSON.stringify({
    analytics: consent.analytics,
    ads: consent.ads,
  });
}

export function getResolvedTrackingConsent(
  consent: TrackingConsentState | null | undefined,
) {
  return consent ?? DEFAULT_CONSENT;
}

export function buildGoogleConsentState(
  consent: TrackingConsentState | null | undefined,
): GoogleConsentState {
  const resolved = getResolvedTrackingConsent(consent);
  return {
    ad_personalization: resolved.ads ? "granted" : "denied",
    ad_storage: resolved.ads ? "granted" : "denied",
    ad_user_data: resolved.ads ? "granted" : "denied",
    analytics_storage: resolved.analytics ? "granted" : "denied",
    functionality_storage: "granted",
    personalization_storage: resolved.analytics ? "granted" : "denied",
    security_storage: "granted",
  };
}