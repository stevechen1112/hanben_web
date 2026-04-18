import { NextRequest } from "next/server";
import { buildAioCheckOutParams } from "@/lib/ecpay";
import { db } from "@/lib/db";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function buildPaymentPage(orderId: string, origin: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        orderBy: { id: "asc" },
        select: {
          productTitle: true,
          variantTitle: true,
          quantity: true,
        },
      },
    },
  });

  if (!order) {
    return new Response("找不到訂單。", { status: 404 });
  }

  if (order.paymentStatus === "PAID") {
    return Response.redirect(`${origin}/checkout/result?orderId=${order.id}`, 302);
  }

  const { action, fields } = buildAioCheckOutParams(
    {
      id: order.id,
      orderNumber: order.orderNumber,
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      items: order.items,
    },
    origin,
  );

  const inputs = Object.entries(fields)
    .map(
      ([key, value]) =>
        `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(String(value))}" />`,
    )
    .join("\n");

  const html = `<!doctype html>
  <html lang="zh-Hant">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>前往綠界付款</title>
      <style>
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #fafaf9; color: #292524; font-family: "Noto Sans TC", sans-serif; }
        .card { width: min(540px, calc(100% - 32px)); border-radius: 28px; border: 1px solid #e7e5e4; background: #ffffff; padding: 28px; box-shadow: 0 24px 60px rgba(120,53,15,0.08); }
        h1 { margin: 0 0 12px; font-size: 24px; }
        p { margin: 0; line-height: 1.8; color: #78716c; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>正在前往綠界付款</h1>
        <p>訂單 ${escapeHtml(order.orderNumber)} 已建立，系統會自動帶您前往綠界付款頁。若未自動跳轉，請點擊下方按鈕。</p>
        <form id="ecpay-form" method="post" action="${escapeHtml(action)}" style="margin-top:24px;">
          ${inputs}
          <button type="submit" style="width:100%;border:none;border-radius:999px;background:#b72020;color:#fff;padding:14px 20px;font-size:15px;font-weight:700;cursor:pointer;">立即前往付款</button>
        </form>
      </div>
      <script>document.getElementById("ecpay-form").submit();</script>
    </body>
  </html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return new Response("缺少 orderId。", { status: 400 });
  }

  return buildPaymentPage(orderId, request.nextUrl.origin);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { orderId?: string };
  if (!body.orderId) {
    return new Response("缺少 orderId。", { status: 400 });
  }

  return buildPaymentPage(body.orderId, request.nextUrl.origin);
}