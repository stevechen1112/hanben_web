import { EmailLayout, emailStyles, formatPrice } from "./shared";

interface OrderEmailPayload {
  orderNumber: string;
  shippingName: string;
  total: number;
}

export function PaymentReceivedEmail({ order }: { order: OrderEmailPayload }) {
  return (
    <EmailLayout
      badge="PAYMENT RECEIVED"
      title={`訂單 ${order.orderNumber} 已完成付款`}
      subtitle="款項已確認入帳，我們會儘快安排出貨。"
    >
      <div style={emailStyles.section}>
        <p style={emailStyles.label}>訂單摘要</p>
        <p style={{ margin: "8px 0 0", fontSize: "18px", fontWeight: 700 }}>{order.shippingName}</p>
        <p style={{ ...emailStyles.muted, marginTop: "8px" }}>
          已收到訂單款項，金額為 {formatPrice(order.total)}。
          <br />
          後續若完成出貨，系統也會再寄送追蹤通知給您。
        </p>
      </div>
    </EmailLayout>
  );
}