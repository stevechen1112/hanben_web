import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CART_SESSION_COOKIE,
  createEmptyCartSnapshot,
  type CartSnapshot,
  type CartSyncItem,
} from "@/lib/cart";
import type { Prisma } from "@/generated/prisma/client";

class CartError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "CartError";
    this.statusCode = statusCode;
  }
}

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      variant: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

type CartContext = {
  cartId: string | null;
  customerId: string | null;
  sessionIdToSet: string | null;
};

type VariantRecord = {
  id: string;
  inventory: number;
  trackInventory: boolean;
};

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  return value == null ? 0 : Number(value);
}

function clampQuantity(quantity: number, variant: VariantRecord) {
  if (!variant.trackInventory) {
    return Math.max(1, quantity);
  }

  return Math.max(1, Math.min(quantity, variant.inventory));
}

function serializeCart(cart: CartWithItems | null): CartSnapshot {
  if (!cart) {
    return createEmptyCartSnapshot();
  }

  const items = cart.items.map((item) => {
    const price = toNumber(item.variant.price);
    const compareAtPrice = item.variant.compareAtPrice
      ? toNumber(item.variant.compareAtPrice)
      : null;
    const subtotal = price * item.quantity;

    return {
      cartItemId: item.id,
      productId: item.variant.productId,
      productSlug: item.variant.product.slug,
      productTitle: item.variant.product.title,
      variantId: item.variantId,
      variantTitle: item.variant.title,
      sku: item.variant.sku,
      imageUrl: item.variant.product.images[0]?.url ?? null,
      price,
      compareAtPrice,
      quantity: item.quantity,
      subtotal,
      availableQuantity: item.variant.trackInventory ? item.variant.inventory : null,
      trackInventory: item.variant.trackInventory,
    };
  });

  return {
    id: cart.id,
    customerId: cart.customerId,
    items,
    itemCount: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
    updatedAt: cart.updatedAt.toISOString(),
  };
}

async function getCurrentCustomerId() {
  const session = await auth();
  if (session?.user?.role === "CUSTOMER") {
    return session.user.id;
  }

  return null;
}

async function mergeGuestCartIntoCustomerCart(guestCartId: string, customerId: string) {
  return db.$transaction(async (tx) => {
    const guestCart = await tx.cart.findUnique({
      where: { id: guestCartId },
      include: { items: true },
    });

    if (!guestCart) {
      return null;
    }

    const existingCustomerCart = await tx.cart.findFirst({
      where: { customerId },
      orderBy: { updatedAt: "desc" },
      include: { items: true },
    });

    if (!existingCustomerCart) {
      return tx.cart.update({
        where: { id: guestCart.id },
        data: {
          customerId,
          sessionId: null,
        },
      });
    }

    for (const item of guestCart.items) {
      const variant = await tx.variant.findFirst({
        where: {
          id: item.variantId,
          isActive: true,
          product: { status: "ACTIVE" },
        },
        select: {
          id: true,
          inventory: true,
          trackInventory: true,
        },
      });

      if (!variant) {
        continue;
      }

      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: existingCustomerCart.id,
            variantId: item.variantId,
          },
        },
      });

      const nextQuantity = clampQuantity(
        (existingItem?.quantity ?? 0) + item.quantity,
        variant,
      );

      await tx.cartItem.upsert({
        where: {
          cartId_variantId: {
            cartId: existingCustomerCart.id,
            variantId: item.variantId,
          },
        },
        create: {
          cartId: existingCustomerCart.id,
          variantId: item.variantId,
          quantity: nextQuantity,
        },
        update: {
          quantity: nextQuantity,
        },
      });
    }

    await tx.cart.delete({ where: { id: guestCart.id } });

    return existingCustomerCart;
  });
}

async function resolveCartContext(createIfMissing = true): Promise<CartContext> {
  const customerId = await getCurrentCustomerId();
  const cookieStore = await cookies();
  const sessionCartId = cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;

  if (customerId) {
    let cart = await db.cart.findFirst({
      where: { customerId },
      orderBy: { updatedAt: "desc" },
    });

    if (sessionCartId) {
      const guestCart = await db.cart.findUnique({ where: { sessionId: sessionCartId } });
      if (guestCart) {
        cart = await mergeGuestCartIntoCustomerCart(guestCart.id, customerId);
      }
    }

    if (!cart && createIfMissing) {
      cart = await db.cart.create({
        data: { customerId },
      });
    }

    return {
      cartId: cart?.id ?? null,
      customerId,
      sessionIdToSet: null,
    };
  }

  let nextSessionId = sessionCartId;
  let sessionIdToSet: string | null = null;

  if (!nextSessionId && createIfMissing) {
    nextSessionId = randomUUID();
    sessionIdToSet = nextSessionId;
  }

  let cart = nextSessionId
    ? await db.cart.findUnique({ where: { sessionId: nextSessionId } })
    : null;

  if (!cart && nextSessionId && createIfMissing) {
    cart = await db.cart.create({
      data: { sessionId: nextSessionId },
    });
  }

  return {
    cartId: cart?.id ?? null,
    customerId: null,
    sessionIdToSet,
  };
}

async function getHydratedCart(cartId: string | null) {
  if (!cartId) {
    return null;
  }

  return db.cart.findUnique({
    where: { id: cartId },
    include: cartInclude,
  });
}

export async function getCartSnapshot() {
  const context = await resolveCartContext(true);
  const cart = await getHydratedCart(context.cartId);
  return {
    cart: serializeCart(cart),
    sessionIdToSet: context.sessionIdToSet,
  };
}

