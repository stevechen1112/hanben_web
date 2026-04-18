import { notFound } from "next/navigation";
import Link from "next/link";
import { getCollectionBySlug } from "@/lib/storefront";

function formatCurrency(value: number | null) {
  if (value == null) return "即將上架";
  return new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const products = collection.products.map((item) => ({
    id: item.product.id,
    title: item.product.title,
    slug: item.product.slug,
    imageUrl: item.product.images[0]?.url ?? null,
    imageAlt: item.product.images[0]?.altText ?? item.product.title,
    price: item.product.variants[0] ? Number(item.product.variants[0].price) : null,
    compareAtPrice: item.product.variants[0]?.compareAtPrice != null ? Number(item.product.variants[0].compareAtPrice) : null,
  }));

  const isReferenceAllCollection = collection.slug === "frontpage" || collection.slug === "all";
  const collectionTitle = isReferenceAllCollection ? "首頁" : collection.title;
  const collectionDescription = isReferenceAllCollection ? null : collection.description;

  return (
    <div className="storefront-page pt-10">
      <div className="max-w-3xl">
        <h1 className="text-[2.2rem] font-semibold tracking-[-0.03em] text-[#232323] sm:text-[2.5rem]">{collectionTitle}</h1>
        {collectionDescription ? <p className="mt-4 max-w-2xl text-[0.98rem] leading-8 text-stone-600">{collectionDescription}</p> : null}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-b border-[#ece6dd] pb-5 text-sm text-stone-500">
        <div className="flex items-center gap-8">
          <span>可用性</span>
          <span>價格</span>
        </div>
        <div className="flex items-center gap-6">
          <span>{products.length} 個品項</span>
          <span>排序</span>
        </div>
      </div>

      <div className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-5">
        {products.length > 0 ? products.map((product) => (
          <article key={product.id} className="group relative bg-white text-[#232323]">
            <Link href={`/products/${product.slug}`} className="block">
              <div className="relative overflow-hidden rounded-[18px] border border-[#ece4d8] bg-[#fbf8f2] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_38px_rgba(46,32,18,0.08)]">
                <div className="absolute right-3 top-3 z-10 rounded-full bg-[#111] px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.12em] text-white">特賣</div>
                <div className="aspect-[4/5] overflow-hidden">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.imageAlt ?? product.title} className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.04]" /> : null}
                </div>
              </div>
            </Link>
            <div className="space-y-4 px-1 pb-1 pt-4">
              <Link href={`/products/${product.slug}`} className="block text-[0.95rem] leading-7 text-[#232323] transition hover:text-[#8f1212]">
                {product.title}
              </Link>
              <div className="space-y-1 text-[0.9rem] text-stone-600">
                <div className="flex items-center justify-between gap-3">
                  <span>促銷價</span>
                  <span className="font-medium text-[#232323]">{formatCurrency(product.price)}</span>
                </div>
                {product.compareAtPrice ? (
                  <div className="flex items-center justify-between gap-3">
                    <span>定價</span>
                    <span className="text-stone-400 line-through">{formatCurrency(product.compareAtPrice)}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        )) : (
          <div className="border border-dashed border-[#d9bf84] bg-[#fffaf0] p-10 text-sm leading-7 text-stone-600 sm:col-span-2 xl:col-span-5">
            此集合目前沒有上架商品。
          </div>
        )}
      </div>
    </div>
  );
}
