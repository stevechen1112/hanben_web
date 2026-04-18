import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, CreditCard, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { OrderStatusPanel } from "@/components/admin/order-status-panel";
import { OrderFulfillmentActions } from "@/components/admin/order-fulfillment-actions";

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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { variant: { include: { product: { select: { title: true } } } } },
      },
      customer: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });

  if (!order) notFound();

  const orderStatus = ORDER_STATUS[order.status] ?? ORDER_STATUS.PENDING;
  const payStatus = PAYMENT_STATUS[order.paymentStatus] ?? PAYMENT_STATUS.UNPAID;

  return (
    <div className="space-y-4">
      {/* 麵包屑 */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <Link href="/admin/orders" className="flex items-center gap-1.5 hover:text-stone-700 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            訂單列表
          </Link>
          <span>/</span>
          <span className="font-mono text-stone-800 font-semibold">#{order.orderNumber}</span>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${orderStatus.className}`}>
            {orderStatus.label}
          </span>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${payStatus.className}`}>
            {payStatus.label}
          </span>
        </div>
        <p className="text-xs text-stone-400 lg:text-right">
          {new Date(order.createdAt).toLocaleString("zh-TW")}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 主欄 */}
        <div className="space-y-4 lg:col-span-2">
          {/* 品項 */}
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            <div className="border-b border-stone-100 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-stone-700">訂單品項</h2>
            </div>
            <div className="divide-y divide-stone-100 md:hidden">
              {order.items.map((item) => (
                <div key={item.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-800">{item.productTitle}</p>
                      <p className="mt-1 text-xs text-stone-400">{item.variantTitle}</p>
                      {item.sku && <p className="mt-1 text-xs text-stone-400">SKU: {item.sku}</p>}
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-stone-800">× {item.quantity}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
                    <span>單價 NT$ {Number(item.unitPrice).toLocaleString()}</span>
                    <span className="font-semibold text-stone-700">小計 NT$ {Number(item.total).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              <div className="space-y-2 bg-stone-50/50 px-4 py-4 text-xs">
                <div className="flex items-center justify-between text-stone-500">
                  <span>小計</span>
                  <span>NT$ {Number(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span>運費</span>
                  <span>NT$ {Number(order.shippingFee).toLocaleString()}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>折扣</span>
                    <span>-NT$ {Number(order.discountAmount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-stone-200 pt-2 text-sm font-semibold text-stone-800">
                  <span>合計</span>
                  <span>NT$ {Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <table className="hidden w-full text-sm md:table">
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-stone-50 last:border-0">
                    <td className="px-5 py-3">
                      <p className="text-xs font-medium text-stone-800">{item.productTitle}</p>
                      <p className="text-xs text-stone-400">{item.variantTitle}</p>
                      {item.sku && <p className="text-xs text-stone-400">SKU: {item.sku}</p>}
                    </td>
                    <td className="px-5 py-3 text-center text-xs text-stone-500">
                      × {item.quantity}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-stone-500">
                      NT$ {Number(item.unitPrice).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-xs font-semibold text-stone-700">
                      NT$ {Number(item.total).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-stone-50/50">
                <tr className="border-t border-stone-100">
                  <td colSpan={3} className="px-5 py-2 text-right text-xs text-stone-500">小計</td>
                  <td className="px-5 py-2 text-right text-xs text-stone-600">NT$ {Number(order.subtotal).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-5 py-2 text-right text-xs text-stone-500">運費</td>
                  <td className="px-5 py-2 text-right text-xs text-stone-600">NT$ {Number(order.shippingFee).toLocaleString()}</td>
                </tr>
                {Number(order.discountAmount) > 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-2 text-right text-xs text-stone-500">折扣</td>
                    <td className="px-5 py-2 text-right text-xs text-green-600">-NT$ {Number(order.discountAmount).toLocaleString()}</td>
                  </tr>
                )}
                <tr className="border-t border-stone-100">
                  <td colSpan={3} className="px-5 py-2.5 text-right text-sm font-semibold text-stone-700">合計</td>
                  <td className="px-5 py-2.5 text-right text-sm font-bold text-stone-900">NT$ {Number(order.total).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 收件資訊 */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-stone-400" />
              <h2 className="text-sm font-semibold text-stone-700">收件資訊</h2>
            </div>
            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <p className="text-stone-500">收件人</p>
                <p className="font-medium text-stone-800">{order.shippingName}</p>
              </div>
              <div>
                <p className="text-stone-500">電話</p>
                <p className="font-medium text-stone-800">{order.shippingPhone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-stone-500">地址</p>
                <p className="font-medium text-stone-800">
                  {order.shippingZip} {order.shippingCity}{order.shippingDistrict}{order.shippingAddress}
                </p>
              </div>
              {order.cvsStoreName && (
                <div className="sm:col-span-2">
                  <p className="text-stone-500">取貨門市</p>
                  <p className="font-medium text-stone-800">{order.cvsStoreName} ({order.cvsStoreAddress})</p>
                </div>
              )}
            </div>
          </div>

          {/* 物流資訊 */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4 text-stone-400" />
              <h2 className="text-sm font-semibold text-stone-700">物流資訊</h2>
            </div>
            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <p className="text-stone-500">運送方式</p>
                <p className="font-medium text-stone-800">{order.shippingMethod ?? "—"}</p>
              </div>
              <div>
                <p className="text-stone-500">物流編號</p>
                <p className="font-medium text-stone-800">{order.logisticsId ?? "—"}</p>
              </div>
              <div>
                <p className="text-stone-500">追蹤號碼</p>
                <p className="font-medium text-stone-800">{order.trackingNumber ?? "—"}</p>
              </div>
              <div>
                <p className="text-stone-500">出貨時間</p>
                <p className="font-medium text-stone-800">
                  {order.shippedAt ? new Date(order.shippedAt).toLocaleString("zh-TW") : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* 付款資訊 */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-stone-400" />
              <h2 className="text-sm font-semibold text-stone-700">付款資訊</h2>
            </div>
            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <p className="text-stone-500">付款方式</p>
                <p className="font-medium text-stone-800">{order.paymentMethod ?? "—"}</p>
              </div>
              <div>
                <p className="text-stone-500">付款參考號</p>
                <p className="font-medium text-stone-800">{order.paymentRef ?? "—"}</p>
              </div>
              <div>
                <p className="text-stone-500">付款時間</p>
                <p className="font-medium text-stone-800">
                  {order.paidAt ? new Date(order.paidAt).toLocaleString("zh-TW") : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* 備注 */}
          {order.note && (
            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <h2 className="mb-2 text-sm font-semibold text-stone-700">訂單備注</h2>
              <p className="text-xs text-stone-600">{order.note}</p>
            </div>
          )}
        </div>

        {/* 側欄：狀態更新 + 顧客資訊 */}
        <div className="space-y-4">
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-stone-700">狀態管理</h2>
            <OrderStatusPanel
              orderId={order.id}
              currentStatus={order.status}
              currentPaymentStatus={order.paymentStatus}
            />
          </div>

          <OrderFulfillmentActions
            orderId={order.id}
            logisticsId={order.logisticsId}
            shippingMethod={order.shippingMethod}
          />

          {/* 顧客資訊 */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-stone-700">顧客資訊</h2>
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-stone-500">電子郵件</p>
                <p className="font-medium text-stone-800">{order.email}</p>
              </div>
              {order.customer && (
                <div>
                  <Link
                    href={`/admin/customers/${order.customer.id}`}
                    className="text-[#B72020] hover:underline"
                  >
                    查看顧客資料 →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
