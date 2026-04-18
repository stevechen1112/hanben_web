import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ products: [], articles: [] });
  }

  const [products, articles] = await Promise.all([
    db.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { bodyHtml: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      },
      take: 8,
    }),
    db.blogArticle.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
          { bodyHtml: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      },
      include: { channel: { select: { slug: true, title: true } } },
      take: 5,
    }),
  ]);

  const response = NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      image: p.images[0]?.url ?? null,
      price: p.variants[0]?.price?.toString() ?? null,
    })),
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      channelSlug: a.channel.slug,
      channelTitle: a.channel.title,
      excerpt: a.excerpt,
    })),
  });
  response.headers.set("Cache-Control", "public, max-age=30, s-maxage=30, stale-while-revalidate=120");
  return response;
}
