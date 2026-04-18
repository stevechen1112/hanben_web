import type { ReactNode } from "react";
import Link from "next/link";
import type { KnowledgeMirrorArticle } from "@/lib/knowledge-blog";

const KNOWLEDGE_DISCLAIMER = "免責聲明：本站所提供或刊載之醫學與健康文章，僅作為就醫參考使用，不具醫療、診療、治療之目的或功能。";

function KnowledgeMetaIcon({ children }: { children: ReactNode }) {
  return (
    <span className="knowledge-article-meta-icon" aria-hidden="true">
      {children}
    </span>
  );
}

export function KnowledgeBlogArticle({ article }: { article: KnowledgeMirrorArticle }) {
  return (
    <div className="knowledge-article-page">
      <article className="knowledge-article-shell">
        <div className="knowledge-article-breadcrumb">
          <Link href="/blogs/knowledge" className="transition hover:text-[#8f1212]">
            養護知識
          </Link>
          <span>/</span>
          <span>{article.title}</span>
        </div>

        <div className="knowledge-article-meta">
          {article.publishedDate ? (
            <div className="knowledge-article-meta-item">
              <KnowledgeMetaIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3.75" y="5.25" width="16.5" height="15" rx="2.25" />
                  <path d="M7.5 3.75v3M16.5 3.75v3M3.75 9.75h16.5" />
                </svg>
              </KnowledgeMetaIcon>
              <time>{article.publishedDate}</time>
            </div>
          ) : null}
          {article.categories.length > 0 ? (
            <div className="knowledge-article-meta-item knowledge-article-categories">
              <KnowledgeMetaIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4.5 6.75a2.25 2.25 0 0 1 2.25-2.25h5.59a2.25 2.25 0 0 1 1.591.659l5.566 5.566a2.25 2.25 0 0 1 0 3.182l-5.598 5.598a2.25 2.25 0 0 1-3.182 0L5.159 13.84A2.25 2.25 0 0 1 4.5 12.249V6.75Z" />
                  <circle cx="9" cy="9" r="1.25" fill="currentColor" stroke="none" />
                </svg>
              </KnowledgeMetaIcon>
              {article.categories.map((category, index) => (
                <span key={category.name}>
                  {index > 0 ? <span>, </span> : null}
                  <Link
                    href={{
                      pathname: "/blogs/knowledge",
                      query: { filter: category.name },
                      hash: "knowledge-filters",
                    }}
                    className="transition hover:text-[#8f1212]"
                  >
                    {category.name}
                  </Link>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <h1 className="knowledge-article-title">{article.title}</h1>

        {article.featureImage ? (
          <div className="knowledge-article-feature">
            <img src={article.featureImage} alt={article.title} className="knowledge-article-feature-image" />
          </div>
        ) : null}

        <div className="knowledge-article-content" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />

        {article.tags.length > 0 ? (
          <div className="knowledge-article-tags">
            <KnowledgeMetaIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4.5 6.75a2.25 2.25 0 0 1 2.25-2.25h5.59a2.25 2.25 0 0 1 1.591.659l5.566 5.566a2.25 2.25 0 0 1 0 3.182l-5.598 5.598a2.25 2.25 0 0 1-3.182 0L5.159 13.84A2.25 2.25 0 0 1 4.5 12.249V6.75Z" />
                <circle cx="9" cy="9" r="1.25" fill="currentColor" stroke="none" />
              </svg>
            </KnowledgeMetaIcon>
            <div className="knowledge-article-tags-list">
              {article.tags.map((tag, index) => (
                <span key={tag.name}>
                  {index > 0 ? <span>, </span> : null}
                  <Link
                    href={{
                      pathname: "/blogs/knowledge",
                      query: tag.slug ? { tagSlug: tag.slug } : { tag: tag.name },
                      hash: "knowledge-filters",
                    }}
                    className="transition hover:text-[#8f1212]"
                  >
                    {tag.name}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {article.author ? (
          <section className="knowledge-article-author">
            {article.author.imageUrl ? (
              <img src={article.author.imageUrl} alt={article.author.name} className="knowledge-article-author-image" />
            ) : null}
            <div className="knowledge-article-author-copy">
              <p className="knowledge-article-author-label">作者</p>
              {article.author.slug || article.author.name ? (
                <Link
                  href={{
                    pathname: "/blogs/knowledge",
                    query: article.author.slug ? { authorSlug: article.author.slug } : { author: article.author.name },
                    hash: "knowledge-filters",
                  }}
                  className="knowledge-article-author-name transition hover:text-[#8f1212]"
                >
                  {article.author.name}
                </Link>
              ) : (
                <p className="knowledge-article-author-name">{article.author.name}</p>
              )}
              {article.author.credentials.length > 0 ? (
                <ul className="knowledge-article-author-list">
                  {article.author.credentials.map((credential) => (
                    <li key={credential}>{credential}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ) : null}

        {article.cta ? (
          <a href={article.cta.href} className="knowledge-article-cta" aria-label="加入漢本官方 LINE">
            <img src={article.cta.imageUrl} alt="加入漢本官方 LINE" className="knowledge-article-cta-image" />
          </a>
        ) : null}

        <p className="knowledge-article-disclaimer">{KNOWLEDGE_DISCLAIMER}</p>
      </article>
    </div>
  );
}