import Link from "next/link";
import { ProductListTracker } from "@/components/storefront/tracking/product-list-tracker";
import { SearchResultsTracker } from "@/components/storefront/tracking/search-results-tracker";
import { db } from "@/lib/db";
import { getTrackingNamingSettings } from "@/lib/site-settings";

function formatCurrency(value: number | null) {
  if (value == null) return "即將上架";
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const keyword = q.trim();
  const trackingNaming = await getTrackingNamingSettings();

  const [products, articles] = keyword
    ? await Promise.all([
        db.product.findMany({
          where: {
            status: "ACTIVE",
            OR: [
              { title: { contains: keyword, mode: "insensitive" } },
              { description: { contains: keyword, mode: "insensitive" } },
              { tags: { has: keyword } },
            ],
          },
          take: 12,
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 1 },
            collections: {
              where: {
                collection: {
                  slug: { in: ["all", "frontpage"] },
                },
              },
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { sortOrder: true },
            },
          },
        }),
        db.blogArticle.findMany({
          where: {
            isPublished: true,
            OR: [
              { title: { contains: keyword, mode: "insensitive" } },
              { excerpt: { contains: keyword, mode: "insensitive" } },
              { tags: { has: keyword } },
            ],
          },
          orderBy: { publishedAt: "desc" },
          take: 8,
          include: { channel: true },
        }),
      ])
    : [[], []];

  const sortedProducts = [...products].sort((left, right) => {
    const leftSort = left.collections[0]?.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightSort = right.collections[0]?.sortOrder ?? Number.MAX_SAFE_INTEGER;

    if (leftSort !== rightSort) {
      return leftSort - rightSort;
    }

    return left.title.localeCompare(right.title, "zh-Hant");
  });

  return (
    <div className="storefront-page">
      {keyword ? (
        <SearchResultsTracker
          articleCount={articles.length}
          productCount={sortedProducts.length}
          searchTerm={keyword}
        />
      ) : null}
      {keyword && sortedProducts.length > 0 ? (
        <ProductListTracker
          items={sortedProducts.map((product) => ({
            id: product.id,
            price: product.variants[0] ? Number(product.variants[0].price) : null,
            sku: product.variants[0]?.sku ?? null,
            title: product.title,
            variantId: product.variants[0]?.id ?? null,
            variantTitle: product.variants[0]?.title ?? null,
          }))}
          listId={`${trackingNaming.searchListIdPrefix}${keyword}`}
          listName={`${trackingNaming.searchListNamePrefix}${keyword}`}
          pageType="searchresults"
        />
      ) : null}
      <div className="mb-10 border-b border-[#ece7de] pb-6 text-center">
        <h1 className="text-[2.2rem] font-semibold tracking-[0.08em] text-[#3f3a37] sm:text-[2.6rem]">搜尋商品與內容</h1>
      </div>

      <form className="border border-[#e8dfcd] bg-white p-6">
        <label className="block text-sm font-semibold tracking-[0.18em] text-stone-700">輸入關鍵字</label>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input name="q" defaultValue={keyword} placeholder="例如：舒活飲、痠痛、漢方" className="storefront-input" />
          <button type="submit" className="storefront-button">開始搜尋</button>
        </div>
      </form>

      {keyword ? (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#671515]">商品結果</h2>
              <span className="text-sm text-stone-500">{products.length} 筆</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {sortedProducts.length > 0 ? sortedProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group overflow-hidden border border-[#dcc28a]/35 bg-white transition hover:-translate-y-1">
                  <div className="aspect-[4/3] overflow-hidden bg-white">
                    {product.images[0] ? <img src={product.images[0].url} alt={product.images[0].altText ?? product.title} className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105" /> : null}
                  </div>
                  <div className="space-y-2 p-5">
                    <h3 className="text-2xl font-semibold text-[#3f3a37]">{product.title}</h3>
                    <p className="line-clamp-2 text-sm leading-7 text-stone-600">{product.description}</p>
                    <p className="font-semibold text-[#4b433d]">{formatCurrency(product.variants[0] ? Number(product.variants[0].price) : null)}</p>
                  </div>
                </Link>
              )) : <p className="border border-dashed border-[#d8bb82] bg-[#fffaf0] p-8 text-sm leading-7 text-stone-600 md:col-span-2">找不到符合關鍵字的商品。</p>}
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#671515]">文章結果</h2>
              <span className="text-sm text-stone-500">{articles.length} 筆</span>
            </div>
            <div className="space-y-4">
              {articles.length > 0 ? articles.map((article) => (
                <Link key={article.id} href={`/blogs/${article.channel.slug}/${article.slug}`} className="block border border-[#dcc28a]/35 bg-white p-6 transition hover:-translate-y-1">
                  <p className="text-xs font-semibold tracking-[0.24em] text-[#b72020]">{article.channel.title}</p>
                  <h3 className="mt-3 text-2xl font-semibold text-[#3f3a37]">{article.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-stone-600">{article.excerpt}</p>
                </Link>
              )) : <p className="border border-dashed border-[#d8bb82] bg-[#fffaf0] p-8 text-sm leading-7 text-stone-600">找不到符合關鍵字的文章。</p>}
            </div>
          </section>
        </div>
      ) : (
        <div className="mt-10 border border-dashed border-[#d8bb82] bg-[#fffaf0] p-8 text-sm leading-7 text-stone-600">
          先輸入關鍵字即可搜尋商品、文章與品牌內容。
        </div>
      )}
    </div>
  );
}