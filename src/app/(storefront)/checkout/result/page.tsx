import Link from "next/link";
import { PurchaseEventTracker } from "@/components/storefront/tracking/purchase-event-tracker";
import { db } from "@/lib/db";
import { readOrderPaymentInfo } from "@/lib/order-payment-info";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  if (!orderId) {
    return (
      <div className="storefront-page-narrow max-w-4xl">
        <div className="border border-[#dcc28a]/35 bg-white p-8 text-center sm:p-12">
          <h1 className="text-[2.2rem] font-semibold tracking-[0.08em] text-[#3f3a37] sm:text-[2.6rem]">尚未建立訂單</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-stone-600">
            目前沒有可顯示的訂單結果。您可以回到購物車確認商品，或重新前往商品頁完成下單。
          </p>
          <div className="mx-auto mt-8 grid max-w-sm gap-3">
            <Link href="/cart" className="storefront-button">返回購物車</Link>
            <Link href="/collections/all" className="storefront-button-secondary">繼續購物</Link>
          </div>
        </div>
      </div>
    );
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        orderBy: { id: "asc" },
      },
    },
  });

  if (!order) {
    return (
      <div className="storefront-page-narrow max-w-4xl">
        <div className="border border-[#dcc28a]/35 bg-white p-8 text-center sm:p-12">
          <h1 className="text-[2.2rem] font-semibold tracking-[0.08em] text-[#3f3a37] sm:text-[2.6rem]">找不到訂單結果</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-stone-600">
            這筆訂單結果可能已失效，或尚未完成建立。請回到購物車重新確認，若已付款可再從會員訂單查詢。
          </p>
          <div className="mx-auto mt-8 grid max-w-sm gap-3">
            <Link href="/account/orders" className="storefront-button">查看我的訂單</Link>
            <Link href="/cart" className="storefront-button-secondary">返回購物車</Link>
          </div>
        </div>
      </div>
    );
  }

  const paymentInfo = readOrderPaymentInfo(order.note);

  return (
    <div className="storefront-page-narrow max-w-5xl">
      <PurchaseEventTracker
        order={{
          city: order.shippingCity,
          country: "TW",
          email: order.email,
          id: order.id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          phone: order.phone,
          total: Number(order.total),
          items: order.items.map((item) => ({
            variantId: item.variantId,
            productTitle: item.productTitle,
            variantTitle: item.variantTitle,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            sku: item.sku,
          })),
        }}
      />
      <div className="border border-[#dcc28a]/35 bg-white p-8 sm:p-10">
        <p className="storefront-eyebrow">ORDER RESULT</p>
        <h1 className="mt-4 storefront-heading">訂單已建立</h1>
        <p className="mt-4 storefront-copy">訂單編號 {order.orderNumber}。若您選擇 ATM 或超商代碼，付款資訊會顯示於下方，且也會同步寫入通知信。</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <section className="space-y-4 border border-[#eadab5] bg-[#fffdf8] p-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 border-b border-[#eadab5] pb-4 last:border-none last:pb-0">
                <div>
                  <p className="font-semibold text-[#671515]">{item.productTitle}</p>
                  <p className="mt-1 text-sm text-stone-500">{item.variantTitle} × {item.quantity}</p>
                </div>
                <p className="font-semibold text-[#671515]">{formatCurrency(Number(item.total))}</p>
              </div>
            ))}
          </section>

          <section className="space-y-4 border border-[#eadab5] bg-[#fbf8f2] p-6">
            <div className="flex items-center justify-between text-sm text-stone-600">
              <span>付款方式</span>
              <span className="font-semibold text-[#671515]">{order.paymentMethod ?? "待選擇"}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-stone-600">
              <span>付款狀態</span>
              <span className="font-semibold text-[#671515]">{order.paymentStatus}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#d8bb82] pt-4 text-base font-semibold text-[#671515]">
              <span>應付總額</span>
              <span>{formatCurrency(Number(order.total))}</span>
            </div>

            {paymentInfo ? (
              <div className="bg-white px-5 py-4 text-sm leading-7 text-stone-600">
                <p className="font-semibold text-[#671515]">付款資訊</p>
                {paymentInfo.kind === "ATM" ? (
                  <>
                    <p className="mt-2">銀行代碼：{paymentInfo.bankCode}</p>
                    <p>虛擬帳號：{paymentInfo.vAccount}</p>
                    <p>繳費期限：{paymentInfo.expireDate}</p>
                  </>
                ) : (
                  <>
                    <p className="mt-2">繳費代碼：{paymentInfo.paymentNo}</p>
                    <p>繳費期限：{paymentInfo.expireDate}</p>
                  </>
                )}
              </div>
            ) : (
              <p className="bg-white px-5 py-4 text-sm leading-7 text-stone-600">若為信用卡付款，完成綠界流程後系統會自動更新付款狀態。</p>
            )}

            <div className="grid gap-3 pt-2">
              <Link href="/account/orders" className="storefront-button">查看我的訂單</Link>
              <Link href="/collections/frontpage" className="storefront-button-secondary">繼續購物</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}