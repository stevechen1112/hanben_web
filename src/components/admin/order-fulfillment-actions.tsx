"use client";

import { useState, useTransition } from "react";
import { refundOrder, requestReverseLogistics } from "@/lib/actions/orders";

export function OrderFulfillmentActions({
  orderId,
  logisticsId,
  shippingMethod,
}: {
  orderId: string;
  logisticsId: string | null;
  shippingMethod: string | null;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function createShipping() {
    setMessage(null);
    const response = await fetch("/api/logistics/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const payload = (await response.json()) as { message?: string; logisticsId?: string };
    setMessage(
      response.ok
        ? `物流訂單已建立${payload.logisticsId ? `：${payload.logisticsId}` : ""}`
        : payload.message || "建立物流訂單失敗",
    );
    if (response.ok) {
      window.location.reload();
    }
  }

  function handleRefund(mode: "full" | "partial") {
    const amount =
      mode === "partial"
        ? Number(window.prompt("請輸入部分退款金額", "100")) || 0
        : undefined;

    startTransition(async () => {
      const result = await refundOrder(orderId, { mode, amount });
      setMessage("error" in result ? result.error : "退款處理完成");
      if (!("error" in result)) {
        window.location.reload();
      }
    });
  }

  function handleReverseLogistics() {
    const type = shippingMethod?.startsWith("home_")
      ? "home"
      : shippingMethod === "cvs_unimart"
      ? "unimart"
      : shippingMethod === "cvs_hilife"
      ? "hilife"
      : "cvs";

    startTransition(async () => {
      const result = await requestReverseLogistics(orderId, type);
      setMessage("error" in result ? result.error : "逆物流申請完成");
      if (!("error" in result)) {
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-stone-700">物流 / 退款操作</h2>
      {message && <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">{message}</p>}

      <div className="grid gap-2">
        <button
          type="button"
          onClick={() => void createShipping()}
          disabled={isPending}
          className="rounded-lg bg-stone-900 px-3 py-2 text-left text-xs font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
        >
          建立物流訂單
        </button>

        {logisticsId && (
          <a
            href={`/admin/orders/${orderId}/print`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-stone-200 px-3 py-2 text-left text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
          >
            列印出貨標籤
          </a>
        )}

        <button
          type="button"
          onClick={() => handleRefund("full")}
          disabled={isPending}
          className="rounded-lg border border-red-200 px-3 py-2 text-left text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          全額退款
        </button>

        <button
          type="button"
          onClick={() => handleRefund("partial")}
          disabled={isPending}
          className="rounded-lg border border-amber-200 px-3 py-2 text-left text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50"
        >
          部分退款
        </button>

        {logisticsId && (
          <button
            type="button"
            onClick={handleReverseLogistics}
            disabled={isPending}
            className="rounded-lg border border-stone-200 px-3 py-2 text-left text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
          >
            申請逆物流
          </button>
        )}
      </div>
    </div>
  );
}