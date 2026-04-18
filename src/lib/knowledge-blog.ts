import { cache } from "react";
import sanitizeHtml from "sanitize-html";

type WordpressTerm = {
  name?: string;
  slug?: string;
  link?: string;
};

type WordpressFeaturedMedia = {
  source_url?: string;
};

type WordpressPost = {
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  date?: string;
  link?: string;
  content?: { rendered?: string };
  _embedded?: {
    [key: string]: unknown;
    "wp:featuredmedia"?: WordpressFeaturedMedia[];
    "wp:term"?: WordpressTerm[][];
  };
};

type ResolvedWordpressPost = WordpressPost & {
  title: { rendered: string };
  content: { rendered: string };
};

type KnowledgeMirrorTerm = {
  name: string;
  slug: string | null;
  link: string | null;
};

type KnowledgeMirrorAuthor = {
  name: string;
  slug: string | null;
  link: string | null;
  imageUrl: string | null;
  credentials: string[];
};

type KnowledgeMirrorCta = {
  href: string;
  imageUrl: string;
};

export type KnowledgeMirrorArticle = {
  title: string;
  excerpt: string | null;
  publishedDate: string | null;
  canonicalUrl: string | null;
  featureImage: string | null;
  categories: KnowledgeMirrorTerm[];
  tags: KnowledgeMirrorTerm[];
  author: KnowledgeMirrorAuthor | null;
  cta: KnowledgeMirrorCta | null;
  contentHtml: string;
};

export type KnowledgeMirrorArticleSummary = {
  featureImage: string | null;
  categories: KnowledgeMirrorTerm[];
  tags: KnowledgeMirrorTerm[];
  author: KnowledgeMirrorAuthor | null;
};

const KNOWLEDGE_WP_API = "https://blog.hanben.com.tw/wp-json/wp/v2/posts";
const KNOWLEDGE_BLOG_ORIGIN = "https://blog.hanben.com.tw";
const KNOWLEDGE_NON_ARTICLE_ROOT_SEGMENTS = new Set(["category", "tag", "author-name", "wp-content", "wp-json"]);

const KNOWLEDGE_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "figure",
    "figcaption",
    "iframe",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "div",
    "span",
    "svg",
    "path",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": ["class", "id"],
    a: ["href", "name", "target", "rel", "class", "aria-label"],
    img: ["src", "alt", "width", "height", "loading", "srcset", "sizes", "class"],
    iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen"],
    td: ["colspan", "rowspan", "class"],
    th: ["colspan", "rowspan", "class"],
    svg: ["xmlns", "viewBox", "width", "height", "aria-hidden", "focusable", "class"],
    path: ["d", "fill"],
  },
  allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
};

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function rewriteKnowledgeHref(currentSlug: string, href: string) {
  try {
    if (href.startsWith("#")) {
      return href;
    }

    const resolvedUrl = new URL(href, `${KNOWLEDGE_BLOG_ORIGIN}/${currentSlug}/`);

    if (resolvedUrl.origin !== KNOWLEDGE_BLOG_ORIGIN) {
      return href;
    }

    if (resolvedUrl.pathname === `/${currentSlug}/` && resolvedUrl.hash) {
      return resolvedUrl.hash;
    }

    const pathSegments = resolvedUrl.pathname.split("/").filter(Boolean);

    if (pathSegments[0] === "category" && pathSegments[1]) {
      return `/blogs/knowledge?categorySlug=${encodeURIComponent(pathSegments[1])}#knowledge-filters`;
    }

    if (pathSegments[0] === "tag" && pathSegments[1]) {
      return `/blogs/knowledge?tagSlug=${encodeURIComponent(pathSegments[1])}#knowledge-filters`;
    }

    if (pathSegments[0] === "author-name" && pathSegments[1]) {
      return `/blogs/knowledge?authorSlug=${encodeURIComponent(pathSegments[1])}#knowledge-filters`;
    }

    if (pathSegments.length === 1 && !KNOWLEDGE_NON_ARTICLE_ROOT_SEGMENTS.has(pathSegments[0])) {
      const targetSlug = pathSegments[0];
      const targetHash = resolvedUrl.hash ?? "";

      return `/blogs/knowledge/${targetSlug}${targetHash}`;
    }

    return href;
  } catch {
    return href;
  }
}

function sanitizeKnowledgeContent(html: string, slug: string) {
  const normalized = html
    .replace(/<span class="ez-toc-title-toggle">[\s\S]*?<\/span>/i, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<p>(\s|&nbsp;)*<\/p>/gi, "");

  return sanitizeHtml(normalized, {
    ...KNOWLEDGE_SANITIZE_OPTIONS,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          href: attribs.href ? rewriteKnowledgeHref(slug, attribs.href) : attribs.href,
        },
      }),
    },
  });
}

