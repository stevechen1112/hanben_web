import Script from "next/script";
import type { TrackingSettings } from "@/lib/site-settings";
import {
  buildGoogleConsentState,
  getResolvedTrackingConsent,
  type TrackingConsentState,
} from "@/lib/tracking-consent";

function createTrackingStateScript(tracking: TrackingSettings) {
  return `window.__hanbenTracking = ${JSON.stringify(tracking)};`;
}

function createConsentBootstrapScript(initialConsent: TrackingConsentState | null) {
  const resolvedConsent = getResolvedTrackingConsent(initialConsent);
  const googleConsent = buildGoogleConsentState(initialConsent);

  return [
    "window.dataLayer = window.dataLayer || [];",
    "window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};",
    `window.__hanbenConsent = ${JSON.stringify(resolvedConsent)};`,
    `window.gtag('consent', 'default', ${JSON.stringify(googleConsent)});`,
    `window.dataLayer.push({ event: 'consent_default', consent: ${JSON.stringify(resolvedConsent)} });`,
  ].join("\n");
}

function createGoogleTagConfigScript(tracking: TrackingSettings) {
  const destinationIds = Array.from(
    new Set([tracking.gaId, tracking.googleAdsId].filter((value) => value.length > 0)),
  );

  return [
    "window.dataLayer = window.dataLayer || [];",
    "window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};",
    "window.gtag('js', new Date());",
    ...destinationIds.map((id) => `window.gtag('config', '${id}', { send_page_view: false });`),
  ].join("\n");
}

function createGtmBootstrapScript(gtmId: string) {
  return [
    "(function(w,d,s,l,i){",
    "w[l]=w[l]||[];",
    "w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});",
    "var f=d.getElementsByTagName(s)[0],",
    "j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';",
    "j.async=true;",
    `j.src='https://www.googletagmanager.com/gtm.js?id=${gtmId}'+dl;`,
    "f.parentNode.insertBefore(j,f);",
    `})(window,document,'script','dataLayer','${gtmId}');`,
  ].join("\n");
}

export function TrackingScripts({
  tracking,
  initialConsent,
}: {
  tracking: TrackingSettings;
  initialConsent: TrackingConsentState | null;
}) {
  const primaryGoogleTagId = tracking.gaId || tracking.googleAdsId;
  const shouldLoadGoogleStack = Boolean(tracking.gtmId || primaryGoogleTagId);

  return (
    <>
      <script
        id="hanben-tracking-state"
        dangerouslySetInnerHTML={{
          __html: createTrackingStateScript(tracking),
        }}
      />

      {shouldLoadGoogleStack ? (
        <script
          id="hanben-consent-default"
          dangerouslySetInnerHTML={{
            __html: createConsentBootstrapScript(initialConsent),
          }}
        />
      ) : null}

      {tracking.gtmId ? (
        <Script id="hanben-gtm-bootstrap" strategy="afterInteractive">
          {createGtmBootstrapScript(tracking.gtmId)}
        </Script>
      ) : null}

      {!tracking.gtmId && primaryGoogleTagId ? (
        <>
          <Script
            id="hanben-google-tag-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${primaryGoogleTagId}`}
            strategy="afterInteractive"
          />
          <Script id="hanben-google-tag-config" strategy="afterInteractive">
            {createGoogleTagConfigScript(tracking)}
          </Script>
        </>
      ) : null}
    </>
  );
}