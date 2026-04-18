import { generateCheckMacValue } from "@/lib/ecpay-common";
import { getEnvValue } from "@/lib/env";

const ECPAY_STAGE_AIO_URL = "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";
const ECPAY_PRODUCTION_AIO_URL = "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";

interface PaymentOrderItem {
  productTitle: string;
  variantTitle: string;
  quantity: number;
}

interface PaymentOrder {
  id: string;
  orderNumber: string;
  total: number;
  paymentMethod: string | null;
  createdAt: Date;
  items: PaymentOrderItem[];
}

function getPaymentMerchantId() {
  return getEnvValue("ECPAY_MERCHANT_ID", {
    fallback: "3002607",
    required: process.env.ECPAY_ENV === "production",
    context: "ECPay payment",
  });
}

function getHashKey() {
  return getEnvValue("ECPAY_HASH_KEY", {
    fallback: "pwFHCqoQZGmho4w6",
    required: process.env.ECPAY_ENV === "production",
    context: "ECPay payment",
  });
}

function getHashIV() {
  return getEnvValue("ECPAY_HASH_IV", {
    fallback: "EkRm7iFT261dpevs",
    required: process.env.ECPAY_ENV === "production",
    context: "ECPay payment",
  });
}

export function getEcpayAioUrl() {
  return process.env.ECPAY_ENV === "production"
    ? ECPAY_PRODUCTION_AIO_URL
    : ECPAY_STAGE_AIO_URL;
}

export function mapChoosePayment(paymentMethod: string | null | undefined) {
  switch (paymentMethod) {
    case "credit_card":
      return "Credit";
    case "atm":
      return "ATM";
    case "cvs_code":
      return "CVS";
    default:
      return "ALL";
  }
}

export function buildMerchantTradeNo(orderNumber: string) {
  return orderNumber.replaceAll("-", "").slice(0, 20);
}

function formatTradeDate(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  const hh = `${date.getHours()}`.padStart(2, "0");
  const mm = `${date.getMinutes()}`.padStart(2, "0");
  const ss = `${date.getSeconds()}`.padStart(2, "0");
  return `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
}

function buildItemName(items: PaymentOrderItem[]) {
  const normalized = items.map((item) => `${item.productTitle} ${item.variantTitle} x${item.quantity}`);
  const joined = normalized.join("#");
  return joined.slice(0, 390) || "漢本三代訂單商品";
}

export function buildAioCheckOutParams(order: PaymentOrder, baseUrl: string) {
  const choosePayment = mapChoosePayment(order.paymentMethod);
  const params: Record<string, string | number> = {
    MerchantID: getPaymentMerchantId(),
    MerchantTradeNo: buildMerchantTradeNo(order.orderNumber),
    MerchantTradeDate: formatTradeDate(order.createdAt),
    PaymentType: "aio",
    TotalAmount: Math.round(order.total),
    TradeDesc: `漢本三代訂單 ${order.orderNumber}`,
    ItemName: buildItemName(order.items),
    ReturnURL: `${baseUrl}/api/webhooks/ecpay/payment`,
    OrderResultURL: `${baseUrl}/checkout/result?orderId=${order.id}`,
    ClientBackURL: `${baseUrl}/checkout/result?orderId=${order.id}`,
    PaymentInfoURL: `${baseUrl}/api/webhooks/ecpay/payment`,
    ChoosePayment: choosePayment,
    EncryptType: 1,
    NeedExtraPaidInfo: "Y",
    CustomField1: order.id,
    CustomField2: order.orderNumber,
  };

  if (choosePayment === "ATM") {
    params.ExpireDate = 3;
  }

  if (choosePayment === "CVS") {
    params.StoreExpireDate = 10080;
  }

  return {
    action: getEcpayAioUrl(),
    fields: {
      ...params,
      CheckMacValue: generateCheckMacValue(params, getHashKey(), getHashIV(), "SHA256"),
    },
  };
}

export function getEcpayHashConfig() {
  return {
    hashKey: getHashKey(),
    hashIV: getHashIV(),
  };
}