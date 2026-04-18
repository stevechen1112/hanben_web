import type { Metadata } from "next";
import { Noto_Serif_TC } from "next/font/google";
import { getSiteMetadataDefaults } from "@/lib/site-settings";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${notoSerifTC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
