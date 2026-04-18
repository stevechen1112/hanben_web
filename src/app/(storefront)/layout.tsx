import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { StorefrontCartFeedback } from "@/components/storefront/cart-feedback";
import { StorefrontFooter } from "@/components/storefront/footer";
import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontSupportWidget } from "@/components/storefront/support-widget";
import { ConsentBanner } from "@/components/storefront/tracking/consent-banner";
import { TrackingRuntime } from "@/components/storefront/tracking/tracking-runtime";
import { TrackingScripts } from "@/components/storefront/tracking/tracking-scripts";
import {
  TRACKING_CONSENT_COOKIE,
  parseTrackingConsent,
} from "@/lib/tracking-consent";
import { getTrackingSettings } from "@/lib/site-settings";
import { getStorefrontChrome } from "@/lib/storefront";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const [chrome, tracking, cookieStore] = await Promise.all([
    getStorefrontChrome(),
    getTrackingSettings(),
    cookies(),
  ]);
  const initialConsent = parseTrackingConsent(
    cookieStore.get(TRACKING_CONSENT_COOKIE)?.value,
  );

  return (
    <>
      <TrackingScripts tracking={tracking} initialConsent={initialConsent} />
      <TrackingRuntime tracking={tracking} initialConsent={initialConsent} />
      <div className="min-h-screen bg-white text-stone-900">
        <div data-storefront-announcement>
          <AnnouncementBar announcement={chrome.announcement} />
        </div>
        <div data-storefront-header className="sticky top-0 z-40">
          <StorefrontHeader siteName={chrome.settings.siteName} siteTagline={chrome.settings.siteTagline} logoUrl={chrome.settings.siteLogoUrl} items={chrome.headerItems} />
        </div>
        <main data-storefront-main className="flex-1">{children}</main>
        <div data-storefront-footer>
          <StorefrontFooter
            siteName={chrome.settings.siteName}
            phone={chrome.settings.contactPhone}
            address={chrome.settings.contactAddress}
            serviceHours={chrome.settings.serviceHours}
            brandStatement={chrome.settings.brandStatement}
            brandSummary={chrome.settings.brandSummary}
            items={chrome.footerItems}
          />
        </div>
        <StorefrontCartFeedback />
        <StorefrontSupportWidget primaryUrl={chrome.settings.lineUrl || chrome.settings.facebookUrl || undefined} />
      </div>
      <ConsentBanner initialConsent={initialConsent} privacyPath="/pages/privacy" />
    </>
  );
}