export async function getCurrentCartRecord(createIfMissing = false) {
  const context = await resolveCartContext(createIfMissing);
  const cart = await getHydratedCart(context.cartId);

  return {
    context,
    cart,
  };
}

export async function addCartItem(variantId: string, quantity: number) {
  if (quantity < 1) {
    throw new CartError("加入購物車的數量必須大於 0。", 422);
  }

  const context = await resolveCartContext(true);
  if (!context.cartId) {
    throw new CartError("購物車建立失敗，請稍後再試。", 500);
  }

  const cartId = context.cartId;

  await db.$transaction(async (tx) => {
    const variant = await tx.variant.findFirst({
      where: {
        id: variantId,
        isActive: true,
        product: { status: "ACTIVE" },
      },
      select: {
        id: true,
        inventory: true,
        trackInventory: true,
      },
    });

    if (!variant) {
      throw new CartError("商品規格不存在或已下架。", 404);
    }

    if (variant.trackInventory && variant.inventory < 1) {
      throw new CartError("此商品目前已售完。", 409);
    }

    const existingItem = await tx.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
    });

    const nextQuantity = clampQuantity((existingItem?.quantity ?? 0) + quantity, variant);

    if (variant.trackInventory && nextQuantity > variant.inventory) {
      throw new CartError("庫存不足，請調整購買數量。", 409);
    }

    await tx.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
      create: {
        cartId,
        variantId,
        quantity: nextQuantity,
      },
      update: {
        quantity: nextQuantity,
      },
    });
  });

  const cart = await getHydratedCart(cartId);
  return {
    cart: serializeCart(cart),
    sessionIdToSet: context.sessionIdToSet,
  };
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const context = await resolveCartContext(true);
  if (!context.cartId) {
    throw new CartError("找不到購物車。", 404);
  }

  const cartId = context.cartId;

  await db.$transaction(async (tx) => {
    const cartItem = await tx.cartItem.findFirst({
      where: {
        id: cartItemId,
        cartId,
      },
    });

    if (!cartItem) {
      throw new CartError("購物車項目不存在。", 404);
    }

    if (quantity <= 0) {
      await tx.cartItem.delete({ where: { id: cartItem.id } });
      return;
    }

    const variant = await tx.variant.findFirst({
      where: {
        id: cartItem.variantId,
        isActive: true,
        product: { status: "ACTIVE" },
      },
      select: {
        id: true,
        inventory: true,
        trackInventory: true,
      },
    });

    if (!variant) {
      throw new CartError("商品規格不存在或已下架。", 404);
    }

    const nextQuantity = clampQuantity(quantity, variant);

    if (variant.trackInventory && nextQuantity > variant.inventory) {
      throw new CartError("庫存不足，請調整購買數量。", 409);
    }

    await tx.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: nextQuantity },
    });
  });

  const cart = await getHydratedCart(cartId);
  return {
    cart: serializeCart(cart),
    sessionIdToSet: context.sessionIdToSet,
  };
}

export async function removeCartItem(cartItemId: string) {
  const context = await resolveCartContext(true);
  if (!context.cartId) {
    throw new CartError("找不到購物車。", 404);
  }

  const cartId = context.cartId;

  await db.cartItem.deleteMany({
    where: {
      id: cartItemId,
      cartId,
    },
  });

  const cart = await getHydratedCart(cartId);
  return {
    cart: serializeCart(cart),
    sessionIdToSet: context.sessionIdToSet,
  };
}

export async function clearCart() {
  const context = await resolveCartContext(true);
  if (!context.cartId) {
    return {
      cart: createEmptyCartSnapshot(),
      sessionIdToSet: context.sessionIdToSet,
    };
  }

  const cartId = context.cartId;

  await db.cartItem.deleteMany({
    where: { cartId },
  });

  const cart = await getHydratedCart(cartId);
  return {
    cart: serializeCart(cart),
    sessionIdToSet: context.sessionIdToSet,
  };
}

export async function replaceCartItems(items: CartSyncItem[]) {
  const context = await resolveCartContext(true);
  if (!context.cartId) {
    throw new CartError("找不到購物車。", 404);
  }

  const cartId = context.cartId;

  const normalized = Array.from(
    items
      .filter((item) => item.quantity > 0)
      .reduce((map, item) => {
        map.set(item.variantId, (map.get(item.variantId) ?? 0) + item.quantity);
        return map;
      }, new Map<string, number>()),
  ).map(([variantId, quantity]) => ({ variantId, quantity }));

  await db.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { cartId } });

    if (normalized.length === 0) {
      return;
    }

    const variants = await tx.variant.findMany({
      where: {
        id: { in: normalized.map((item) => item.variantId) },
        isActive: true,
        product: { status: "ACTIVE" },
      },
      select: {
        id: true,
        inventory: true,
        trackInventory: true,
      },
    });

    const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
    const createData = normalized
      .map((item) => {
        const variant = variantMap.get(item.variantId);
        if (!variant) {
          return null;
        }

        const quantity = clampQuantity(item.quantity, variant);
        if (variant.trackInventory && variant.inventory < 1) {
          return null;
        }

        return {
          cartId,
          variantId: item.variantId,
          quantity,
        };
      })
      .filter((item): item is { cartId: string; variantId: string; quantity: number } => Boolean(item));

    if (createData.length > 0) {
      await tx.cartItem.createMany({ data: createData });
    }
  });

  const cart = await getHydratedCart(cartId);
  return {
    cart: serializeCart(cart),
    sessionIdToSet: context.sessionIdToSet,
  };
}

export function isCartError(error: unknown): error is CartError {
  return error instanceof CartError;
}