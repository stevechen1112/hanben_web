import Link from "next/link";
import { Search, Users } from "lucide-react";
import { db } from "@/lib/db";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const customers = await db.customer.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
      _count: { select: { orders: true } },
      orders: {
        where: { paymentStatus: "PAID" },
        select: { total: true },
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">客戶管理</h1>
          <p className="mt-1 text-sm text-stone-500">檢視會員資料、歷史訂單與累計消費。</p>
        </div>
        <form method="GET" className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="搜尋 Email、姓名"
            className="h-10 w-full rounded-xl border border-stone-200 bg-white pl-8 pr-3 text-sm placeholder:text-stone-400 focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20 lg:w-72"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-stone-300" />
            <p className="text-sm text-stone-500">找不到符合條件的客戶</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-stone-100 lg:hidden">
              {customers.map((customer) => {
                const name =
                  [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "未提供";
                const spent = customer.orders.reduce((sum, order) => sum + Number(order.total), 0);

                return (
                  <Link
                    key={customer.id}
                    href={`/admin/customers/${customer.id}`}
                    className="block px-4 py-4 transition-colors hover:bg-stone-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-800">{name}</p>
                        <p className="mt-1 truncate text-xs text-stone-400">{customer.email}</p>
                      </div>
                      <div className="text-right text-xs text-stone-500">
                        <p>{customer._count.orders} 筆訂單</p>
                        <p className="mt-1 font-semibold text-stone-700">NT$ {spent.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                      <span>電話：{customer.phone || "—"}</span>
                      <span>{new Date(customer.createdAt).toLocaleDateString("zh-TW")}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">姓名</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">Email</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">電話</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-stone-500">訂單數</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">累計消費</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">註冊日期</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const name =
                  [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "未提供";
                const spent = customer.orders.reduce((sum, order) => sum + Number(order.total), 0);

                return (
                  <tr key={customer.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                    <td className="px-5 py-3 text-xs font-medium text-stone-700">
                      <Link href={`/admin/customers/${customer.id}`} className="hover:text-[#B72020]">
                        {name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-xs text-stone-500">{customer.email}</td>
                    <td className="px-5 py-3 text-xs text-stone-500">{customer.phone || "—"}</td>
                    <td className="px-5 py-3 text-center text-xs text-stone-500">{customer._count.orders}</td>
                    <td className="px-5 py-3 text-right text-xs font-semibold text-stone-700">NT$ {spent.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-xs text-stone-400">{new Date(customer.createdAt).toLocaleDateString("zh-TW")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}