import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { checkoutFormSchema } from "@/lib/checkout";
import { getCurrentCartRecord, isCartError } from "@/lib/cart-server";
import { assertTrustedOrigin } from "@/lib/csrf";
import { db } from "@/lib/db";
import { getOrderEmailPayload, sendOrderConfirmation } from "@/lib/email";
import { evaluatePromotions } from "@/lib/promotions";
import { getRequestIp, rateLimit } from "@/lib/rate-limit";
import { calculateShippingFee, getShippingOptionByMethod } from "@/lib/shipping";

function decimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

async function generateOrderNumber(tx: Prisma.TransactionClient) {
  const date = new Date();
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  const prefix = `HB-${y}${m}${d}`;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = `${Math.floor(Math.random() * 10000)}`.padStart(4, "0");
    const orderNumber = `${prefix}-${suffix}`;
    const existing = await tx.order.findUnique({ where: { orderNumber } });
    if (!existing) {
      return orderNumber;
    }
  }

  throw new Error("產生訂單編號失敗，請稍後再試。");
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request, new URL(request.url).origin);

    const ip = getRequestIp(request);
    const limit = rateLimit(`checkout:${ip}`, { limit: 10, windowMs: 60_000 });
    if (!limit.success) {
      return NextResponse.json({ message: "建立訂單過於頻繁，請稍後再試。" }, { status: 429 });
    }

    const payload = checkoutFormSchema.parse(await request.json());
    const { cart, context } = await getCurrentCartRecord(false);

    if (!cart || cart.items.length === 0 || !context.cartId) {
      return NextResponse.json({ message: "購物車內沒有商品。" }, { status: 400 });
    }

    const shippingOption = await getShippingOptionByMethod(payload.shippingMethod);
    if (!shippingOption) {
      return NextResponse.json({ message: "送貨方式不存在或已停用。" }, { status: 422 });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0,
    );
    const promotions = await evaluatePromotions({
      subtotal,
      promoCode: payload.promoCode,
      items: cart.items.map((item) => ({ quantity: item.quantity, price: Number(item.variant.price) })),
    });
    const shippingFee = promotions.freeShipping ? 0 : calculateShippingFee(subtotal, shippingOption);

    const order = await db.$transaction(async (tx) => {
      const liveCart = await tx.cart.findUnique({
        where: { id: context.cartId! },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      title: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!liveCart || liveCart.items.length === 0) {
        throw new Error("購物車已變更，請重新整理後再試。");
      }

      for (const item of liveCart.items) {
        if (!item.variant.isActive || item.variant.productId == null) {
          throw new Error(`商品 ${item.variant.title} 已下架，請先移除。`);
        }

        if (item.variant.trackInventory && item.variant.inventory < item.quantity) {
          throw new Error(`商品 ${item.variant.product.title} 庫存不足，請調整數量。`);
        }
      }

      for (const item of liveCart.items) {
        if (item.variant.trackInventory) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: {
              inventory: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      const orderNumber = await generateOrderNumber(tx);
      const orderSubtotal = liveCart.items.reduce(
        (sum, item) => sum + Number(item.variant.price) * item.quantity,
        0,
      );
      const total = Math.max(orderSubtotal - promotions.discountAmount, 0) + shippingFee;

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: context.customerId,
          email: payload.email,
          phone: payload.phone,
          status: "PENDING",
          paymentStatus: "UNPAID",
          shippingStatus: "UNFULFILLED",
          subtotal: decimal(orderSubtotal),
          shippingFee: decimal(shippingFee),
          discountAmount: decimal(promotions.discountAmount),
          total: decimal(total),
          note: payload.note || null,
          shippingName: payload.shippingName,
          shippingPhone: payload.shippingPhone,
          shippingZip: payload.shippingMethod.startsWith("cvs_") ? "000" : payload.shippingZip,
          shippingCity: payload.shippingMethod.startsWith("cvs_") ? "超商取貨" : payload.shippingCity,
          shippingDistrict: payload.shippingMethod.startsWith("cvs_") ? payload.cvsStoreName : payload.shippingDistrict,
          shippingAddress: payload.shippingMethod.startsWith("cvs_")
            ? payload.cvsStoreAddress
            : payload.shippingAddress,
          paymentMethod: payload.paymentMethod,
          shippingMethod: payload.shippingMethod,
          logisticsId: null,
          cvsStoreId: payload.cvsStoreId || null,
          cvsStoreName: payload.cvsStoreName || null,
          cvsStoreAddress: payload.cvsStoreAddress || null,
          items: {
            create: liveCart.items.map((item) => ({
              variantId: item.variantId,
              productTitle: item.variant.product.title,
              variantTitle: item.variant.title,
              sku: item.variant.sku,
              quantity: item.quantity,
              unitPrice: decimal(Number(item.variant.price)),
              total: decimal(Number(item.variant.price) * item.quantity),
            })),
          },
        },
        select: {
          id: true,
          orderNumber: true,
          paymentMethod: true,
          paymentStatus: true,
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: liveCart.id } });

      return createdOrder;
    });

    try {
      const emailOrder = await getOrderEmailPayload(order.id);
      if (emailOrder) {
        await sendOrderConfirmation(emailOrder);
      }
    } catch (error) {
      console.error("Failed to send order confirmation email", error);
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "結帳資料格式錯誤。", issues: error.flatten() },
        { status: 422 },
      );
    }

    if (isCartError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error("POST /api/checkout failed", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "建立訂單失敗。" },
      { status: 500 },
    );
  }
}