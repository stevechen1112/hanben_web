import { EmailLayout, emailStyles, formatPrice } from "./shared";
import type { DeferredPaymentInfo } from "@/lib/order-payment-info";

interface OrderItem {
  id: string;
  productTitle: string;
  variantTitle: string;
  quantity: number;
  total: number;
}

interface OrderEmailPayload {
  orderNumber: string;
  email: string;
  shippingName: string;
  shippingMethod: string | null;
  paymentMethod: string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  items: OrderItem[];
  paymentInfo: DeferredPaymentInfo | null;
}

function paymentDescription(paymentMethod: string | null) {
  switch (paymentMethod) {
    case "credit_card":
      return "信用卡";
    case "atm":
      return "ATM 虛擬帳號";
    case "cvs_code":
      return "超商代碼";
    default:
      return "線上付款";
  }
}

export function OrderConfirmationEmail({ order }: { order: OrderEmailPayload }) {
  return (
    <EmailLayout
      badge="ORDER CONFIRMED"
      title={`訂單 ${order.orderNumber} 已建立`}
      subtitle="我們已收到您的訂單，付款與配送資訊如下。"
    >
      <div style={emailStyles.section}>
        <p style={emailStyles.label}>收件人</p>
        <p style={{ margin: "8px 0 0", fontSize: "18px", fontWeight: 700 }}>{order.shippingName}</p>
        <p style={{ ...emailStyles.muted, marginTop: "8px" }}>
          付款方式：{paymentDescription(order.paymentMethod)}
          <br />
          配送方式：{order.shippingMethod}
        </p>
      </div>

      <div style={{ ...emailStyles.section, paddingTop: 0 }}>
        <table style={emailStyles.table}>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} style={emailStyles.rowDivider}>
                <td style={{ padding: "14px 0" }}>
                  <div style={{ fontWeight: 600 }}>{item.productTitle}</div>
                  <div style={{ ...emailStyles.muted, marginTop: "4px" }}>{item.variantTitle} x {item.quantity}</div>
                </td>
                <td style={{ padding: "14px 0", textAlign: "right", verticalAlign: "top" }}>
                  <span style={emailStyles.amount}>{formatPrice(item.total)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "20px", borderTop: "1px dashed #e7e5e4", paddingTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", ...emailStyles.muted }}>
            <span>商品小計</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", ...emailStyles.muted }}>
            <span>運費</span>
            <span>{order.shippingFee === 0 ? "免運" : formatPrice(order.shippingFee)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontWeight: 700, fontSize: "16px" }}>
            <span>訂單總額</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {order.paymentInfo && (
        <div style={{ ...emailStyles.section, paddingTop: 0 }}>
          <div style={{ borderRadius: "18px", backgroundColor: "#fff7ed", padding: "18px 20px", border: "1px solid #fed7aa" }}>
            <p style={{ margin: 0, fontWeight: 700, color: "#9a3412" }}>付款資訊</p>
            <p style={{ ...emailStyles.muted, marginTop: "10px", color: "#9a3412" }}>
              {order.paymentInfo.kind === "ATM"
                ? `銀行代碼：${order.paymentInfo.bankCode} / 虛擬帳號：${order.paymentInfo.vAccount} / 繳費期限：${order.paymentInfo.expireDate}`
                : `超商代碼：${order.paymentInfo.paymentNo} / 繳費期限：${order.paymentInfo.expireDate}`}
            </p>
          </div>
        </div>
      )}
    </EmailLayout>
  );
}