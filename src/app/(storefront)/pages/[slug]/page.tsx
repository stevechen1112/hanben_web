import { notFound } from "next/navigation";
import { AboutPage } from "@/components/storefront/about-page";
import { CertificationPage } from "@/components/storefront/certification-page";
import { ContactForm } from "@/components/storefront/contact-form";
import { FaqPage } from "@/components/storefront/faq-page";
import { StorefrontContentTemplate } from "@/components/storefront/content-template";
import { HerbalGuidePage } from "@/components/storefront/herbal-guide-page";
import { LegalPage } from "@/components/storefront/legal-page";
import { SoreDailyLifeArticlesPage } from "@/components/storefront/sore-daily-life-articles-page";
import { SoreDailyLifePage } from "@/components/storefront/sore-daily-life-page";
import { getPublishedPageBySlug } from "@/lib/storefront";
import { parseStorefrontTemplateContent } from "@/lib/storefront-template";

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);

  if (!page) {
    notFound();
  }

  if (slug === "contact") {
    return (
      <div className="storefront-page-narrow pt-20">
        <div className="max-w-3xl">
          <h1 className="text-[2.4rem] font-semibold tracking-[-0.03em] text-[#232323] sm:text-[2.8rem]">聯絡我們</h1>
        </div>
        <div className="mt-10 pt-2">
          <ContactForm />
        </div>
      </div>
    );
  }

  const content = parseStorefrontTemplateContent(page.content);
  const rawContent = asRecord(page.content);

  if (slug === "certification") {
    return (
      <CertificationPage
        title={page.title}
        imageUrl={content.hero?.mediaUrl}
        imageAlt={content.hero?.mediaAlt}
        bodyHtml={page.bodyHtml}
      />
    );
  }

  if (slug === "about") {
    return <AboutPage title={page.title} content={rawContent} />;
  }

  if (slug === "chinese-herbal-guide") {
    return <HerbalGuidePage title={page.title} content={rawContent} />;
  }

  if (slug === "qa") {
    return <FaqPage title={page.title} bodyHtml={page.bodyHtml} />;
  }

  if (slug === "sore-daily-life") {
    return <SoreDailyLifePage />;
  }

  if (slug === "sore-daily-life-articles") {
    return <SoreDailyLifeArticlesPage />;
  }

  if (slug === "return-policy" || slug === "privacy") {
    return <LegalPage title={page.title} bodyHtml={page.bodyHtml} />;
  }

  return (
    <StorefrontContentTemplate
      eyebrow={page.template.toUpperCase()}
      title={page.title}
      bodyHtml={page.bodyHtml}
      content={content}
    />
  );
}
