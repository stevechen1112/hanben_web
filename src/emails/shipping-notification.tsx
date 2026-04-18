import { EmailLayout, emailStyles } from "./shared";

interface OrderEmailPayload {
  orderNumber: string;
  shippingName: string;
  trackingNumber: string | null;
}

export function ShippingNotificationEmail({ order }: { order: OrderEmailPayload }) {
  return (
    <EmailLayout
      badge="SHIPPED"
      title={`訂單 ${order.orderNumber} 已出貨`}
      subtitle="包裹已交付物流，請留意近期配送進度。"
    >
      <div style={emailStyles.section}>
        <p style={emailStyles.label}>收件人</p>
        <p style={{ margin: "8px 0 0", fontSize: "18px", fontWeight: 700 }}>{order.shippingName}</p>
        <p style={{ ...emailStyles.muted, marginTop: "8px" }}>
          {order.trackingNumber
            ? `追蹤編號：${order.trackingNumber}`
            : "物流追蹤編號尚未提供，請等待後續簡訊或客服通知。"}
        </p>
      </div>
    </EmailLayout>
  );
}