import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Noto_Serif_TC } from "next/font/google";
import { ConsentBanner } from "@/components/storefront/tracking/consent-banner";
import { TrackingRuntime } from "@/components/storefront/tracking/tracking-runtime";
import { TrackingScripts } from "@/components/storefront/tracking/tracking-scripts";
import {
  TRACKING_CONSENT_COOKIE,
  parseTrackingConsent,
} from "@/lib/tracking-consent";
import { getSiteMetadataDefaults, getTrackingSettings } from "@/lib/site-settings";
import "./globals.css";

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const defaults = await getSiteMetadataDefaults();
  return {
    title: {
      default: defaults.title,
      template: `%s | ${defaults.siteName}`,
    },
    description: defaults.description,
    verification: defaults.googleSiteVerification
      ? {
          google: defaults.googleSiteVerification,
        }
      : undefined,
    openGraph: {
      title: defaults.title,
      description: defaults.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: defaults.title,
      description: defaults.description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [tracking, cookieStore] = await Promise.all([
    getTrackingSettings(),
    cookies(),
  ]);
  const initialConsent = parseTrackingConsent(
    cookieStore.get(TRACKING_CONSENT_COOKIE)?.value,
  );

  return (
    <html
      lang="zh-TW"
      className={`${notoSerifTC.variable} h-full antialiased`}
    >
      <head>
        <TrackingScripts tracking={tracking} initialConsent={initialConsent} />
      </head>
      <body className="min-h-full flex flex-col">
        <TrackingRuntime tracking={tracking} initialConsent={initialConsent} />
        {children}
        <ConsentBanner initialConsent={initialConsent} privacyPath="/pages/privacy" />
      </body>
    </html>
  );
}
