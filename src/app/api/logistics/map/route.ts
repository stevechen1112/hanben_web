import { NextRequest } from "next/server";
import { getEnvValue } from "@/lib/env";

const LOGISTICS_STAGE_MAP_URL = "https://logistics-stage.ecpay.com.tw/Express/map";
const LOGISTICS_PRODUCTION_MAP_URL = "https://logistics.ecpay.com.tw/Express/map";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getAllowedOrigin(origin: string | null, fallbackOrigin: string) {
  if (!origin) {
    return fallbackOrigin;
  }

  try {
    return new URL(origin).origin;
  } catch {
    return fallbackOrigin;
  }
}

function getLogisticsMerchantId() {
  return getEnvValue("ECPAY_LOGISTICS_MERCHANT_ID", {
    fallback: "2000132",
    required: process.env.ECPAY_ENV === "production",
    context: "ECPay logistics map",
  });
}

export async function GET(request: NextRequest) {
  const subType = request.nextUrl.searchParams.get("subType") || "FAMI";
  const origin = getAllowedOrigin(
    request.nextUrl.searchParams.get("origin"),
    request.nextUrl.origin,
  );
  const serverReplyUrl = `${request.nextUrl.origin}/api/logistics/map?origin=${encodeURIComponent(origin)}`;
  const actionUrl =
    process.env.ECPAY_ENV === "production"
      ? LOGISTICS_PRODUCTION_MAP_URL
      : LOGISTICS_STAGE_MAP_URL;

  const html = `<!doctype html>
  <html lang="zh-Hant">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>超商門市地圖</title>
      <style>
        body { margin: 0; font-family: "Noto Sans TC", sans-serif; background: #fafaf9; color: #292524; }
        .shell { display: flex; min-height: 100vh; align-items: center; justify-content: center; padding: 24px; }
        .card { width: min(560px, 100%); border: 1px solid #e7e5e4; border-radius: 24px; background: #fff; padding: 24px; box-shadow: 0 24px 60px rgba(120, 53, 15, 0.08); }
        h1 { margin: 0 0 12px; font-size: 20px; }
        p { margin: 0; color: #78716c; line-height: 1.75; }
      </style>
    </head>
    <body>
      <div class="shell">
        <div class="card">
          <h1>正在載入綠界超商電子地圖</h1>
          <p>請稍候，系統會自動開啟門市選擇畫面。完成選擇後，門市資料會自動回填至結帳頁。</p>
        </div>
      </div>
      <form id="map-form" method="post" action="${escapeHtml(actionUrl)}">
        <input type="hidden" name="MerchantID" value="${escapeHtml(getLogisticsMerchantId())}" />
        <input type="hidden" name="LogisticsType" value="CVS" />
        <input type="hidden" name="LogisticsSubType" value="${escapeHtml(subType)}" />
        <input type="hidden" name="IsCollection" value="N" />
        <input type="hidden" name="ServerReplyURL" value="${escapeHtml(serverReplyUrl)}" />
      </form>
      <script>
        document.getElementById("map-form").submit();
      </script>
    </body>
  </html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const fallbackOrigin = request.nextUrl.origin;
  const origin = getAllowedOrigin(data.get("origin")?.toString() || request.nextUrl.searchParams.get("origin"), fallbackOrigin);
  const payload = {
    storeId:
      data.get("CVSStoreID")?.toString() ||
      data.get("StoreID")?.toString() ||
      data.get("MerchantTradeNo")?.toString() ||
      "",
    storeName:
      data.get("CVSStoreName")?.toString() ||
      data.get("StoreName")?.toString() ||
      data.get("CVSStoreName")?.toString() ||
      "",
    storeAddress:
      data.get("CVSAddress")?.toString() || data.get("StoreAddress")?.toString() || "",
  };

  const html = `<!doctype html>
  <html lang="zh-Hant">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>門市已選擇</title>
      <style>
        body { margin: 0; font-family: "Noto Sans TC", sans-serif; background: #fafaf9; color: #292524; display: grid; place-items: center; min-height: 100vh; }
        .card { width: min(520px, calc(100% - 32px)); border: 1px solid #e7e5e4; border-radius: 24px; background: #fff; padding: 24px; text-align: center; box-shadow: 0 24px 60px rgba(120, 53, 15, 0.08); }
        h1 { margin: 0 0 12px; font-size: 20px; }
        p { margin: 0; color: #78716c; line-height: 1.75; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>門市選擇完成</h1>
        <p>資料已回傳到結帳頁，這個視窗將自動關閉。</p>
      </div>
      <script>
        const payload = ${JSON.stringify(payload)};
        if (window.parent) {
          window.parent.postMessage({ type: "hanben:cvs-store-selected", payload }, ${JSON.stringify(origin)});
        }
      </script>
    </body>
  </html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}