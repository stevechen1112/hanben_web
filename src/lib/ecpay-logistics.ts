import { generateCheckMacValue } from "@/lib/ecpay-common";
import { getEnvValue } from "@/lib/env";

const STAGE_BASE_URL = "https://logistics-stage.ecpay.com.tw";
const PRODUCTION_BASE_URL = "https://logistics.ecpay.com.tw";

type LogisticsOrder = {
  id: string;
  orderNumber: string;
  email: string;
  shippingMethod: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingZip: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingAddress: string;
  cvsStoreId: string | null;
  total: number;
};

function getMerchantId() {
  return getEnvValue("ECPAY_LOGISTICS_MERCHANT_ID", {
    fallback: "2000132",
    required: process.env.ECPAY_ENV === "production",
    context: "ECPay logistics",
  });
}

function getHashKey() {
  return getEnvValue("ECPAY_LOGISTICS_HASH_KEY", {
    fallback: "XBERn1YOvpM9nfZc",
    required: process.env.ECPAY_ENV === "production",
    context: "ECPay logistics",
  });
}

function getHashIV() {
  return getEnvValue("ECPAY_LOGISTICS_HASH_IV", {
    fallback: "h1ONHk4P4yqbl5LK",
    required: process.env.ECPAY_ENV === "production",
    context: "ECPay logistics",
  });
}

function getSenderName() {
  return getEnvValue("ECPAY_SENDER_NAME", {
    fallback: "漢本三代",
    required: process.env.ECPAY_ENV === "production",
    context: "ECPay logistics sender",
  });
}

function getSenderPhone() {
  return getEnvValue("ECPAY_SENDER_PHONE", {
    fallback: "0900000000",
    required: process.env.ECPAY_ENV === "production",
    context: "ECPay logistics sender",
  });
}

function getSenderZipCode() {
  return getEnvValue("ECPAY_SENDER_ZIP", {
    fallback: "403",
    required: process.env.ECPAY_ENV === "production",
    context: "ECPay logistics sender",
  });
}

function getSenderAddress() {
  return getEnvValue("ECPAY_SENDER_ADDRESS", {
    fallback: "台中市西區示範路 1 號",
    required: process.env.ECPAY_ENV === "production",
    context: "ECPay logistics sender",
  });
}

export function getEcpayLogisticsBaseUrl() {
  return process.env.ECPAY_ENV === "production" ? PRODUCTION_BASE_URL : STAGE_BASE_URL;
}

function buildMerchantTradeNo(orderNumber: string) {
  return orderNumber.replaceAll("-", "").slice(0, 20);
}

function formatTradeDate(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  const seconds = `${date.getSeconds()}`.padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

export function buildCreateShippingOrderParams(order: LogisticsOrder, callbackBaseUrl: string) {
  const shippingMethod = order.shippingMethod || "";
  const isCvs = shippingMethod.startsWith("cvs_");
  const logisticsSubType = isCvs
    ? shippingMethod.replace("cvs_", "").toUpperCase()
    : shippingMethod.replace("home_", "").toUpperCase() || "TCAT";

  const params: Record<string, string | number> = {
    MerchantID: getMerchantId(),
    MerchantTradeNo: buildMerchantTradeNo(order.orderNumber),
    MerchantTradeDate: formatTradeDate(),
    LogisticsType: isCvs ? "CVS" : "Home",
    LogisticsSubType: logisticsSubType,
    GoodsAmount: Math.round(order.total),
    GoodsName: `漢本三代訂單 ${order.orderNumber}`,
    SenderName: getSenderName(),
    SenderCellPhone: getSenderPhone(),
    ReceiverName: order.shippingName,
    ReceiverCellPhone: order.shippingPhone,
    ReceiverEmail: order.email,
    ServerReplyURL: `${callbackBaseUrl}/api/webhooks/ecpay/logistics`,
    ClientReplyURL: `${callbackBaseUrl}/checkout/result?orderId=${order.id}`,
    Temperature: "0001",
    Distance: "00",
    Specification: "0001",
    ScheduledDeliveryTime: "4",
  };

  if (isCvs) {
    params.CollectionAmount = Math.round(order.total);
    params.IsCollection = "N";
    params.ReceiverStoreID = order.cvsStoreId || "";
  } else {
    params.SenderZipCode = getSenderZipCode();
    params.SenderAddress = getSenderAddress();
    params.ReceiverZipCode = order.shippingZip;
    params.ReceiverAddress = `${order.shippingCity}${order.shippingDistrict}${order.shippingAddress}`;
  }

  return {
    action: `${getEcpayLogisticsBaseUrl()}/Express/Create`,
    fields: {
      ...params,
      CheckMacValue: generateCheckMacValue(params, getHashKey(), getHashIV(), "MD5"),
    },
  };
}

export function buildPrintTradeDocumentParams(logisticsId: string) {
  const params = {
    MerchantID: getMerchantId(),
    AllPayLogisticsID: logisticsId,
  };

  return {
    action: `${getEcpayLogisticsBaseUrl()}/helper/printTradeDocument`,
    fields: {
      ...params,
      CheckMacValue: generateCheckMacValue(params, getHashKey(), getHashIV(), "MD5"),
    },
  };
}

export function buildReturnLogisticsParams(orderNumber: string, logisticsId: string, type: string) {
  const action = type === "home" ? "ReturnHome" : type === "unimart" ? "ReturnUniMartCVS" : type === "hilife" ? "ReturnHiLifeCVS" : "ReturnCVS";
  const params = {
    MerchantID: getMerchantId(),
    MerchantTradeNo: buildMerchantTradeNo(orderNumber),
    AllPayLogisticsID: logisticsId,
  };

  return {
    action: `${getEcpayLogisticsBaseUrl()}/Express/${action}`,
    fields: {
      ...params,
      CheckMacValue: generateCheckMacValue(params, getHashKey(), getHashIV(), "MD5"),
    },
  };
}

export function getEcpayLogisticsHashConfig() {
  return {
    hashKey: getHashKey(),
    hashIV: getHashIV(),
  };
}