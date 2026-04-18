import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { updateCustomerProfile } from "@/lib/actions/account";
import { db } from "@/lib/db";

export default async function AccountPage() {
  const session = await auth();
  const customer = await db.customer.findUnique({
    where: { id: session!.user.id },
    include: {
      addresses: {
        orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
        take: 2,
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  if (!customer) {
    return null;
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="storefront-page">
      <div className="mb-10 flex flex-col gap-4 border-b border-[#ece7de] pb-6 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div className="space-y-4">
          <h1 className="text-[2.2rem] font-semibold tracking-[0.08em] text-[#3f3a37] sm:text-[2.6rem]">會員中心</h1>
          <p className="text-sm leading-7 text-stone-600">管理您的會員資料、常用地址與訂單紀錄。</p>
        </div>
        <form action={handleSignOut}>
          <button type="submit" className="storefront-button-secondary">登出</button>
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="border border-[#e8dfcd] bg-white p-8">
          <h2 className="text-3xl font-semibold text-[#3f3a37]">基本資料</h2>
          <form action={updateCustomerProfile} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-stone-600">
              <span className="font-semibold text-stone-800">姓氏</span>
              <input name="lastName" defaultValue={customer.lastName ?? ""} className="storefront-input" />
            </label>
            <label className="space-y-2 text-sm text-stone-600">
              <span className="font-semibold text-stone-800">名字</span>
              <input name="firstName" defaultValue={customer.firstName ?? ""} className="storefront-input" />
            </label>
            <label className="space-y-2 text-sm text-stone-600 md:col-span-2">
              <span className="font-semibold text-stone-800">Email</span>
              <input value={customer.email} disabled className="storefront-input bg-stone-50 text-stone-400" />
            </label>
            <label className="space-y-2 text-sm text-stone-600 md:col-span-2">
              <span className="font-semibold text-stone-800">手機</span>
              <input name="phone" defaultValue={customer.phone ?? ""} className="storefront-input" />
            </label>
            <div className="md:col-span-2">
              <button type="submit" className="storefront-button">儲存會員資料</button>
            </div>
          </form>
        </section>

        <div className="space-y-8">
          <section className="border border-[#e8dfcd] bg-[#fbf8f2] p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-3xl font-semibold text-[#3f3a37]">常用地址</h2>
              <Link href="/account/addresses" className="text-sm font-semibold text-[#7a1414]">管理全部</Link>
            </div>
            <div className="mt-6 space-y-4">
              {customer.addresses.length > 0 ? customer.addresses.map((address) => (
                <div key={address.id} className="bg-white px-5 py-4 text-sm leading-7 text-stone-600">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-[#671515]">{address.label || "收件地址"}</p>
                    {address.isDefault ? <span className="rounded-full bg-[#fff3d8] px-3 py-1 text-xs font-semibold text-[#7a1414]">預設</span> : null}
                  </div>
                  <p className="mt-2">{address.recipientName} · {address.phone}</p>
                  <p>{address.zipCode} {address.city}{address.district}{address.addressLine}</p>
                </div>
              )) : <p className="bg-white px-5 py-4 text-sm leading-7 text-stone-600">尚未建立收件地址。</p>}
            </div>
          </section>

          <section className="border border-[#e8dfcd] bg-white p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-3xl font-semibold text-[#3f3a37]">最近訂單</h2>
              <Link href="/account/orders" className="text-sm font-semibold text-[#7a1414]">查看全部</Link>
            </div>
            <div className="mt-6 space-y-4">
              {customer.orders.length > 0 ? customer.orders.map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`} className="block border border-[#eadab5] bg-[#fffdf8] px-5 py-4 transition hover:bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#671515]">{order.orderNumber}</p>
                      <p className="mt-1 text-sm text-stone-500">{new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium" }).format(order.createdAt)}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-[#671515]">NT$ {Number(order.total).toLocaleString()}</p>
                      <p className="mt-1 text-stone-500">{order.status} / {order.paymentStatus}</p>
                    </div>
                  </div>
                </Link>
              )) : <p className="border border-dashed border-[#d8bb82] bg-[#fffaf0] px-5 py-4 text-sm leading-7 text-stone-600">尚未產生訂單。</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}