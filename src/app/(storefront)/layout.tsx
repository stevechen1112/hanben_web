import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { StorefrontHeader } from "@/components/storefront/header";
import { getStorefrontChrome } from "@/lib/storefront";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const chrome = await getStorefrontChrome();

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <div data-storefront-announcement>
        <AnnouncementBar announcement={chrome.announcement} />
      </div>
      <div data-storefront-header>
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
    </div>
  );
}
