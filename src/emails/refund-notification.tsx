import { EmailLayout, emailStyles, formatPrice } from "./shared";

interface RefundNotificationPayload {
  orderNumber: string;
  shippingName: string;
  total: number;
}

export function RefundNotificationEmail({ order }: { order: RefundNotificationPayload }) {
  return (
    <EmailLayout
      badge="REFUND PROCESSED"
      title={`訂單 ${order.orderNumber} 已完成退款`}
      subtitle="退款申請已處理完成，款項將依原付款方式退回。"
    >
      <div style={emailStyles.section}>
        <p style={emailStyles.label}>退款摘要</p>
        <p style={{ margin: "8px 0 0", fontSize: "18px", fontWeight: 700 }}>{order.shippingName}</p>
        <p style={{ ...emailStyles.muted, marginTop: "8px" }}>
          本次退款金額為 {formatPrice(order.total)}。
          <br />
          若 3 至 7 個工作天後仍未收到退款，請與客服聯繫。
        </p>
      </div>
    </EmailLayout>
  );
}