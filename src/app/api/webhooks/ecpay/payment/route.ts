import { db } from "@/lib/db";
import { getEcpayHashConfig } from "@/lib/ecpay";
import { verifyCheckMacValue } from "@/lib/ecpay-common";
import { getOrderEmailPayload, sendPaymentReceived } from "@/lib/email";
import { upsertOrderPaymentInfo } from "@/lib/order-payment-info";

function parsePaymentDate(raw: string | undefined) {
  if (!raw) {
    return null;
  }

  const normalized = raw.replace(/\//g, "-");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(request: Request) {
  const body = await request.text();
  const params = Object.fromEntries(new URLSearchParams(body).entries());
  const { hashKey, hashIV } = getEcpayHashConfig();

  if (!verifyCheckMacValue(params, hashKey, hashIV, "SHA256")) {
    console.error("ECPay CheckMacValue verification failed", params);
    return new Response("0|CheckMacValue verify failed", { status: 400 });
  }

  const orderId = params.CustomField1;
  if (!orderId) {
    return new Response("0|Missing orderId", { status: 400 });
  }

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return new Response("0|Order not found", { status: 404 });
  }

  const updates: Parameters<typeof db.order.update>[0]["data"] = {};
  const bankCode = params.BankCode || undefined;
  const vAccount = params.vAccount || undefined;
  const paymentNo = params.PaymentNo || undefined;
  const expireDate = params.ExpireDate || params.PaymentDueDate || undefined;

  if (bankCode && vAccount) {
    updates.note = upsertOrderPaymentInfo(order.note, {
      kind: "ATM",
      bankCode,
      vAccount,
      expireDate,
    });
  }

  if (paymentNo) {
    updates.note = upsertOrderPaymentInfo(order.note, {
      kind: "CVS",
      paymentNo,
      expireDate,
    });
  }

  if (params.TradeNo) {
    updates.paymentRef = params.TradeNo;
  }

  let shouldSendPaymentEmail = false;

  if (params.RtnCode === "1") {
    updates.paymentStatus = "PAID";
    updates.paidAt = parsePaymentDate(params.PaymentDate) || new Date();
    shouldSendPaymentEmail = order.paymentStatus !== "PAID";
  }

  if (Object.keys(updates).length > 0) {
    await db.order.update({
      where: { id: order.id },
      data: updates,
    });
  }

  if (shouldSendPaymentEmail) {
    try {
      const emailOrder = await getOrderEmailPayload(order.id);
      if (emailOrder) {
        await sendPaymentReceived(emailOrder);
      }
    } catch (error) {
      console.error("Failed to send payment received email", error);
    }
  }

  return new Response("1|OK", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}