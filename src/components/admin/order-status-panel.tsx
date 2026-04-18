"use client";

import { useTransition } from "react";
import { updateOrderStatus, updatePaymentStatus } from "@/lib/actions/orders";

const ORDER_STATUSES = [
  { value: "PENDING",    label: "待確認" },
  { value: "CONFIRMED",  label: "已確認" },
  { value: "PROCESSING", label: "處理中" },
  { value: "SHIPPED",    label: "已出貨" },
  { value: "DELIVERED",  label: "已送達" },
  { value: "CANCELLED",  label: "已取消" },
  { value: "REFUNDED",   label: "已退款" },
];

const PAYMENT_STATUSES = [
  { value: "UNPAID",             label: "未付款" },
  { value: "PAID",               label: "已付款" },
  { value: "PARTIALLY_REFUNDED", label: "部分退款" },
  { value: "REFUNDED",           label: "已退款" },
  { value: "FAILED",             label: "付款失敗" },
];

export function OrderStatusPanel({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleOrderStatus(value: string) {
    startTransition(async () => {
      await updateOrderStatus(orderId, value);
    });
  }

  function handlePaymentStatus(value: string) {
    startTransition(async () => {
      await updatePaymentStatus(orderId, value);
    });
  }

  return (
    <div className="space-y-4">
      {isPending && (
        <p className="text-xs text-stone-400 animate-pulse">更新中…</p>
      )}

      {/* 訂單狀態 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-stone-500">訂單狀態</p>
        <div className="space-y-1">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s.value}
              disabled={isPending || currentStatus === s.value}
              onClick={() => handleOrderStatus(s.value)}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                currentStatus === s.value
                  ? "bg-stone-800 text-white font-medium"
                  : "text-stone-600 hover:bg-stone-100 disabled:opacity-40"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 付款狀態 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-stone-500">付款狀態</p>
        <div className="space-y-1">
          {PAYMENT_STATUSES.map((s) => (
            <button
              key={s.value}
              disabled={isPending || currentPaymentStatus === s.value}
              onClick={() => handlePaymentStatus(s.value)}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                currentPaymentStatus === s.value
                  ? "bg-stone-800 text-white font-medium"
                  : "text-stone-600 hover:bg-stone-100 disabled:opacity-40"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
