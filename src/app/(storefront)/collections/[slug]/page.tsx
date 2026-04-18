import { notFound } from "next/navigation";
import { ProductListTracker } from "@/components/storefront/tracking/product-list-tracker";
import { getCollectionBySlug } from "@/lib/storefront";
import { getTrackingNamingSettings } from "@/lib/site-settings";
import { CollectionProductCard } from "@/components/storefront/collection-product-card";

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [collection, trackingNaming] = await Promise.all([
    getCollectionBySlug(slug),
    getTrackingNamingSettings(),
  ]);

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
    sku: item.product.variants[0]?.sku ?? null,
    variantId: item.product.variants[0]?.id ?? null,
    variantTitle: item.product.variants[0]?.title ?? null,
    inventory: item.product.variants[0]?.inventory ?? 0,
  }));

  const isReferenceAllCollection = collection.slug === "frontpage" || collection.slug === "all";
  const collectionTitle = isReferenceAllCollection ? "首頁" : collection.title;
  const collectionDescription = isReferenceAllCollection ? null : collection.description;

  return (
    <div className="storefront-page pt-10">
      <ProductListTracker
        items={products.map((product) => ({
          id: product.id,
          price: product.price,
          sku: product.sku,
          title: product.title,
          variantId: product.variantId,
          variantTitle: product.variantTitle,
        }))}
        listId={`${trackingNaming.collectionListIdPrefix}${collection.slug}`}
        listName={collectionTitle}
        pageType="category"
      />
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
          <CollectionProductCard key={product.id} {...product} />
        )) : (
          <div className="border border-dashed border-[#d9bf84] bg-[#fffaf0] p-10 text-sm leading-7 text-stone-600 sm:col-span-2 xl:col-span-5">
            此集合目前沒有上架商品。
          </div>
        )}
      </div>
    </div>
  );
}
