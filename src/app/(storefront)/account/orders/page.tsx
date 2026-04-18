import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AccountOrdersPage() {
  const session = await auth();
  const orders = await db.order.findMany({
    where: { customerId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="storefront-page">
      <div className="mb-10 flex flex-col gap-4 border-b border-[#ece7de] pb-6 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div className="space-y-4">
          <h1 className="text-[2.2rem] font-semibold tracking-[0.08em] text-[#3f3a37] sm:text-[2.6rem]">我的訂單</h1>
        </div>
        <Link href="/account" className="text-sm font-semibold text-[#7a1414]">返回會員中心</Link>
      </div>

      <div className="space-y-4">
        {orders.length > 0 ? orders.map((order) => (
          <Link key={order.id} href={`/account/orders/${order.id}`} className="block border border-[#e8dfcd] bg-white p-6 transition hover:-translate-y-1">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-[#671515]">{order.orderNumber}</p>
                <p className="mt-2 text-sm text-stone-500">{new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}</p>
              </div>
              <div className="text-right text-sm text-stone-600">
                <p className="font-semibold text-[#671515]">NT$ {Number(order.total).toLocaleString()}</p>
                <p className="mt-1">{order.status} / {order.paymentStatus}</p>
              </div>
            </div>
          </Link>
        )) : <div className="border border-dashed border-[#d8bb82] bg-[#fffaf0] p-8 text-sm leading-7 text-stone-600">目前沒有訂單紀錄。</div>}
      </div>
    </div>
  );
}