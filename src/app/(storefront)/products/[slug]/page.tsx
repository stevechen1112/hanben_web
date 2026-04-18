import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchaseForm } from "@/components/storefront/product-purchase-form";
import { getProductBySlug } from "@/lib/storefront";

function formatCurrency(value: number | null) {
  if (value == null) return "即將上架";
  return new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryVariant = product.variants[0];
  const primaryPrice = primaryVariant ? Number(primaryVariant.price) : null;
  const compareAtPrice = primaryVariant?.compareAtPrice != null ? Number(primaryVariant.compareAtPrice) : null;

  return (
    <>
      <div className="sticky top-[72px] z-30 hidden border-y border-[#ece7de] bg-white/95 backdrop-blur lg:block">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            {product.images[0] ? <img src={product.images[0].url} alt={product.images[0].altText ?? product.title} className="h-[52px] w-[52px] border border-[#ece7de] object-cover" /> : null}
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.16em] text-stone-400">商品資訊</p>
              <div className="mt-1 flex flex-wrap items-center gap-4">
                <p className="truncate text-[0.95rem] font-semibold text-[#232323]">{product.title}</p>
                <div className="flex items-end gap-3">
                  <p className="text-[0.95rem] font-semibold text-[#232323]">{formatCurrency(primaryPrice)}</p>
                  {compareAtPrice ? <p className="text-sm text-stone-400 line-through">{formatCurrency(compareAtPrice)}</p> : null}
                </div>
              </div>
            </div>
          </div>
          <a href="#purchase-panel" className="inline-flex items-center justify-center bg-[#a61f1f] px-5 py-3 text-sm font-semibold tracking-[0.12em] text-white transition hover:bg-[#8d1818]">
            加入購物車
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-[1360px] px-4 pb-12 pt-4 sm:px-6 lg:px-0 lg:pb-16 lg:pt-0">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.86fr)] lg:gap-12">
          <div className="border-r border-[#ece7de] pr-0 lg:pr-10">
            <ProductGallery
              title={product.title}
              images={product.images.map((image) => ({
                id: image.id,
                url: image.url,
                altText: image.altText,
              }))}
            />
          </div>

          <div className="space-y-8 lg:sticky lg:top-28 lg:self-start lg:pr-6">
            <div className="space-y-4 border-b border-[#ece7de] pb-6">
              <h1 className="text-[2.15rem] font-semibold leading-[1.08] tracking-[-0.03em] text-[#232323] sm:text-[2.7rem]">{product.title}</h1>
              <div className="flex flex-wrap items-end gap-8">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-stone-400">促銷價</p>
                  <p className="mt-1 text-[2rem] font-semibold text-[#232323] sm:text-[2.6rem]">{formatCurrency(primaryPrice)}</p>
                </div>
                {compareAtPrice ? (
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] text-stone-400">定價</p>
                    <p className="mt-1 text-lg text-stone-400 line-through sm:text-[1.5rem]">{formatCurrency(compareAtPrice)}</p>
                  </div>
                ) : null}
              </div>
              {product.description ? <p className="max-w-2xl text-[0.98rem] leading-8 text-stone-600">{product.description}</p> : null}
            </div>

            {product.variants.length > 0 ? (
              <ProductPurchaseForm
                panelId="purchase-panel"
                productTitle={product.title}
                variants={product.variants.map((variant) => ({
                  id: variant.id,
                  title: variant.title,
                  price: Number(variant.price),
                  compareAtPrice: variant.compareAtPrice != null ? Number(variant.compareAtPrice) : null,
                  inventory: variant.inventory,
                }))}
              />
            ) : null}

            {product.bodyHtml ? (
              <div className="storefront-prose product-detail-rich max-w-none border-t border-[#ece7de] pt-8" dangerouslySetInnerHTML={{ __html: product.bodyHtml }} />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
