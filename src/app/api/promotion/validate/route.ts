import { NextResponse } from "next/server";
import { assertTrustedOrigin } from "@/lib/csrf";
import { getCartSnapshot } from "@/lib/cart-server";
import { evaluatePromotions } from "@/lib/promotions";
import { getRequestIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request, new URL(request.url).origin);

    const ip = getRequestIp(request);
    const limit = rateLimit(`promo:${ip}`, { limit: 20, windowMs: 60_000 });
    if (!limit.success) {
      return NextResponse.json({ message: "驗證過於頻繁" }, { status: 429 });
    }

    const { promoCode } = (await request.json()) as { promoCode?: string };
    const { cart } = await getCartSnapshot();
    const result = await evaluatePromotions({
      subtotal: cart.subtotal,
      promoCode,
      items: cart.items.map((item) => ({ quantity: item.quantity, price: item.price })),
    });

    if (promoCode && !result.codePromotion) {
      return NextResponse.json({ message: "折扣碼無效、已過期或不符合門檻。" }, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "折扣碼驗證失敗" },
      { status: 500 },
    );
  }
}