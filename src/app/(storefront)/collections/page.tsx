import Link from "next/link";
import { getCollections } from "@/lib/storefront";

export default async function CollectionsIndexPage() {
  const collections = await getCollections();

  return (
    <div className="storefront-page">
      <div className="border-b border-[#ece7de] pb-6 text-center">
        <h1 className="text-[2.2rem] font-semibold tracking-[0.08em] text-[#3f3a37] sm:text-[2.6rem]">商品系列</h1>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {collections.length > 0 ? collections.map((collection) => (
          <Link key={collection.id} href={`/collections/${collection.slug}`} className="border border-[#eee4d0] bg-white transition hover:-translate-y-1">
            <div className="aspect-[16/10] border-b border-[#f0e7d6] bg-white">
              {collection.imageUrl ? <img src={collection.imageUrl} alt={collection.title} className="h-full w-full object-contain p-6" /> : null}
            </div>
            <div className="space-y-3 p-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-stone-400">COLLECTION</p>
              <h2 className="text-3xl font-semibold text-[#3f3a37]">{collection.title}</h2>
              <p className="text-sm leading-7 text-stone-600">{collection.description || "瀏覽這個系列的全部商品。"}</p>
              <p className="text-sm font-semibold text-[#b72020]">{collection.products.length} 件商品</p>
            </div>
          </Link>
        )) : (
          <div className="border border-dashed border-[#d9bf84] bg-[#fffaf0] p-10 text-sm leading-7 text-stone-600 md:col-span-2 xl:col-span-3">
            目前尚未建立集合資料。後台建立後會自動出現在這裡。
          </div>
        )}
      </div>
    </div>
  );
}
