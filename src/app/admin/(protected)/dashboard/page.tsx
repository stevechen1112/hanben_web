import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  MessageSquare,
  Users,
  ArrowRight,
  Package,
} from "lucide-react";
import { RevenueChart } from "@/components/admin/revenue-chart";
import {
  getTodayRevenue,
  getMonthRevenue,
  getPendingOrdersCount,
  getLowStockCount,
  getNewCustomersCount,
  getUnreadContactCount,
  getRecentOrders,
  getDailyRevenue,
} from "@/lib/admin-queries";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

// ── 狀態對應 ─────────────────────────────────────────────
const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待確認", color: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "已確認", color: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "處理中", color: "bg-indigo-100 text-indigo-700" },
  SHIPPED: { label: "已出貨", color: "bg-cyan-100 text-cyan-700" },
  DELIVERED: { label: "已到貨", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "已取消", color: "bg-stone-100 text-stone-500" },
  REFUNDED: { label: "已退款", color: "bg-red-100 text-red-600" },
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  UNPAID: { label: "未付款", color: "bg-amber-100 text-amber-700" },
  PAID: { label: "已付款", color: "bg-green-100 text-green-700" },
  REFUNDED: { label: "已退款", color: "bg-red-100 text-red-600" },
  FAILED: { label: "失敗", color: "bg-red-100 text-red-600" },
};

export default async function DashboardPage() {
  const [
    today,
    month,
    pendingCount,
    lowStockCount,
    newCustomers,
    unreadContact,
    recentOrders,
    dailyRevenue,
  ] = await Promise.all([
    getTodayRevenue(),
    getMonthRevenue(),
    getPendingOrdersCount(),
    getLowStockCount(),
    getNewCustomersCount(),
    getUnreadContactCount(),
    getRecentOrders(),
    getDailyRevenue(),
  ]);

  const stats = [
    {
      title: "今日營收",
      value: `NT$ ${today.amount.toLocaleString()}`,
      sub: `${today.count} 筆訂單`,
      icon: TrendingUp,
      color: "text-[#B72020]",
      bg: "bg-[#B72020]/8",
    },
    {
      title: "本月營收",
      value: `NT$ ${month.amount.toLocaleString()}`,
      sub: `${month.count} 筆訂單`,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "待處理訂單",
      value: pendingCount.toString(),
      sub: "已付款未出貨",
      icon: ShoppingCart,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/admin/orders?filter=pending",
    },
    {
      title: "低庫存警示",
      value: lowStockCount.toString(),
      sub: "庫存 ≤ 10",
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/admin/products?filter=low-stock",
    },
    {
      title: "本月新客戶",
      value: newCustomers.toString(),
      sub: "本月新增",
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "未讀聯絡",
      value: unreadContact.toString(),
      sub: "待回覆",
      icon: MessageSquare,
      color: "text-pink-600",
      bg: "bg-pink-50",
      href: "/admin/contact",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 統計卡 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((s) => {
          const Icon = s.icon;
          const card = (
            <div
              key={s.title}
              className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500">{s.title}</p>
                <div className={`rounded-lg p-1.5 ${s.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${s.color}`} />
                </div>
              </div>
              <p className="mt-2 text-xl font-semibold text-stone-800">
                {s.value}
              </p>
              <p className="mt-0.5 text-[0.7rem] text-stone-400">{s.sub}</p>
            </div>
          );
          return s.href ? (
            <Link href={s.href} key={s.title} className="block">
              {card}
            </Link>
          ) : (
            <div key={s.title}>{card}</div>
          );
        })}
      </div>

      {/* 圖表 + 快速操作 */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* 近 14 天營收圖 */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-700">
              近 14 天營收趨勢
            </h2>
            <span className="text-xs text-stone-400">NT$</span>
          </div>
          <RevenueChart data={dailyRevenue} />
        </div>

        {/* 快速操作 */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">
            快速操作
          </h2>
          <div className="space-y-2">
            {[
              {
                label: "新增商品",
                href: "/admin/products/new",
                icon: Package,
              },
              {
                label: "查看所有訂單",
                href: "/admin/orders",
                icon: ShoppingCart,
              },
              {
                label: "聯絡表單",
                href: "/admin/contact",
                icon: MessageSquare,
              },
              {
                label: "媒體庫",
                href: "/admin/media",
                icon: Package,
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:border-stone-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-3.5 w-3.5 text-stone-400" />
                    {action.label}
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-stone-300" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 最近訂單 */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3.5 sm:px-5">
          <h2 className="text-sm font-semibold text-stone-700">最近訂單</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs text-[#B72020] hover:underline"
          >
            查看全部 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-sm text-stone-400">
            尚無訂單資料
          </div>
        ) : (
          <>
            <div className="divide-y divide-stone-100 lg:hidden">
              {recentOrders.map((order) => {
                const orderStatus =
                  ORDER_STATUS_MAP[order.status] ?? ORDER_STATUS_MAP.PENDING;
                const paymentStatus =
                  PAYMENT_STATUS_MAP[order.paymentStatus] ??
                  PAYMENT_STATUS_MAP.UNPAID;
                const customerName = order.customer
                  ? [order.customer.firstName, order.customer.lastName]
                      .filter(Boolean)
                      .join(" ") || order.email
                  : order.email;

                return (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block px-4 py-4 transition-colors hover:bg-stone-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-[#B72020]">
                          #{order.orderNumber}
                        </p>
                        <p className="mt-1 text-sm font-medium text-stone-800">
                          {customerName}
                        </p>
                        <p className="mt-1 text-xs text-stone-400">{order.email}</p>
                      </div>
                      <p className="shrink-0 text-xs font-semibold text-stone-800">
                        NT$ {Number(order.total).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${orderStatus.color}`}
                      >
                        {orderStatus.label}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${paymentStatus.color}`}
                      >
                        {paymentStatus.label}
                      </span>
                      <span className="text-xs text-stone-400">
                        {format(new Date(order.createdAt), "MM/dd HH:mm", {
                          locale: zhTW,
                        })}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">
                    訂單編號
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">
                    客戶
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">
                    狀態
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">
                    付款
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">
                    金額
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">
                    時間
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const orderStatus =
                    ORDER_STATUS_MAP[order.status] ?? ORDER_STATUS_MAP.PENDING;
                  const paymentStatus =
                    PAYMENT_STATUS_MAP[order.paymentStatus] ??
                    PAYMENT_STATUS_MAP.UNPAID;
                  const customerName = order.customer
                    ? [order.customer.firstName, order.customer.lastName]
                        .filter(Boolean)
                        .join(" ") || order.email
                    : order.email;

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-xs font-medium text-[#B72020] hover:underline"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-xs text-stone-600">
                        {customerName}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${orderStatus.color}`}
                        >
                          {orderStatus.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${paymentStatus.color}`}
                        >
                          {paymentStatus.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-xs font-medium text-stone-800">
                        NT$ {Number(order.total).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-stone-400">
                        {format(new Date(order.createdAt), "MM/dd HH:mm", {
                          locale: zhTW,
                        })}
                      </td>
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
