import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogArticleBySlug } from "@/lib/storefront";
import { getKnowledgeMirrorArticle } from "@/lib/knowledge-blog";
import { getSoreDailyLifeFeatureImage } from "@/lib/sore-daily-life";
import { KnowledgeBlogArticle } from "@/components/storefront/knowledge-blog-article";

function formatPublishedDate(value: Date | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

export async function generateMetadata({ params }: { params: Promise<{ channel: string; slug: string }> }): Promise<Metadata> {
  const { channel, slug } = await params;

  if (channel === "knowledge") {
    const mirroredArticle = await getKnowledgeMirrorArticle(slug);

    if (mirroredArticle) {
      return {
        title: mirroredArticle.title,
        description: mirroredArticle.excerpt ?? undefined,
        alternates: mirroredArticle.canonicalUrl ? { canonical: mirroredArticle.canonicalUrl } : undefined,
        openGraph: {
          title: mirroredArticle.title,
          description: mirroredArticle.excerpt ?? undefined,
          type: "article",
          images: mirroredArticle.featureImage ? [{ url: mirroredArticle.featureImage }] : undefined,
        },
        twitter: {
          card: mirroredArticle.featureImage ? "summary_large_image" : "summary",
          title: mirroredArticle.title,
          description: mirroredArticle.excerpt ?? undefined,
          images: mirroredArticle.featureImage ? [mirroredArticle.featureImage] : undefined,
        },
      };
    }
  }

  const article = await getBlogArticleBySlug(channel, slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: "article",
      images: article.featureImage ? [{ url: article.featureImage }] : undefined,
    },
    twitter: {
      card: article.featureImage ? "summary_large_image" : "summary",
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.featureImage ? [article.featureImage] : undefined,
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ channel: string; slug: string }> }) {
  const { channel, slug } = await params;

  if (channel === "knowledge") {
    const mirroredArticle = await getKnowledgeMirrorArticle(slug);

    if (mirroredArticle) {
      return <KnowledgeBlogArticle article={mirroredArticle} />;
    }
  }

  const article = await getBlogArticleBySlug(channel, slug);

  if (!article) {
    notFound();
  }

  const publishedDate = formatPublishedDate(article.publishedAt ?? article.createdAt);
  const featureImage = channel === "sore-daily-life" ? getSoreDailyLifeFeatureImage(article.slug, article.featureImage) : article.featureImage;

  return (
    <div className="storefront-page-narrow pt-10">
      <article className="space-y-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
            <span className="font-medium text-[#8f1212]">{article.channel.title}</span>
            {publishedDate ? <time className="block">{publishedDate}</time> : null}
          </div>
          <h1 className="text-[2.4rem] font-semibold leading-tight tracking-[-0.03em] text-[#232323] sm:text-[2.9rem]">{article.title}</h1>
          {article.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {article.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[#f6efe6] px-3 py-1 text-xs font-medium text-[#7a6553]">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        {featureImage ? (
          <div className="overflow-hidden border border-[#ece7de] bg-white">
            <img src={featureImage} alt={article.title} className="h-full w-full object-cover" />
          </div>
        ) : null}

        {article.bodyHtml ? (
          <div className="storefront-prose max-w-none border-t border-[#ece7de] pt-8" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
        ) : article.excerpt ? (
          <p className="text-[0.98rem] leading-8 text-stone-600">{article.excerpt}</p>
        ) : null}
      </article>
    </div>
  );
}
