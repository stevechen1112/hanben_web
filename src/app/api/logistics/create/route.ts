import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertTrustedOrigin } from "@/lib/csrf";
import { db } from "@/lib/db";
import { buildCreateShippingOrderParams } from "@/lib/ecpay-logistics";
import { getRequestIp, rateLimit } from "@/lib/rate-limit";

function parseEcpayResponse(raw: string) {
  return Object.fromEntries(new URLSearchParams(raw).entries());
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request, new URL(request.url).origin);

    const session = await auth();
    if (!session?.user || session.user.role === "CUSTOMER") {
      return NextResponse.json({ message: "未授權" }, { status: 401 });
    }

    const ip = getRequestIp(request);
    const limit = rateLimit(`logistics:${ip}`, { limit: 10, windowMs: 60_000 });
    if (!limit.success) {
      return NextResponse.json({ message: "建立物流訂單過於頻繁" }, { status: 429 });
    }

    const body = (await request.json()) as { orderId?: string; itemIds?: string[] };
    if (!body.orderId) {
      return NextResponse.json({ message: "缺少 orderId" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: body.orderId },
      include: { items: { select: { id: true } } },
    });

    if (!order) {
      return NextResponse.json({ message: "訂單不存在" }, { status: 404 });
    }

    const selectedCount = body.itemIds?.length ?? order.items.length;
    const shipment = buildCreateShippingOrderParams(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        email: order.email,
        shippingMethod: order.shippingMethod,
        shippingName: order.shippingName,
        shippingPhone: order.shippingPhone,
        shippingZip: order.shippingZip,
        shippingCity: order.shippingCity,
        shippingDistrict: order.shippingDistrict,
        shippingAddress: order.shippingAddress,
        cvsStoreId: order.cvsStoreId,
        total: Number(order.total),
      },
      new URL(request.url).origin,
    );

    const response = await fetch(shipment.action, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(
        Object.entries(shipment.fields).map(([key, value]) => [key, String(value)]),
      ).toString(),
    });

    const raw = await response.text();
    const payload = parseEcpayResponse(raw);
    if (!response.ok || payload.RtnCode === "0") {
      return NextResponse.json(
        { message: payload.RtnMsg || "建立物流訂單失敗" },
        { status: 400 },
      );
    }

    await db.order.update({
      where: { id: order.id },
      data: {
        logisticsId: payload.AllPayLogisticsID || payload.LogisticsID || order.logisticsId,
        trackingNumber:
          payload.CVSValidationNo || payload.BookingNote || payload.LogisticsType || null,
        shippingStatus:
          selectedCount < order.items.length ? "PARTIALLY_FULFILLED" : "FULFILLED",
        status: "SHIPPED",
        shippedAt: new Date(),
      },
    });

    return NextResponse.json({
      logisticsId: payload.AllPayLogisticsID || payload.LogisticsID || null,
      raw,
    });
  } catch (error) {
    console.error("POST /api/logistics/create failed", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "建立物流訂單失敗" },
      { status: 500 },
    );
  }
}