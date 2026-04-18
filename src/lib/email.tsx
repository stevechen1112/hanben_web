import { render } from "@react-email/render";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { PaymentReceivedEmail } from "@/emails/payment-received";
import { RefundNotificationEmail } from "@/emails/refund-notification";
import { ShippingNotificationEmail } from "@/emails/shipping-notification";
import { readOrderPaymentInfo } from "@/lib/order-payment-info";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || "noreply@hanben.com.tw";
}

async function renderEmail(element: React.ReactElement) {
  return render(element);
}

export async function getOrderEmailPayload(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          productTitle: true,
          variantTitle: true,
          quantity: true,
          total: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    shippingName: order.shippingName,
    shippingMethod: order.shippingMethod,
    paymentMethod: order.paymentMethod,
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    total: Number(order.total),
    trackingNumber: order.trackingNumber,
    paymentInfo: readOrderPaymentInfo(order.note),
    items: order.items.map((item) => ({
      id: item.id,
      productTitle: item.productTitle,
      variantTitle: item.variantTitle,
      quantity: item.quantity,
      total: Number(item.total),
    })),
  };
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn(`Resend not configured. Skip email: ${subject} -> ${to}`);
    return;
  }

  await resend.emails.send({
    from: getFromEmail(),
    to,
    subject,
    html,
  });
}

export async function sendOrderConfirmation(order: NonNullable<Awaited<ReturnType<typeof getOrderEmailPayload>>>) {
  await sendEmail({
    to: order.email,
    subject: `【漢本三代】訂單確認 ${order.orderNumber}`,
    html: await renderEmail(<OrderConfirmationEmail order={order} />),
  });
}

export async function sendPaymentReceived(order: NonNullable<Awaited<ReturnType<typeof getOrderEmailPayload>>>) {
  await sendEmail({
    to: order.email,
    subject: `【漢本三代】已收到付款 ${order.orderNumber}`,
    html: await renderEmail(<PaymentReceivedEmail order={order} />),
  });
}

export async function sendShippingNotification(order: NonNullable<Awaited<ReturnType<typeof getOrderEmailPayload>>>) {
  await sendEmail({
    to: order.email,
    subject: `【漢本三代】訂單已出貨 ${order.orderNumber}`,
    html: await renderEmail(<ShippingNotificationEmail order={order} />),
  });
}

export async function sendRefundNotification(order: NonNullable<Awaited<ReturnType<typeof getOrderEmailPayload>>>) {
  await sendEmail({
    to: order.email,
    subject: `【漢本三代】訂單已退款 ${order.orderNumber}`,
    html: await renderEmail(<RefundNotificationEmail order={order} />),
  });
}