import { db } from "@/lib/db";
import { getEcpayLogisticsHashConfig } from "@/lib/ecpay-logistics";
import { getOrderEmailPayload, sendShippingNotification } from "@/lib/email";
import { verifyCheckMacValue } from "@/lib/ecpay-common";

function normalizeMerchantTradeNo(orderNumber: string) {
  return orderNumber.replaceAll("-", "").slice(0, 20);
}

function determineShippingStatus(statusText: string) {
  if (/(已簽收|已取貨|已送達|配送完成)/.test(statusText)) {
    return "DELIVERED" as const;
  }

  if (/(配送中|已出貨|已寄出|已取件)/.test(statusText)) {
    return "SHIPPED" as const;
  }

  return null;
}

export async function POST(request: Request) {
  const body = await request.text();
  const params = Object.fromEntries(new URLSearchParams(body).entries());
  const { hashKey, hashIV } = getEcpayLogisticsHashConfig();

  if (!verifyCheckMacValue(params, hashKey, hashIV, "MD5")) {
    return new Response("0|CheckMacValue verify failed", { status: 400 });
  }

  const merchantTradeNo = params.MerchantTradeNo || params.CustomField2;
  const logisticsId = params.AllPayLogisticsID || params.LogisticsID;
  if (!merchantTradeNo && !logisticsId) {
    return new Response("0|Order not found", { status: 404 });
  }

  let order = logisticsId
    ? await db.order.findFirst({
        where: { logisticsId },
        select: { id: true, orderNumber: true, shippingStatus: true },
      })
    : null;

  if (!order && merchantTradeNo) {
    const candidates = await db.order.findMany({
      where: {
        orderNumber: {
          contains: merchantTradeNo.slice(0, 8),
        },
      },
      select: { id: true, orderNumber: true, shippingStatus: true },
    });

    order =
      candidates.find((candidate) => normalizeMerchantTradeNo(candidate.orderNumber) === merchantTradeNo) ||
      null;
  }

  if (!order) {
    return new Response("0|Order not found", { status: 404 });
  }

  const statusText = params.RtnMsg || params.CVSRtnMsg || params.Status || "";
  const nextStatus = determineShippingStatus(statusText);

  if (nextStatus === "SHIPPED") {
    await db.order.update({
      where: { id: order.id },
      data: {
        shippingStatus: "FULFILLED",
        status: "SHIPPED",
        shippedAt: new Date(),
      },
    });

    if (order.shippingStatus !== "FULFILLED") {
      try {
        const emailOrder = await getOrderEmailPayload(order.id);
        if (emailOrder) {
          await sendShippingNotification(emailOrder);
        }
      } catch (error) {
        console.error("Failed to send shipping notification", error);
      }
    }
  }

  if (nextStatus === "DELIVERED") {
    await db.order.update({
      where: { id: order.id },
      data: {
        shippingStatus: "FULFILLED",
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });
  }

  return new Response("1|OK", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}