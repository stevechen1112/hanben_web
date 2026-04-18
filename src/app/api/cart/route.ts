import { NextResponse } from "next/server";
import { z } from "zod";
import { CART_SESSION_COOKIE, type CartSyncItem } from "@/lib/cart";
import { assertTrustedOrigin } from "@/lib/csrf";
import {
  addCartItem,
  clearCart,
  getCartSnapshot,
  isCartError,
  removeCartItem,
  replaceCartItems,
  updateCartItemQuantity,
} from "@/lib/cart-server";
import { getRequestIp, rateLimit } from "@/lib/rate-limit";

const cartActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("add"),
    variantId: z.string().min(1),
    quantity: z.number().int().positive().default(1),
  }),
  z.object({
    action: z.literal("update"),
    cartItemId: z.string().min(1),
    quantity: z.number().int(),
  }),
  z.object({
    action: z.literal("remove"),
    cartItemId: z.string().min(1),
  }),
  z.object({
    action: z.literal("clear"),
  }),
  z.object({
    action: z.literal("replace"),
    items: z.array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    ),
  }),
]);

function applySessionCookie(response: NextResponse, sessionIdToSet: string | null) {
  if (!sessionIdToSet) {
    return response;
  }

  response.cookies.set({
    name: CART_SESSION_COOKIE,
    value: sessionIdToSet,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET() {
  try {
    const result = await getCartSnapshot();
    const response = applySessionCookie(NextResponse.json(result.cart), result.sessionIdToSet);
    response.headers.set("Cache-Control", "private, max-age=0, must-revalidate");
    return response;
  } catch (error) {
    console.error("GET /api/cart failed", error);
    return NextResponse.json({ message: "讀取購物車失敗。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request, new URL(request.url).origin);
    const ip = getRequestIp(request);
    const limit = rateLimit(`cart:${ip}`, { limit: 30, windowMs: 60_000 });
    if (!limit.success) {
      return NextResponse.json({ message: "購物車更新過於頻繁。" }, { status: 429 });
    }

    const payload = cartActionSchema.parse(await request.json());

    let result:
      | Awaited<ReturnType<typeof addCartItem>>
      | Awaited<ReturnType<typeof updateCartItemQuantity>>
      | Awaited<ReturnType<typeof removeCartItem>>
      | Awaited<ReturnType<typeof clearCart>>
      | Awaited<ReturnType<typeof replaceCartItems>>;

    switch (payload.action) {
      case "add":
        result = await addCartItem(payload.variantId, payload.quantity);
        break;
      case "update":
        result = await updateCartItemQuantity(payload.cartItemId, payload.quantity);
        break;
      case "remove":
        result = await removeCartItem(payload.cartItemId);
        break;
      case "clear":
        result = await clearCart();
        break;
      case "replace":
        result = await replaceCartItems(payload.items as CartSyncItem[]);
        break;
      default:
        result = await getCartSnapshot();
        break;
    }

    return applySessionCookie(NextResponse.json(result.cart), result.sessionIdToSet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "購物車請求格式錯誤。", issues: error.flatten() },
        { status: 422 },
      );
    }

    if (isCartError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error("POST /api/cart failed", error);
    return NextResponse.json({ message: "購物車更新失敗。" }, { status: 500 });
  }
}