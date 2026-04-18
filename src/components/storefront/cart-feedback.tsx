"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertCircle, CheckCircle2, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function StorefrontCartFeedback() {
  const isOpen = useCartStore((state) => state.isOpen);
  const error = useCartStore((state) => state.error);
  const cart = useCartStore((state) => state.cart);
  const lastAddedItemTitle = useCartStore((state) => state.lastAddedItemTitle);
  const lastAddedVariantTitle = useCartStore((state) => state.lastAddedVariantTitle);
  const closeCart = useCartStore((state) => state.closeCart);
  const clearError = useCartStore((state) => state.clearError);

  const visible = isOpen || Boolean(error);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      closeCart();
      clearError();
    }, error ? 6000 : 4500);

    return () => window.clearTimeout(timer);
  }, [clearError, closeCart, error, visible]);

  if (!visible) {
    return null;
  }

  const productSummary = lastAddedItemTitle
    ? lastAddedVariantTitle && lastAddedVariantTitle !== lastAddedItemTitle
      ? `${lastAddedItemTitle}｜${lastAddedVariantTitle}`
      : lastAddedItemTitle
    : null;

  return (
    <div className="pointer-events-none fixed inset-x-4 top-22 z-[90] flex justify-end sm:inset-x-6 lg:top-24 lg:inset-x-8">
      <section
        role={error ? "alert" : "status"}
        aria-live="polite"
        className={[
          "pointer-events-auto w-full max-w-[24rem] border shadow-[0_24px_60px_rgba(28,18,14,0.18)] backdrop-blur-sm",
          error ? "border-[#d8a3a3] bg-[#fff7f7]" : "border-[#e9dcc3] bg-[rgba(255,251,244,0.98)]",
        ].join(" ")}
      >
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <div
            className={[
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              error ? "bg-[#f4d9d9] text-[#9d2020]" : "bg-[#f6e8cf] text-[#9d2020]",
            ].join(" ")}
          >
            {error ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.78rem] font-semibold tracking-[0.18em] text-[#9d2020]">
                  {error ? "CART ERROR" : "ADDED TO CART"}
                </p>
                <h2 className="mt-1 text-[1.1rem] font-semibold text-[#2d2621]">
                  {error ? "購物車更新失敗" : "商品已加入購物車"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  clearError();
                }}
                className="flex h-8 w-8 items-center justify-center text-stone-500 transition hover:text-[#9d2020]"
                aria-label="關閉購物車提示"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
              {error ? (
                <p>{error}</p>
              ) : (
                <>
                  {productSummary ? <p className="font-medium text-[#2d2621]">{productSummary}</p> : null}
                  <p>購物車目前共有 {cart.itemCount} 項商品，總件數 {cart.totalQuantity} 件。</p>
                  <p>商品小計 {formatCurrency(cart.subtotal)}</p>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Link href="/cart" onClick={() => closeCart()} className="storefront-button min-w-32 px-4 py-2.5 text-[0.78rem]">
                <ShoppingBag className="mr-2 h-4 w-4" />
                查看購物車
              </Link>
              {!error ? (
                <Link href="/checkout" onClick={() => closeCart()} className="storefront-button-secondary min-w-28 px-4 py-2.5 text-[0.78rem]">
                  直接結帳
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}