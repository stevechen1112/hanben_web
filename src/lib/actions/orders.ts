"use server";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { buildReturnLogisticsParams } from "@/lib/ecpay-logistics";
import { requestEcpayRefund } from "@/lib/ecpay-refund";
import { getOrderEmailPayload, sendRefundNotification } from "@/lib/email";
import {
  canTransitionOrderStatus,
  canTransitionPaymentStatus,
  getNextOrderStatuses,
} from "@/lib/order-status";

type Result = { error: string } | { success: true };

function decimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role === "CUSTOMER") {
    throw new Error("未授權");
  }
  return session;
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<Result> {
  await requireAdmin();

  const validStatuses = [
    "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED",
    "DELIVERED", "CANCELLED", "REFUNDED",
  ];
  if (!validStatuses.includes(status)) return { error: "無效的狀態" };

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });

  if (!order) return { error: "訂單不存在" };

  if (!canTransitionOrderStatus(order.status, status as typeof order.status)) {
    const next = getNextOrderStatuses(order.status).join("、") || "無";
    return { error: `狀態不可直接變更，下一步僅允許：${next}` };
  }

  await db.order.update({
    where: { id: orderId },
    data: {
      status: status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED",
      ...(status === "SHIPPED" && { shippedAt: new Date() }),
      ...(status === "DELIVERED" && { deliveredAt: new Date() }),
      ...(status === "CANCELLED" && { cancelledAt: new Date() }),
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: string,
): Promise<Result> {
  await requireAdmin();

  const validStatuses = ["UNPAID", "PAID", "PARTIALLY_REFUNDED", "REFUNDED", "FAILED"];
  if (!validStatuses.includes(paymentStatus)) return { error: "無效的付款狀態" };

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true },
  });
  if (!order) return { error: "訂單不存在" };

  if (!canTransitionPaymentStatus(order.paymentStatus, paymentStatus as typeof order.paymentStatus)) {
    return { error: "付款狀態不可直接變更" };
  }

  await db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: paymentStatus as "UNPAID" | "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED" | "FAILED",
      ...(paymentStatus === "PAID" && { paidAt: new Date() }),
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function updateTrackingNumber(
  orderId: string,
  _prev: Result | null,
  formData: FormData,
): Promise<Result> {
  await requireAdmin();

  const trackingNumber = (formData.get("trackingNumber") as string)?.trim();
  const logisticsId = (formData.get("logisticsId") as string)?.trim();

  await db.order.update({
    where: { id: orderId },
    data: { trackingNumber, logisticsId },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function refundOrder(
  orderId: string,
  options: { mode: "full" | "partial"; amount?: number },
): Promise<Result> {
  await requireAdmin();

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            select: { id: true, inventory: true, trackInventory: true },
          },
        },
      },
    },
  });

  if (!order) return { error: "訂單不存在" };

  const amount =
    options.mode === "partial"
      ? Math.min(options.amount ?? 0, Number(order.total))
      : Number(order.total);

  if (amount <= 0) {
    return { error: "退款金額必須大於 0" };
  }

  const refundResult = await requestEcpayRefund({
    orderNumber: order.orderNumber,
    paymentRef: order.paymentRef,
    amount,
  });

  if (!refundResult.success) {
    return { error: refundResult.message };
  }

  await db.$transaction(async (tx) => {
    if (options.mode === "full") {
      for (const item of order.items) {
        if (item.variant.trackInventory) {
          await tx.variant.update({
            where: { id: item.variant.id },
            data: {
              inventory: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    }

    const refundNote = `${new Date().toISOString()} ${options.mode === "partial" ? "部分退款" : "全額退款"} NT$${amount.toLocaleString("zh-TW")}`;

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: options.mode === "partial" ? "PARTIALLY_REFUNDED" : "REFUNDED",
        status: options.mode === "partial" ? order.status : "REFUNDED",
        note: order.note ? `${order.note}\n${refundNote}` : refundNote,
      },
    });
  });

  try {
    const emailOrder = await getOrderEmailPayload(orderId);
    if (emailOrder && options.mode === "full") {
      await sendRefundNotification(emailOrder);
    }
  } catch (error) {
    console.error("Failed to send refund notification", error);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function requestReverseLogistics(
  orderId: string,
  type: "home" | "cvs" | "unimart" | "hilife",
): Promise<Result> {
  await requireAdmin();

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      logisticsId: true,
    },
  });

  if (!order) return { error: "訂單不存在" };
  if (!order.logisticsId) return { error: "尚未建立物流訂單" };

  const payload = buildReturnLogisticsParams(order.orderNumber, order.logisticsId, type);
  const response = await fetch(payload.action, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(
      Object.entries(payload.fields).map(([key, value]) => [key, String(value)]),
    ).toString(),
  });

  const raw = await response.text();
  const parsed = Object.fromEntries(new URLSearchParams(raw).entries());

  if (
    !response.ok ||
    raw.startsWith("0|") ||
    parsed.RtnCode === "0" ||
    parsed.ResCode === "0"
  ) {
    return { error: parsed.RtnMsg || parsed.ResMsg || raw || "逆物流申請失敗" };
  }

  await db.order.update({
    where: { id: orderId },
    data: { shippingStatus: "RETURNED" },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
