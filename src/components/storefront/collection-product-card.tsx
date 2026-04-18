"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";

function formatCurrency(value: number | null) {
  if (value == null) return "即將上架";
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

type CollectionProductCardProps = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  imageAlt: string;
  price: number | null;
  compareAtPrice: number | null;
  variantId: string | null;
  inventory: number;
};

export function CollectionProductCard({ id: _id, title, slug, imageUrl, imageAlt, price, compareAtPrice, variantId, inventory }: CollectionProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [isPending, setIsPending] = useState(false);
  const isSoldOut = !variantId || inventory <= 0;

  async function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!variantId || isPending || isSoldOut) return;

    setIsPending(true);
    try {
      await addItem(variantId, 1);
      router.refresh();
    } catch {
      // Global cart feedback handles error state.
    } finally {
      setIsPending(false);
    }
  }

  return (
    <article className="group relative bg-white text-[#232323]">
      <Link href={`/products/${slug}`} className="block">
        <div className="relative overflow-hidden rounded-[18px] border border-[#ece4d8] bg-[#fbf8f2] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_38px_rgba(46,32,18,0.08)]">
          <div className="absolute right-3 top-3 z-10 rounded-full bg-[#111] px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.12em] text-white">特賣</div>
          <div className="aspect-[4/5] overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={imageAlt} className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.04]" />
            ) : null}
          </div>
        </div>
      </Link>
      <div className="space-y-3 px-1 pb-1 pt-4">
        <Link href={`/products/${slug}`} className="block text-[0.95rem] leading-7 text-[#232323] transition hover:text-[#8f1212]">
          {title}
        </Link>
        <div className="space-y-1 text-[0.9rem] text-stone-600">
          <div className="flex items-center justify-between gap-3">
            <span>促銷價</span>
            <span className="font-medium text-[#232323]">{formatCurrency(price)}</span>
          </div>
          {compareAtPrice ? (
            <div className="flex items-center justify-between gap-3">
              <span>定價</span>
              <span className="text-stone-400 line-through">{formatCurrency(compareAtPrice)}</span>
            </div>
          ) : null}
        </div>
        <div className="pt-1">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isPending || isSoldOut}
            className="storefront-button w-full px-4 py-2.5 text-[0.8rem] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSoldOut ? "已售完" : isPending ? "加入中…" : "加入購物車"}
          </button>
        </div>
      </div>
    </article>
  );
}
