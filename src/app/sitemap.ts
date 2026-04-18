import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const [products, pages, articles, collections] = await Promise.all([
    db.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    db.page.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    db.blogArticle.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true, channel: { select: { slug: true } } } }),
    db.collection.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...products.map((item) => ({ url: `${baseUrl}/products/${item.slug}`, lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...pages.map((item) => ({ url: `${baseUrl}/pages/${item.slug}`, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...articles.map((item) => ({ url: `${baseUrl}/blogs/${item.channel.slug}/${item.slug}`, lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...collections.map((item) => ({ url: `${baseUrl}/collections/${item.slug}`, lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}