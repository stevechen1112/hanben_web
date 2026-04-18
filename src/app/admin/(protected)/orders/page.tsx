import Link from "next/link";
import { db } from "@/lib/db";
import { Search, ShoppingBag } from "lucide-react";

const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "待確認",  className: "bg-amber-100 text-amber-700" },
  CONFIRMED:  { label: "已確認",  className: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "處理中",  className: "bg-purple-100 text-purple-700" },
  SHIPPED:    { label: "已出貨",  className: "bg-cyan-100 text-cyan-700" },
  DELIVERED:  { label: "已送達",  className: "bg-green-100 text-green-700" },
  CANCELLED:  { label: "已取消",  className: "bg-stone-100 text-stone-500" },
  REFUNDED:   { label: "已退款",  className: "bg-red-100 text-red-600" },
};

const PAYMENT_STATUS: Record<string, { label: string; className: string }> = {
  UNPAID:              { label: "未付款", className: "bg-red-100 text-red-600" },
  PAID:                { label: "已付款", className: "bg-green-100 text-green-700" },
  PARTIALLY_REFUNDED:  { label: "部分退款", className: "bg-orange-100 text-orange-700" },
  REFUNDED:            { label: "已退款", className: "bg-stone-100 text-stone-500" },
  FAILED:              { label: "付款失敗", className: "bg-red-100 text-red-700" },
};

interface SearchParams {
  q?: string;
  status?: string;
  filter?: string;
  page?: string;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = 25;
  const query = params.q?.trim() ?? "";
  const statusFilter = params.status;
  const specialFilter = params.filter;
  const pendingShipmentFilter = specialFilter === "pending";

  const buildHref = (next: {
    q?: string;
    status?: string;
    filter?: string;
    page?: string;
  }) => {
    const queryParams = new URLSearchParams();

    if (next.q) queryParams.set("q", next.q);
    if (next.status) queryParams.set("status", next.status);
    if (next.filter) queryParams.set("filter", next.filter);
    if (next.page) queryParams.set("page", next.page);

    const queryString = queryParams.toString();
    return queryString ? `/admin/orders?${queryString}` : "/admin/orders";
  };

  const where = {
    ...(query && {
      OR: [
        { orderNumber: { contains: query, mode: "insensitive" as const } },
        { email: { contains: query, mode: "insensitive" as const } },
        { shippingName: { contains: query, mode: "insensitive" as const } },
      ],
    }),
    ...(statusFilter && { status: statusFilter as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" }),
    ...(pendingShipmentFilter && {
      paymentStatus: "PAID" as const,
      shippingStatus: "UNFULFILLED" as const,
    }),
  };

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        orderNumber: true,
        email: true,
        shippingName: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* 操作列 */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <form method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input
              name="q"
              defaultValue={query}
              placeholder="訂單編號、電子郵件…"
              className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-8 pr-3 text-sm placeholder:text-stone-400 focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20 xl:w-72"
            />
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            {pendingShipmentFilter && <input type="hidden" name="filter" value="pending" />}
          </form>

          <div className="flex flex-wrap items-center gap-1.5">
            {(["", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map((s) => (
              <Link
                key={s}
                href={buildHref({ q: query || undefined, status: s || undefined })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  (statusFilter === s && !pendingShipmentFilter) || (!s && !statusFilter && !pendingShipmentFilter)
                    ? "bg-stone-800 text-white"
                    : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                {s === "" ? "全部" : ORDER_STATUS[s]?.label}
              </Link>
            ))}
            <Link
              href={buildHref({ q: query || undefined, filter: "pending" })}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                pendingShipmentFilter
                  ? "bg-stone-800 text-white"
                  : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              待出貨
            </Link>
          </div>
        </div>
      </div>

      {/* 訂單表格 */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag className="mb-3 h-10 w-10 text-stone-300" />
            <p className="text-sm text-stone-500">
              {query || statusFilter ? "找不到符合條件的訂單" : "尚無訂單"}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-stone-100 lg:hidden">
              {orders.map((order) => {
                const orderStatus = ORDER_STATUS[order.status] ?? ORDER_STATUS.PENDING;
                const payStatus = PAYMENT_STATUS[order.paymentStatus] ?? PAYMENT_STATUS.UNPAID;

                return (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block px-4 py-4 transition-colors hover:bg-stone-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-[#B72020]">#{order.orderNumber}</p>
                        <p className="mt-1 text-sm font-medium text-stone-800">{order.shippingName}</p>
                        <p className="mt-1 truncate text-xs text-stone-400">{order.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-stone-800">NT$ {Number(order.total).toLocaleString()}</p>
                        <p className="mt-1 text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString("zh-TW")}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${orderStatus.className}`}>
                        {orderStatus.label}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${payStatus.className}`}>
                        {payStatus.label}
                      </span>
                      <span className="text-xs text-stone-400">{order._count.items} 項商品</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">訂單編號</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">顧客</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">訂單狀態</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">付款狀態</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-stone-500">品項數</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">金額</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">建立時間</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const orderStatus = ORDER_STATUS[order.status] ?? ORDER_STATUS.PENDING;
                const payStatus = PAYMENT_STATUS[order.paymentStatus] ?? PAYMENT_STATUS.UNPAID;
                return (
                  <tr
                    key={order.id}
                    className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs font-semibold text-[#B72020] hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-xs font-medium text-stone-700">{order.shippingName}</p>
                        <p className="text-xs text-stone-400">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${orderStatus.className}`}>
                        {orderStatus.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${payStatus.className}`}>
                        {payStatus.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-xs text-stone-500">
                      {order._count.items}
                    </td>
                    <td className="px-5 py-3 text-right text-xs font-semibold text-stone-700">
                      NT$ {Number(order.total).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString("zh-TW")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-stone-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-stone-400">共 {total} 筆，第 {page}/{totalPages} 頁</p>
            <div className="flex gap-1">
              {page > 1 && (
                <Link href={buildHref({ page: String(page - 1), q: query || undefined, status: statusFilter, filter: pendingShipmentFilter ? "pending" : undefined })}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs hover:bg-stone-50 transition-colors">上一頁</Link>
              )}
              {page < totalPages && (
                <Link href={buildHref({ page: String(page + 1), q: query || undefined, status: statusFilter, filter: pendingShipmentFilter ? "pending" : undefined })}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs hover:bg-stone-50 transition-colors">下一頁</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
