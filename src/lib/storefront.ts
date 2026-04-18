import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { getManagedLegacyOfficialUrl } from "@/lib/legacy-official-media";

type MenuItemRecord = {
  id: string;
  title: string;
  url: string;
  isExternal: boolean;
  sortOrder: number;
  parentId: string | null;
};

export type StorefrontNavItem = {
  id: string;
  title: string;
  url: string;
  isExternal: boolean;
  children: StorefrontNavItem[];
};

export type ProductCard = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  variantId: string | null;
  inventory: number;
  price: number | null;
  compareAtPrice: number | null;
};

const productCardSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  images: {
    orderBy: { sortOrder: "asc" },
    take: 1,
    select: {
      url: true,
      altText: true,
    },
  },
  variants: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 1,
    select: {
      id: true,
      inventory: true,
      price: true,
      compareAtPrice: true,
    },
  },
} satisfies Prisma.ProductSelect;

const collectionDetailInclude = {
  products: {
    orderBy: { sortOrder: "asc" },
    include: {
      product: {
        select: productCardSelect,
      },
    },
  },
} satisfies Prisma.CollectionInclude;

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  return value == null ? null : Number(value);
}

function buildSlugCandidates(rawSlug: string) {
  const candidates = new Set<string>();
  const normalizedInput = rawSlug.trim();

  if (normalizedInput) {
    candidates.add(normalizedInput);
  }

  try {
    const decoded = decodeURIComponent(normalizedInput);
    if (decoded) {
      candidates.add(decoded);
    }
  } catch {
    // Ignore invalid URI segments and fall back to the raw slug.
  }

  for (const slug of [...candidates]) {
    candidates.add(slug.normalize("NFC"));
    candidates.add(slug.normalize("NFD"));
    candidates.add(slug.normalize("NFKC"));
    candidates.add(slug.normalize("NFKD"));
  }

  return [...candidates].filter(Boolean);
}

function buildMenuTree(items: MenuItemRecord[], parentId: string | null = null): StorefrontNavItem[] {
  return items
    .filter((item) => item.parentId === parentId)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      isExternal: item.isExternal,
      children: buildMenuTree(items, item.id),
    }));
}

function mapProductCard(product: Prisma.ProductGetPayload<{ select: typeof productCardSelect }>): ProductCard {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    imageUrl: product.images[0]?.url ?? null,
    imageAlt: product.images[0]?.altText ?? product.title,
    variantId: product.variants[0]?.id ?? null,
    inventory: product.variants[0]?.inventory ?? 0,
    price: toNumber(product.variants[0]?.price),
    compareAtPrice: toNumber(product.variants[0]?.compareAtPrice),
  };
}

export const getStorefrontChrome = cache(async () => {
  const [settings, announcement, menus] = await Promise.all([
    db.siteSetting.findMany(),
    db.announcementBar.findFirst({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.navigationMenu.findMany({
      where: { location: { in: ["header", "footer"] } },
      include: {
        items: {
          orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
        },
      },
    }),
  ]);

  const settingMap = new Map(settings.map((entry) => [entry.key, entry.value]));
  const header = menus.find((menu) => menu.location === "header");
  const footer = menus.find((menu) => menu.location === "footer");

  return {
    settings: {
      siteName: settingMap.get("site_name") || "漢本三代",
      siteTagline: settingMap.get("site_tagline") || "傳承三代的漢方智慧",
      siteLogoUrl: settingMap.get("site_logo_url") || getManagedLegacyOfficialUrl("/official/shared/header-logo.png"),
      contactPhone: settingMap.get("contact_phone") || "0800-000-848",
      contactEmail: settingMap.get("contact_email") || "service@hanben.com.tw",
      contactAddress: settingMap.get("contact_address") || "243新北市泰山區仁義路222號1樓",
      serviceHours: settingMap.get("service_hours") || "周一至週五(09:00 ~ 17:30)",
      brandStatement: settingMap.get("brand_statement") || "用承襲三代的漢方智慧 - 守護三代的行動關鍵",
      brandSummary: settingMap.get("brand_summary") || "漢本三代 ─ 全天然漢方，科學精萃，穩固強健，維持行動關鍵",
      facebookUrl: settingMap.get("facebook_url") || "",
      instagramUrl: settingMap.get("instagram_url") || "",
      lineUrl: settingMap.get("line_url") || "",
      freeShippingThreshold: settingMap.get("free_shipping_threshold") || "1500",
    },
    announcement,
    headerItems: buildMenuTree((header?.items ?? []) as MenuItemRecord[]),
    footerItems: buildMenuTree((footer?.items ?? []) as MenuItemRecord[]),
  };
});

export const getHomepageData = cache(async () => {
  const [slides, sections, featuredProducts] = await Promise.all([
    db.heroSlide.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.homepageSection.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: productCardSelect,
    }),
  ]);

  return {
    slides,
    sections,
    featuredProducts: featuredProducts.map(mapProductCard),
  };
});

export const getCollections = cache(async () => {
  return db.collection.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      products: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: {
            select: productCardSelect,
          },
        },
      },
    },
  });
});

export const getCollectionBySlug = cache(async (slug: string) => {
  return db.collection.findFirst({
    where: { slug: { in: buildSlugCandidates(slug) } },
    include: collectionDetailInclude,
  });
});

export const getProductBySlug = cache(async (slug: string) => {
  return db.product.findFirst({
    where: {
      slug: { in: buildSlugCandidates(slug) },
      status: "ACTIVE",
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      collections: {
        include: {
          collection: true,
        },
      },
    },
  });
});

export const getPublishedPageBySlug = cache(async (slug: string) => {
  return db.page.findFirst({
    where: { slug: { in: buildSlugCandidates(slug) }, isPublished: true },
  });
});

export const getBlogChannelBySlug = cache(async (slug: string) => {
  return db.blogChannel.findUnique({
    where: { slug },
    include: {
      articles: {
        where: { isPublished: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      },
    },
  });
});

export const getBlogArticleBySlug = cache(async (channelSlug: string, articleSlug: string) => {
  return db.blogArticle.findFirst({
    where: {
      slug: { in: buildSlugCandidates(articleSlug) },
      isPublished: true,
      channel: { slug: channelSlug },
    },
    include: {
      channel: true,
    },
  });
});
