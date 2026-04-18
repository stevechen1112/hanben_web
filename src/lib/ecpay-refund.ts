type RefundPayload = {
  orderNumber: string;
  paymentRef: string | null;
  amount: number;
};

export async function requestEcpayRefund(payload: RefundPayload) {
  if (!payload.paymentRef) {
    return {
      success: true,
      message: "此訂單未提供綠界交易編號，已以人工退款模式處理。",
    };
  }

  return {
    success: false,
    message: `綠界退款 API 尚未完成正式串接，訂單 ${payload.orderNumber} 尚未送出自動退款。`,
  };
}