import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { buildPrintTradeDocumentParams } from "@/lib/ecpay-logistics";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default async function OrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    select: { logisticsId: true, orderNumber: true },
  });

  if (!order) notFound();
  if (!order.logisticsId) {
    return (
      <div className="grid min-h-screen place-items-center bg-stone-50 p-6 text-center text-sm text-stone-500">
        此訂單尚未建立物流單，無法列印出貨標籤。
      </div>
    );
  }

  const print = buildPrintTradeDocumentParams(order.logisticsId);
  const inputs = Object.entries(print.fields)
    .map(
      ([key, value]) =>
        `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(String(value))}" />`,
    )
    .join("\n");

  const html = `<!doctype html>
  <html lang="zh-Hant">
    <head><meta charset="utf-8" /><title>列印 ${escapeHtml(order.orderNumber)}</title></head>
    <body>
      <form id="print-form" method="post" action="${escapeHtml(print.action)}">${inputs}</form>
      <script>document.getElementById("print-form").submit();</script>
    </body>
  </html>`;

  return <iframe title="列印出貨標籤" srcDoc={html} className="h-screen w-full border-0" />;
}