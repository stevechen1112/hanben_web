"use client";

import { useState } from "react";
import Link from "next/link";

type KnowledgeBlogArticle = {
  id: string;
  slug: string;
  title: string;
  featureImage: string | null;
  tags: string[];
  mirrorCategoryNames: string[];
  mirrorTagNames: string[];
  mirrorAuthorName: string | null;
};

type KnowledgeSelection = {
  type: "category" | "tag" | "author";
  label: string;
};

const BLOG_HERO_BG_URL = "https://blog.hanben.com.tw/wp-content/uploads/2024/08/bg_6.jpg";

const preferredFilterOrder = [
  "全部",
  "搬重物勞損",
  "銀髮族 & 陳年舊傷",
  "長時間站立",
  "長期姿勢不良",
  "駕駛 & 辦公室久坐",
];

function buildFilterOptions(articles: KnowledgeBlogArticle[]) {
  const known = new Set(articles.flatMap((article) => article.tags).filter(Boolean));
  const ordered = preferredFilterOrder.filter((tag) => tag === "全部" || known.has(tag));
  const remaining = [...known].filter((tag) => !ordered.includes(tag)).sort((left, right) => left.localeCompare(right, "zh-Hant"));

  return [...ordered, ...remaining];
}

export function KnowledgeBlogHome({
  articles,
  initialSelection,
}: {
  articles: KnowledgeBlogArticle[];
  initialSelection?: KnowledgeSelection;
}) {
  const filterOptions = buildFilterOptions(articles);
  const defaultSelection = initialSelection?.type === "category" && filterOptions.includes(initialSelection.label)
    ? initialSelection
    : initialSelection ?? { type: "category", label: "全部" as const };
  const [activeSelection, setActiveSelection] = useState<KnowledgeSelection>(defaultSelection);

  const filteredArticles = articles.filter((article) => {
    if (activeSelection.type === "category") {
      return activeSelection.label === "全部"
        ? true
        : article.tags.includes(activeSelection.label) || article.mirrorCategoryNames.includes(activeSelection.label);
    }

    if (activeSelection.type === "tag") {
      return article.mirrorTagNames.includes(activeSelection.label);
    }

    return article.mirrorAuthorName === activeSelection.label;
  });

  const contextualLabel = activeSelection.type === "tag"
    ? `標籤：${activeSelection.label}`
    : activeSelection.type === "author"
      ? `作者：${activeSelection.label}`
      : null;

  return (
    <>
      <div data-blog-knowledge-home-marker className="hidden" />

      <div data-blog-knowledge-home className="bg-white text-[#313131]">
        <section
          className="relative isolate overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(24, 15, 8, 0.42), rgba(24, 15, 8, 0.42)), url(${BLOG_HERO_BG_URL})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <div className="mx-auto flex min-h-[96px] max-w-[1600px] items-center justify-center px-6 py-5 sm:min-h-[112px] sm:py-6">
            <h1 className="text-center text-[2rem] font-semibold tracking-[-0.02em] text-white sm:text-[2.2rem]">
              脊椎養護小知識
            </h1>
          </div>
        </section>

        <section
          id="knowledge-filters"
          className="relative isolate overflow-hidden bg-[#fcfbf8] px-5 py-12 sm:px-8 sm:py-16 lg:px-10"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.065]"
            style={{
              backgroundImage: `url(${BLOG_HERO_BG_URL})`,
              backgroundPosition: "center top",
              backgroundRepeat: "repeat",
              backgroundSize: "1100px auto",
            }}
          />

          <div className="mx-auto max-w-[1204px]">
            <div className="relative space-y-6 text-center sm:space-y-7">
              <h2 className="text-[1.7rem] font-medium tracking-[0.02em] text-[#7c5f36] sm:text-[1.75rem]">熱門文章</h2>

              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[1rem] text-[#6a6a6a]">
                {filterOptions.map((filter) => {
                  const isActive = activeSelection.type === "category" && activeSelection.label === filter;

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveSelection({ type: "category", label: filter })}
                      aria-pressed={isActive}
                      className={`font-normal transition ${isActive ? "text-[#0c0d0e]" : "text-[#69727d] hover:text-[#2e2e2e]"}`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              {contextualLabel ? (
                <div className="mx-auto flex max-w-fit items-center gap-3 rounded-full border border-[#e6dccf] bg-white/90 px-4 py-2 text-[0.88rem] leading-6 text-[#6a6056] shadow-[0_8px_20px_rgba(72,53,25,0.06)]">
                  <span>{contextualLabel}</span>
                  <Link href="/blogs/knowledge#knowledge-filters" className="font-medium text-[#8f1212] transition hover:text-[#671010]">
                    清除條件
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="relative mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
              {filteredArticles.map((article) => {
                const href = `/blogs/knowledge/${article.slug}`;
                const imageUrl = article.featureImage;

                return (
                  <article key={article.id} className="group min-w-0">
                    <div className="relative transition duration-300 group-hover:-translate-y-0.5">
                      <Link href={href} className="block overflow-hidden rounded-[20px]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={article.title}
                            className="h-[240px] w-full rounded-[20px] object-cover object-center transition duration-500 group-hover:scale-[1.018]"
                          />
                        ) : (
                          <div className="h-[240px] w-full rounded-[20px] bg-[linear-gradient(140deg,#d8d1c9_0%,#f0ece5_100%)]" />
                        )}
                      </Link>

                      <div className="relative z-10 mx-5 -mt-[30px] flex h-[150px] flex-col rounded-[10px] bg-white px-5 py-5 shadow-[0_0_10px_rgba(0,0,0,0.08)]">
                        <div className="min-h-[17px] text-[0.75rem] leading-[17px] text-[#7d6c50]">
                          {article.tags.map((tag, index) => (
                            <span key={tag}>
                              {index > 0 ? <span className="text-[#7d6c50]">, </span> : null}
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>

                        <h3 className="mt-3 line-clamp-2 min-h-[48px] text-[1rem] leading-6 text-[#313131]">
                          <Link href={href} className="transition hover:text-[#313131]">
                            {article.title}
                          </Link>
                        </h3>

                        <div className="mt-auto text-right text-[0.75rem] leading-3 text-[#7d6c50]">
                          <Link href={href} className="transition hover:text-[#7d6c50]">
                            Read More &gt;&gt;
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredArticles.length === 0 ? (
              <div className="mx-auto mt-12 max-w-2xl rounded-[22px] border border-[#e5ded6] bg-white/85 px-8 py-10 text-center text-[1rem] leading-8 text-[#7c7267] shadow-[0_10px_24px_rgba(72,53,25,0.08)]">
                {activeSelection.type === "category" ? "目前這個分類還沒有可顯示的文章。" : "目前這個條件還沒有可顯示的文章。"}
              </div>
            ) : null}
          </div>
        </section>

        <footer className="bg-[linear-gradient(165deg,#bf953f_0%,#fcf6ba_25%,#aa771c_100%)] px-6 py-8 text-center text-[#2b241e]">
          <p className="text-[1rem] font-semibold leading-7 sm:text-[1.06rem]">用承襲三代的漢方智慧 - 守護三代的行動關鍵</p>
          <p className="mt-2 text-[0.95rem] leading-7 sm:text-[1rem]">三代共同的僵 ∙ 沉 ∙ 重 ─ 用承襲三代的漢方智慧守護</p>
        </footer>
      </div>
    </>
  );
}