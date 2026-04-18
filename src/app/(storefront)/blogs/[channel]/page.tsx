import Link from "next/link";
import { notFound } from "next/navigation";
import { KnowledgeBlogHome } from "@/components/storefront/knowledge-blog-home";
import { getKnowledgeMirrorArticleSummary } from "@/lib/knowledge-blog";
import { getBlogChannelBySlug } from "@/lib/storefront";
import { getSoreDailyLifeFeatureImage } from "@/lib/sore-daily-life";

function getFirstSearchParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : value?.[0];
}

export default async function BlogChannelPage({
  params,
  searchParams,
}: {
  params: Promise<{ channel: string }>;
  searchParams: Promise<{
    filter?: string | string[];
    categorySlug?: string | string[];
    tag?: string | string[];
    tagSlug?: string | string[];
    author?: string | string[];
    authorSlug?: string | string[];
  }>;
}) {
  const { channel } = await params;
  const resolvedSearchParams = await searchParams;
  const blogChannel = await getBlogChannelBySlug(channel);

  if (!blogChannel) {
    notFound();
  }

  if (channel === "knowledge") {
    const knowledgeArticlesWithSummary = await Promise.all(blogChannel.articles.map(async (article) => {
      const summary = await getKnowledgeMirrorArticleSummary(article.slug);

      return {
        article,
        summary,
      };
    }));

    const knowledgeArticles = knowledgeArticlesWithSummary.map(({ article, summary }) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      featureImage: summary?.featureImage ?? article.featureImage,
      tags: article.tags,
      mirrorCategoryNames: summary?.categories.map((category) => category.name) ?? [],
      mirrorTagNames: summary?.tags.map((tag) => tag.name) ?? [],
      mirrorAuthorName: summary?.author?.name ?? null,
    }));

    const initialFilter = getFirstSearchParam(resolvedSearchParams.filter);
    const initialCategorySlug = getFirstSearchParam(resolvedSearchParams.categorySlug);
    const initialTag = getFirstSearchParam(resolvedSearchParams.tag);
    const initialTagSlug = getFirstSearchParam(resolvedSearchParams.tagSlug);
    const initialAuthor = getFirstSearchParam(resolvedSearchParams.author);
    const initialAuthorSlug = getFirstSearchParam(resolvedSearchParams.authorSlug);

    const categoryNameBySlug = initialCategorySlug
      ? knowledgeArticlesWithSummary
          .map(({ summary }) => summary?.categories.find((category) => category.slug === initialCategorySlug)?.name ?? null)
          .find((value): value is string => Boolean(value))
      : null;

    const tagNameBySlug = initialTagSlug
      ? knowledgeArticlesWithSummary
          .map(({ summary }) => summary?.tags.find((tag) => tag.slug === initialTagSlug)?.name ?? null)
          .find((value): value is string => Boolean(value))
      : null;

    const authorNameBySlug = initialAuthorSlug
      ? knowledgeArticlesWithSummary
          .map(({ summary }) => summary?.author?.slug === initialAuthorSlug ? summary.author.name : null)
          .find((value): value is string => Boolean(value))
      : null;

    const initialSelection = categoryNameBySlug
      ? { type: "category" as const, label: categoryNameBySlug }
      : initialFilter
        ? { type: "category" as const, label: initialFilter }
        : tagNameBySlug
          ? { type: "tag" as const, label: tagNameBySlug }
          : initialTag
            ? { type: "tag" as const, label: initialTag }
            : authorNameBySlug
              ? { type: "author" as const, label: authorNameBySlug }
              : initialAuthor
                ? { type: "author" as const, label: initialAuthor }
                : undefined;

    return (
      <KnowledgeBlogHome
        articles={knowledgeArticles}
        initialSelection={initialSelection}
      />
    );
  }

  if (channel === "sore-daily-life") {
    return (
      <div className="mx-auto max-w-[1120px] px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-0">
        <h1 className="text-[2.45rem] font-semibold tracking-[-0.04em] text-[#232323] sm:text-[2.95rem]">{blogChannel.title}</h1>

        <div className="mt-14 space-y-10">
          {blogChannel.articles.length > 0 ? blogChannel.articles.map((article) => {
            const featureImage = getSoreDailyLifeFeatureImage(article.slug, article.featureImage);

            return (
              <article key={article.id} className="border-t border-[#d7d0c6] pt-10 first:border-t-0 first:pt-0">
                <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:items-center lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
                  <div className="flex justify-center md:justify-start">
                    {featureImage ? <img src={featureImage} alt={article.title} className="h-[220px] w-[220px] object-contain lg:h-[240px] lg:w-[240px]" /> : null}
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-[#232323]">{article.title}</h2>
                    {article.excerpt ? <p className="max-w-[680px] text-[1rem] leading-[1.95] text-[#5a514a]">{article.excerpt}</p> : null}
                    <Link href={`/blogs/${blogChannel.slug}/${article.slug}`} className="inline-flex text-sm font-semibold tracking-[0.08em] text-[#8f1212] transition hover:text-[#661010]">
                      閱讀全文
                    </Link>
                  </div>
                </div>
              </article>
            );
          }) : (
            <div className="border border-dashed border-[#d9bf84] bg-[#fffaf0] p-10 text-sm leading-7 text-stone-600">
              這個頻道目前還沒有已發佈文章。
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="storefront-page pt-10">
      <div className="max-w-3xl">
        <h1 className="text-[2.4rem] font-semibold tracking-[-0.03em] text-[#232323] sm:text-[2.8rem]">{blogChannel.title}</h1>
        {blogChannel.description ? <p className="mt-4 max-w-2xl text-[0.98rem] leading-8 text-stone-600">{blogChannel.description}</p> : null}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {blogChannel.articles.length > 0 ? blogChannel.articles.map((article) => (
          <article key={article.id} className="overflow-hidden border border-[#ece7de] bg-white">
            <div className="aspect-[16/10] bg-white">
              {article.featureImage ? <img src={article.featureImage} alt={article.title} className="h-full w-full object-cover" /> : null}
            </div>
            <div className="space-y-4 border-t border-[#f4efe8] p-6">
              <h2 className="text-[1.9rem] font-semibold leading-tight text-[#232323]">{article.title}</h2>
              {article.excerpt ? <p className="text-sm leading-7 text-stone-600">{article.excerpt}</p> : null}
              <Link href={`/blogs/${blogChannel.slug}/${article.slug}`} className="inline-flex text-sm font-semibold text-[#8f1212] transition hover:text-[#661010]">
                閱讀全文
              </Link>
            </div>
          </article>
        )) : (
          <div className="border border-dashed border-[#d9bf84] bg-[#fffaf0] p-10 text-sm leading-7 text-stone-600 lg:col-span-2">
            這個頻道目前還沒有已發佈文章。
          </div>
        )}
      </div>
    </div>
  );
}
