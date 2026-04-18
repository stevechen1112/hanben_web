import Link from "next/link";
import {
  deleteCustomerAddress,
  saveCustomerAddress,
  setDefaultCustomerAddress,
} from "@/lib/actions/account";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AccountAddressesPage() {
  const session = await auth();
  const addresses = await db.address.findMany({
    where: { customerId: session!.user.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="storefront-page">
      <div className="mb-10 flex flex-col gap-4 border-b border-[#ece7de] pb-6 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div className="space-y-4">
          <h1 className="text-[2.2rem] font-semibold tracking-[0.08em] text-[#3f3a37] sm:text-[2.6rem]">收件地址管理</h1>
        </div>
        <Link href="/account" className="text-sm font-semibold text-[#7a1414]">返回會員中心</Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="border border-[#e8dfcd] bg-white p-8">
          <h2 className="text-3xl font-semibold text-[#3f3a37]">新增地址</h2>
          <form action={saveCustomerAddress} className="mt-6 grid gap-4">
            <input type="hidden" name="id" value="" />
            <label className="space-y-2 text-sm text-stone-600">
              <span className="font-semibold text-stone-800">地址標籤</span>
              <input name="label" placeholder="例如：住家、公司" className="storefront-input" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-stone-600">
                <span className="font-semibold text-stone-800">收件人</span>
                <input name="recipientName" className="storefront-input" />
              </label>
              <label className="space-y-2 text-sm text-stone-600">
                <span className="font-semibold text-stone-800">電話</span>
                <input name="phone" className="storefront-input" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm text-stone-600">
                <span className="font-semibold text-stone-800">郵遞區號</span>
                <input name="zipCode" className="storefront-input" />
              </label>
              <label className="space-y-2 text-sm text-stone-600">
                <span className="font-semibold text-stone-800">縣市</span>
                <input name="city" className="storefront-input" />
              </label>
              <label className="space-y-2 text-sm text-stone-600">
                <span className="font-semibold text-stone-800">區域</span>
                <input name="district" className="storefront-input" />
              </label>
            </div>
            <label className="space-y-2 text-sm text-stone-600">
              <span className="font-semibold text-stone-800">詳細地址</span>
              <input name="addressLine" className="storefront-input" />
            </label>
            <label className="inline-flex items-center gap-3 text-sm text-stone-600">
              <input type="checkbox" name="isDefault" className="h-4 w-4 rounded border-stone-300 text-[#b72020]" />
              設為預設地址
            </label>
            <button type="submit" className="storefront-button">新增地址</button>
          </form>
        </section>

        <section className="space-y-4">
          {addresses.length > 0 ? addresses.map((address) => (
            <div key={address.id} className="border border-[#e8dfcd] bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-[#671515]">{address.label || "收件地址"}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">{address.recipientName} · {address.phone}<br />{address.zipCode} {address.city}{address.district}{address.addressLine}</p>
                </div>
                {address.isDefault ? <span className="rounded-full bg-[#fff3d8] px-3 py-1 text-xs font-semibold text-[#7a1414]">預設</span> : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {!address.isDefault ? (
                  <form action={setDefaultCustomerAddress.bind(null, address.id)}>
                    <button type="submit" className="storefront-button-secondary px-4 py-2">設為預設</button>
                  </form>
                ) : null}
                <form action={deleteCustomerAddress.bind(null, address.id)}>
                  <button type="submit" className="border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-500 transition hover:bg-stone-50 hover:text-[#b72020]">刪除</button>
                </form>
              </div>
            </div>
          )) : <div className="border border-dashed border-[#d8bb82] bg-[#fffaf0] p-8 text-sm leading-7 text-stone-600">尚未建立任何收件地址。</div>}
        </section>
      </div>
    </div>
  );
}