function stripHtml(value: string) {
  return decodeHtmlEntities(sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })) || null;
}

function extractKnowledgeAuthor(pageHtml: string) {
  const authorNameMatch = pageHtml.match(/<a[^>]+href="([^"]*\/author-name\/[^">]+)"[^>]*>([^<]+)<\/a>/i);

  if (!authorNameMatch) {
    return null;
  }

  const authorIndex = pageHtml.indexOf(authorNameMatch[0]);
  const authorWindowStart = Math.max(0, authorIndex - 2500);
  const authorWindowEnd = Math.min(pageHtml.length, authorIndex + 6000);
  const authorWindow = pageHtml.slice(authorWindowStart, authorWindowEnd);

  const authorImageMatch = authorWindow.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
  const credentialsBlockMatch = authorWindow.match(/<ul[^>]*class="[^"]*wp-block-list[^"]*"[^>]*>([\s\S]*?)<\/ul>/i);
  const credentialMatches = Array.from((credentialsBlockMatch?.[1] ?? "").matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi));
  const credentials = credentialMatches
    .map((match) => stripHtml(match[1] ?? ""))
    .filter((value): value is string => Boolean(value));

  const authorLink = authorNameMatch[1] ?? null;
  const authorSlug = authorLink?.match(/\/author-name\/([^/?#]+)/i)?.[1] ?? null;

  return {
    name: decodeHtmlEntities(authorNameMatch[2] ?? ""),
    slug: authorSlug,
    link: authorLink,
    imageUrl: authorImageMatch?.[1] ?? null,
    credentials,
  } satisfies KnowledgeMirrorAuthor;
}

function extractKnowledgeCta(pageHtml: string) {
  const ctaMatch = pageHtml.match(/<a[^>]+href="(https:\/\/lin\.ee\/[^">]+)"[^>]*>\s*<img[^>]+src="([^">]+)"[^>]*>/i);

  if (!ctaMatch) {
    return null;
  }

  return {
    href: ctaMatch[1],
    imageUrl: ctaMatch[2],
  } satisfies KnowledgeMirrorCta;
}

function extractKnowledgePageDetails(pageHtml: string) {
  return {
    author: extractKnowledgeAuthor(pageHtml),
    cta: extractKnowledgeCta(pageHtml),
  };
}

async function getKnowledgePageDetails(post: WordpressPost) {
  if (!post.link) {
    return {
      author: null,
      cta: null,
    };
  }

  const response = await fetch(post.link, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return {
      author: null,
      cta: null,
    };
  }

  return extractKnowledgePageDetails(await response.text());
}

const getKnowledgePost = cache(async (slug: string): Promise<ResolvedWordpressPost | null> => {
  const response = await fetch(`${KNOWLEDGE_WP_API}?slug=${encodeURIComponent(slug)}&_embed=1`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return null;
  }

  const posts = await response.json() as WordpressPost[];
  const post = posts[0];

  if (!post?.content?.rendered || !post.title?.rendered) {
    return null;
  }

  return post as ResolvedWordpressPost;
});

function getTerms(post: WordpressPost, index: number) {
  const groups = post._embedded?.["wp:term"];
  const terms = groups?.[index] ?? [];
  return terms
    .map((term) => ({
      name: decodeHtmlEntities(term.name ?? ""),
      slug: term.slug ?? null,
      link: term.link ?? null,
    }))
    .filter((term) => term.name);
}

export const getKnowledgeMirrorArticleSummary = cache(async (slug: string): Promise<KnowledgeMirrorArticleSummary | null> => {
  const post = await getKnowledgePost(slug);

  if (!post) {
    return null;
  }

  const pageDetails = await getKnowledgePageDetails(post);

  return {
    featureImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
    categories: getTerms(post, 0),
    tags: getTerms(post, 1),
    author: pageDetails.author,
  };
});

export const getKnowledgeMirrorArticle = cache(async (slug: string): Promise<KnowledgeMirrorArticle | null> => {
  const post = await getKnowledgePost(slug);

  if (!post) {
    return null;
  }

  const pageDetails = await getKnowledgePageDetails(post);

  return {
    title: decodeHtmlEntities(post.title.rendered),
    excerpt: stripHtml(post.excerpt?.rendered ?? post.content.rendered),
    publishedDate: post.date ? post.date.slice(0, 10) : null,
    canonicalUrl: post.link ?? null,
    featureImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
    categories: getTerms(post, 0),
    tags: getTerms(post, 1),
    author: pageDetails.author,
    cta: pageDetails.cta,
    contentHtml: sanitizeKnowledgeContent(post.content.rendered, slug),
  };
});