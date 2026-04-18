import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updateCustomerNote } from "@/lib/actions/customers";
import { db } from "@/lib/db";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] },
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
      },
    },
  });

  if (!customer) notFound();

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "未提供姓名";
  const totalSpent = customer.orders.reduce((sum, order) => sum + Number(order.total), 0);
  const saveNote = updateCustomerNote.bind(null, customer.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
        <Link href="/admin/customers" className="flex items-center gap-1.5 hover:text-stone-700">
          <ArrowLeft className="h-3.5 w-3.5" /> 客戶列表
        </Link>
        <span>/</span>
        <span className="font-medium text-stone-800">{fullName}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h1 className="text-lg font-semibold text-stone-800">{fullName}</h1>
            <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <p className="text-stone-500">Email</p>
                <p className="font-medium text-stone-800">{customer.email}</p>
              </div>
              <div>
                <p className="text-stone-500">電話</p>
                <p className="font-medium text-stone-800">{customer.phone || "—"}</p>
              </div>
              <div>
                <p className="text-stone-500">註冊日期</p>
                <p className="font-medium text-stone-800">{new Date(customer.createdAt).toLocaleString("zh-TW")}</p>
              </div>
              <div>
                <p className="text-stone-500">累計消費</p>
                <p className="font-medium text-stone-800">NT$ {totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-stone-700">地址列表</h2>
            {customer.addresses.length === 0 ? (
              <p className="text-xs text-stone-400">尚未建立地址</p>
            ) : (
              <div className="space-y-3">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="rounded-lg border border-stone-100 bg-stone-50 p-4 text-xs text-stone-600">
                    <p className="font-medium text-stone-800">
                      {address.label || "地址"} {address.isDefault ? "(預設)" : ""}
                    </p>
                    <p className="mt-1">{address.recipientName} / {address.phone}</p>
                    <p className="mt-1">{address.zipCode} {address.city}{address.district}{address.addressLine}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
            <div className="border-b border-stone-100 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-stone-700">歷史訂單</h2>
            </div>
            {customer.orders.length === 0 ? (
              <div className="px-5 py-8 text-xs text-stone-400">目前沒有訂單</div>
            ) : (
              <>
                <div className="divide-y divide-stone-100 md:hidden">
                  {customer.orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="block px-4 py-4 transition-colors hover:bg-stone-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-xs font-semibold text-[#B72020]">#{order.orderNumber}</p>
                          <p className="mt-1 text-xs text-stone-500">{order.status} / {order.paymentStatus}</p>
                        </div>
                        <p className="text-sm font-semibold text-stone-700">NT$ {Number(order.total).toLocaleString()}</p>
                      </div>
                      <p className="mt-3 text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString("zh-TW")}</p>
                    </Link>
                  ))}
                </div>

                <table className="hidden w-full text-sm md:table">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">訂單編號</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">狀態</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">付款</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">金額</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => (
                      <tr key={order.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                        <td className="px-5 py-3 text-xs font-medium text-[#B72020]">
                          <Link href={`/admin/orders/${order.id}`}>#{order.orderNumber}</Link>
                        </td>
                        <td className="px-5 py-3 text-xs text-stone-500">{order.status}</td>
                        <td className="px-5 py-3 text-xs text-stone-500">{order.paymentStatus}</td>
                        <td className="px-5 py-3 text-right text-xs font-medium text-stone-700">NT$ {Number(order.total).toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString("zh-TW")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">備註欄</h2>
          <form action={saveNote} className="space-y-3">
            <textarea
              name="note"
              rows={10}
              defaultValue={customer.note ?? ""}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-[#B72020] focus:ring-2 focus:ring-[#B72020]/20"
              placeholder="輸入客服備註、購買習慣或其他紀錄"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-[#B72020] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#9a1a1a] sm:w-auto"
            >
              儲存備註
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}