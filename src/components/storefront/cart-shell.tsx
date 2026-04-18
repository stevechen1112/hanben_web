"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CartShell() {
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.loading);
  const initialize = useCartStore((state) => state.initialize);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <div className="storefront-page">
      <div className="mb-10 border-b border-[#ece7de] pb-6 text-center">
        <h1 className="text-[2.2rem] font-semibold tracking-[0.08em] text-[#3f3a37] sm:text-[2.6rem]">購物車</h1>
      </div>

      {!cart || cart.items.length === 0 ? (
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 bg-white px-6 py-12 text-center sm:py-16">
          <p className="text-[1.9rem] font-semibold text-[#3f3a37] sm:text-[2.2rem]">您的購物車是空的</p>
          <p className="text-sm text-stone-600">
            已有帳號？
            <Link href="/account/login?callbackUrl=%2Fcheckout" className="ml-1 underline underline-offset-4">
              登入
            </Link>
            以加速結帳。
          </p>
          <Link href="/products/%E6%BC%A2%E6%9C%AC%E4%B8%89%E4%BB%A3-%E8%88%92%E6%B4%BB%E9%A3%B2" className="storefront-button mt-2 min-w-44">
            繼續購物
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <article key={item.variantId} className="grid gap-5 border border-[#e8dfcd] bg-white p-6 sm:grid-cols-[160px_1fr]">
                <div className="overflow-hidden bg-white">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.productTitle} className="h-full w-full object-contain p-3" /> : <div className="flex aspect-square items-center justify-center text-sm text-[#7a1414]">待補圖片</div>}
                </div>
                <div className="flex flex-col justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[1.85rem] font-semibold leading-tight text-[#3f3a37]">{item.productTitle}</h2>
                        <p className="mt-1 text-sm text-stone-500">{item.variantTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-[#4b433d]">{formatCurrency(item.subtotal)}</p>
                        {item.compareAtPrice ? <p className="text-xs text-stone-400 line-through">{formatCurrency(item.compareAtPrice * item.quantity)}</p> : null}
                      </div>
                    </div>
                    <p className="text-sm leading-7 text-stone-600">單價 {formatCurrency(item.price)}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center border border-[#ddc18a] bg-[#fffaf0] p-1">
                      <button
                        type="button"
                        onClick={() => void updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                        className="h-10 w-10 text-lg text-[#7a1414] transition hover:bg-white"
                      >
                        -
                      </button>
                      <span className="min-w-12 text-center text-base font-semibold text-[#671515]">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => void updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="h-10 w-10 text-lg text-[#7a1414] transition hover:bg-white"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeItem(item.cartItemId)}
                      className="text-sm font-semibold tracking-[0.12em] text-stone-500 transition hover:text-[#b72020]"
                    >
                      移除商品
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit border border-[#e8dfcd] bg-[#fbf8f2] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">Cart Summary</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#3f3a37]">訂單摘要</h2>
            <div className="mt-8 space-y-4 text-sm text-stone-600">
              <div className="flex items-center justify-between">
                <span>商品數量</span>
                <span className="font-semibold text-[#671515]">{cart.itemCount} 件</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#eadab5] pb-4">
                <span>商品小計</span>
                <span className="font-semibold text-[#671515]">{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-[#671515]">
                <span>結帳金額</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              <Link href="/checkout" className="storefront-button">
                前往結帳
              </Link>
              <Link href="/collections/all" className="storefront-button-secondary">
                繼續購物
              </Link>
              <button
                type="button"
                onClick={() => void clearCart()}
                className="text-sm font-semibold tracking-[0.12em] text-stone-500 transition hover:text-[#b72020]"
              >
                清空購物車
              </button>
            </div>

            {isLoading ? <p className="mt-4 text-xs text-stone-400">同步購物車中…</p> : null}
          </aside>
        </div>
      )}
    </div>
  );
}