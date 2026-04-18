import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { readOrderPaymentInfo } from "@/lib/order-payment-info";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const order = await db.order.findFirst({
    where: {
      id,
      customerId: session!.user.id,
    },
    include: {
      items: {
        orderBy: { id: "asc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const paymentInfo = readOrderPaymentInfo(order.note);

  return (
    <div className="storefront-page">
      <div className="mb-10 flex flex-col gap-4 border-b border-[#ece7de] pb-6 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div className="space-y-4">
          <h1 className="text-[2.2rem] font-semibold tracking-[0.08em] text-[#3f3a37] sm:text-[2.6rem]">{order.orderNumber}</h1>
          <p className="text-sm leading-7 text-stone-600">付款狀態 {order.paymentStatus}，出貨狀態 {order.shippingStatus}。</p>
        </div>
        <Link href="/account/orders" className="text-sm font-semibold text-[#7a1414]">返回訂單列表</Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-[#e8dfcd] bg-white p-8">
          <h2 className="text-3xl font-semibold text-[#3f3a37]">商品明細</h2>
          <div className="mt-6 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 border-b border-[#eadab5] pb-4 last:border-none last:pb-0">
                <div>
                  <p className="font-semibold text-[#671515]">{item.productTitle}</p>
                  <p className="mt-1 text-sm text-stone-500">{item.variantTitle} × {item.quantity}</p>
                </div>
                <p className="font-semibold text-[#671515]">NT$ {Number(item.total).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-[#e8dfcd] bg-[#fbf8f2] p-8">
          <h2 className="text-3xl font-semibold text-[#3f3a37]">配送與付款</h2>
          <div className="mt-6 space-y-3 text-sm leading-7 text-stone-600">
            <p><span className="font-semibold text-stone-800">收件人：</span>{order.shippingName}</p>
            <p><span className="font-semibold text-stone-800">電話：</span>{order.shippingPhone}</p>
            <p><span className="font-semibold text-stone-800">地址：</span>{order.shippingZip} {order.shippingCity}{order.shippingDistrict}{order.shippingAddress}</p>
            <p><span className="font-semibold text-stone-800">物流方式：</span>{order.shippingMethod}</p>
            <p><span className="font-semibold text-stone-800">付款方式：</span>{order.paymentMethod}</p>
            <p><span className="font-semibold text-stone-800">訂單總額：</span>NT$ {Number(order.total).toLocaleString()}</p>
          </div>
          {paymentInfo ? (
            <div className="mt-6 bg-white px-5 py-4 text-sm leading-7 text-stone-600">
              <p className="font-semibold text-[#671515]">付款資訊</p>
              {paymentInfo.kind === "ATM" ? (
                <>
                  <p className="mt-2">銀行代碼：{paymentInfo.bankCode}</p>
                  <p>虛擬帳號：{paymentInfo.vAccount}</p>
                  <p>繳費期限：{paymentInfo.expireDate}</p>
                </>
              ) : (
                <>
                  <p className="mt-2">超商代碼：{paymentInfo.paymentNo}</p>
                  <p>繳費期限：{paymentInfo.expireDate}</p>
                </>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}