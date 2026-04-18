"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createAnalyticsItem, trackInitiateCheckout } from "@/lib/analytics";
import type { ShippingOption } from "@/lib/shipping";
import { computeCheckoutSummary, paymentMethodOptions } from "@/lib/checkout";
import { useCartStore } from "@/lib/cart-store";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);
}

type CheckoutDefaults = {
  email: string;
  phone: string;
  shippingName: string;
  shippingPhone: string;
  shippingZip: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingAddress: string;
};

type CheckoutFormState = {
  email: string;
  phone: string;
  shippingName: string;
  shippingPhone: string;
  shippingMethod: string;
  paymentMethod: "credit_card" | "atm" | "cvs_code";
  shippingZip: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingAddress: string;
  cvsStoreId: string;
  cvsStoreName: string;
  cvsStoreAddress: string;
  promoCode: string;
  note: string;
};

export function CheckoutForm({
  shippingOptions,
  defaults,
}: {
  shippingOptions: ShippingOption[];
  defaults: CheckoutDefaults;
}) {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const initialize = useCartStore((state) => state.initialize);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const checkoutTrackedRef = useRef<string | null>(null);
  const [form, setForm] = useState<CheckoutFormState>({
    email: defaults.email,
    phone: defaults.phone,
    shippingName: defaults.shippingName,
    shippingPhone: defaults.shippingPhone,
    shippingMethod: shippingOptions[0]?.shippingMethod ?? "",
    paymentMethod: paymentMethodOptions[0].value,
    shippingZip: defaults.shippingZip,
    shippingCity: defaults.shippingCity,
    shippingDistrict: defaults.shippingDistrict,
    shippingAddress: defaults.shippingAddress,
    cvsStoreId: "",
    cvsStoreName: "",
    cvsStoreAddress: "",
    promoCode: "",
    note: "",
  });

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const selectedShipping = useMemo(
    () => shippingOptions.find((option) => option.shippingMethod === form.shippingMethod) ?? null,
    [form.shippingMethod, shippingOptions],
  );

  const summary = computeCheckoutSummary(cart ?? { items: [], itemCount: 0, subtotal: 0 }, selectedShipping);
  const isHomeDelivery = form.shippingMethod.startsWith("home_");

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      return;
    }

    const signature = [cart.updatedAt, form.shippingMethod, summary.total].join(":");
    if (checkoutTrackedRef.current === signature) {
      return;
    }

    checkoutTrackedRef.current = signature;
    trackInitiateCheckout({
      value: summary.total,
      items: cart.items.map((item) =>
        createAnalyticsItem({
          itemId: item.variantId,
          itemName: item.productTitle,
          itemVariant: item.variantTitle,
          price: item.price,
          quantity: item.quantity,
          sku: item.sku,
        }),
      ),
    });
  }, [cart, form.shippingMethod, summary.total]);

  function updateField<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!cart || cart.items.length === 0) {
      setError("購物車內沒有商品，請先加入商品再進行結帳。");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload.message ?? "建立訂單失敗，請稍後再試。");
          return;
        }

        await clearCart();
        router.push(`/api/payment/create?orderId=${payload.orderId}`);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "建立訂單失敗，請稍後再試。");
      }
    });
  }

  return (
    <div className="storefront-page">
      <div className="mb-10 border-b border-[#ece7de] pb-6 text-center">
        <h1 className="text-[2.2rem] font-semibold tracking-[0.08em] text-[#3f3a37] sm:text-[2.6rem]">完成訂單</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="border border-[#e8dfcd] bg-white p-7">
            <h2 className="text-3xl font-semibold text-[#3f3a37]">聯絡資訊</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-stone-600">
                <span className="font-semibold text-stone-800">Email</span>
                <input value={form.email} onChange={(event) => updateField("email", event.target.value)} className="storefront-input" />
              </label>
              <label className="space-y-2 text-sm text-stone-600">
                <span className="font-semibold text-stone-800">聯絡電話</span>
                <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="storefront-input" />
              </label>
            </div>
          </section>

          <section className="border border-[#e8dfcd] bg-white p-7">
            <h2 className="text-3xl font-semibold text-[#3f3a37]">收件資訊</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-stone-600">
                <span className="font-semibold text-stone-800">收件人姓名</span>
                <input value={form.shippingName} onChange={(event) => updateField("shippingName", event.target.value)} className="storefront-input" />
              </label>
              <label className="space-y-2 text-sm text-stone-600">
                <span className="font-semibold text-stone-800">收件人電話</span>
                <input value={form.shippingPhone} onChange={(event) => updateField("shippingPhone", event.target.value)} className="storefront-input" />
              </label>
            </div>
            <div className="mt-6 grid gap-3">
              <p className="text-sm font-semibold tracking-[0.16em] text-stone-700">配送方式</p>
              {shippingOptions.map((option) => {
                const active = option.shippingMethod === form.shippingMethod;
                const fee = option.freeShippingMin != null && (cart?.subtotal ?? 0) >= option.freeShippingMin ? 0 : option.baseFee;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateField("shippingMethod", option.shippingMethod)}
                    className={[
                      "border px-4 py-4 text-left transition",
                      active ? "border-[#b72020] bg-[#fff8ef]" : "border-[#eadab5] bg-[#fffdf8] hover:bg-white",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#671515]">{option.name}</p>
                        <p className="mt-1 text-sm text-stone-500">滿 {option.freeShippingMin?.toLocaleString() ?? "-"} 免運</p>
                      </div>
                      <p className="font-semibold text-[#b72020]">{fee === 0 ? "免運" : formatCurrency(fee)}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {isHomeDelivery ? (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm text-stone-600">
                  <span className="font-semibold text-stone-800">郵遞區號</span>
                  <input value={form.shippingZip} onChange={(event) => updateField("shippingZip", event.target.value)} className="storefront-input" />
                </label>
                <label className="space-y-2 text-sm text-stone-600">
                  <span className="font-semibold text-stone-800">縣市</span>
                  <input value={form.shippingCity} onChange={(event) => updateField("shippingCity", event.target.value)} className="storefront-input" />
                </label>
                <label className="space-y-2 text-sm text-stone-600">
                  <span className="font-semibold text-stone-800">區域</span>
                  <input value={form.shippingDistrict} onChange={(event) => updateField("shippingDistrict", event.target.value)} className="storefront-input" />
                </label>
                <label className="space-y-2 text-sm text-stone-600 md:col-span-3">
                  <span className="font-semibold text-stone-800">詳細地址</span>
                  <input value={form.shippingAddress} onChange={(event) => updateField("shippingAddress", event.target.value)} className="storefront-input" />
                </label>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.6rem] border border-[#eadab5] bg-[#fff8ef] p-5 text-sm leading-7 text-stone-600">
                <p className="font-semibold text-[#671515]">超商取貨門市資訊</p>
                <p className="mt-2">請填寫超商門市代碼、門市名稱與門市地址，送單後會一併帶入超商取貨資料。</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <input value={form.cvsStoreId} onChange={(event) => updateField("cvsStoreId", event.target.value)} placeholder="門市代碼" className="storefront-input" />
                  <input value={form.cvsStoreName} onChange={(event) => updateField("cvsStoreName", event.target.value)} placeholder="門市名稱" className="storefront-input" />
                  <input value={form.cvsStoreAddress} onChange={(event) => updateField("cvsStoreAddress", event.target.value)} placeholder="門市地址" className="storefront-input" />
                </div>
              </div>
            )}
          </section>

          <section className="border border-[#e8dfcd] bg-white p-7">
            <h2 className="text-3xl font-semibold text-[#3f3a37]">付款與備註</h2>
            <div className="mt-6 grid gap-3">
              {paymentMethodOptions.map((option) => {
                const active = option.value === form.paymentMethod;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("paymentMethod", option.value)}
                    className={[
                      "border px-4 py-4 text-left transition",
                      active ? "border-[#b72020] bg-[#fff8ef]" : "border-[#eadab5] bg-[#fffdf8] hover:bg-white",
                    ].join(" ")}
                  >
                    <p className="font-semibold text-[#671515]">{option.label}</p>
                    <p className="mt-1 text-sm text-stone-500">{option.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-stone-600">
                <span className="font-semibold text-stone-800">優惠碼</span>
                <input value={form.promoCode} onChange={(event) => updateField("promoCode", event.target.value)} className="storefront-input" placeholder="如有優惠碼可於此輸入" />
              </label>
              <label className="space-y-2 text-sm text-stone-600 md:col-span-2">
                <span className="font-semibold text-stone-800">訂單備註</span>
                <textarea value={form.note} onChange={(event) => updateField("note", event.target.value)} className="storefront-input min-h-28" placeholder="例如配送時段、收件提醒" />
              </label>
            </div>
          </section>
        </div>

        <aside className="h-fit border border-[#e8dfcd] bg-[#fbf8f2] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">Checkout Summary</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#3f3a37]">付款前確認</h2>
          <div className="mt-8 space-y-4 text-sm text-stone-600">
            {cart?.items.map((item) => (
              <div key={item.variantId} className="flex items-start justify-between gap-4 border-b border-[#eadab5] pb-4">
                <div>
                  <p className="font-semibold text-[#671515]">{item.productTitle}</p>
                  <p className="mt-1 text-xs text-stone-500">{item.variantTitle} × {item.quantity}</p>
                </div>
                <p className="font-semibold text-[#671515]">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span>商品小計</span>
              <span className="font-semibold text-[#671515]">{formatCurrency(summary.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>運費</span>
              <span className="font-semibold text-[#671515]">{summary.shippingFee === 0 ? "免運" : formatCurrency(summary.shippingFee)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#d8bb82] pt-4 text-base font-semibold text-[#671515]">
              <span>應付總額</span>
              <span>{formatCurrency(summary.total)}</span>
            </div>
          </div>

          {error ? <p className="mt-5 rounded-2xl bg-[#fff0f0] px-4 py-3 text-sm text-[#a81919]">{error}</p> : null}

          <button
            type="submit"
            disabled={isPending || !cart || cart.items.length === 0}
            className="storefront-button mt-8 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "建立訂單中…" : "前往付款"}
          </button>
        </aside>
      </form>
    </div>
  );
}