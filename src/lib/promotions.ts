import { db } from "@/lib/db";

type PromotionContext = {
  subtotal: number;
  items: Array<{ quantity: number; price: number }>;
  promoCode?: string | null;
};

export interface PromotionResult {
  codePromotion: {
    id: string;
    name: string;
    code: string | null;
    discountAmount: number;
    freeShipping: boolean;
  } | null;
  automaticPromotions: Array<{
    id: string;
    name: string;
    discountAmount: number;
    freeShipping: boolean;
  }>;
  discountAmount: number;
  freeShipping: boolean;
}

function inWindow(now: Date, startAt: Date, endAt: Date | null) {
  if (startAt > now) return false;
  if (endAt && endAt < now) return false;
  return true;
}

function calculatePromotionDiscount(
  promotion: {
    discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
    discountValue: unknown;
  },
  subtotal: number,
) {
  const value = Number(promotion.discountValue);
  switch (promotion.discountType) {
    case "PERCENTAGE":
      return Math.round(subtotal * (value / 100));
    case "FIXED_AMOUNT":
      return Math.min(Math.round(value), subtotal);
    case "FREE_SHIPPING":
      return 0;
  }
}

export async function evaluatePromotions(context: PromotionContext): Promise<PromotionResult> {
  const now = new Date();
  const promotions = await db.promotion.findMany({
    where: {
      isActive: true,
    },
  });

  const eligible = promotions.filter(
    (promotion) =>
      inWindow(now, promotion.startAt, promotion.endAt) &&
      Number(promotion.minOrderAmount ?? 0) <= context.subtotal &&
      (promotion.maxUses == null || promotion.usedCount < promotion.maxUses),
  );

  const codePromotion = context.promoCode
    ? eligible.find(
        (promotion) =>
          promotion.type === "COUPON_CODE" &&
          promotion.code?.toLowerCase() === context.promoCode?.trim().toLowerCase(),
      )
    : null;

  const automaticPromotions = eligible.filter(
    (promotion) => promotion.type === "AUTOMATIC" || promotion.type === "BUY_X_GET_Y",
  );

  const automaticResults = automaticPromotions.map((promotion) => {
    let discountAmount = calculatePromotionDiscount(promotion, context.subtotal);

    if (promotion.type === "BUY_X_GET_Y") {
      const totalQuantity = context.items.reduce((sum, item) => sum + item.quantity, 0);
      const cheapest = context.items.reduce((min, item) => Math.min(min, item.price), Infinity);
      discountAmount = totalQuantity >= 2 && Number.isFinite(cheapest) ? Math.round(cheapest) : 0;
    }

    return {
      id: promotion.id,
      name: promotion.name,
      discountAmount,
      freeShipping: promotion.discountType === "FREE_SHIPPING",
    };
  });

  const codeResult = codePromotion
    ? {
        id: codePromotion.id,
        name: codePromotion.name,
        code: codePromotion.code,
        discountAmount: calculatePromotionDiscount(codePromotion, context.subtotal),
        freeShipping: codePromotion.discountType === "FREE_SHIPPING",
      }
    : null;

  const discountAmount = automaticResults.reduce((sum, item) => sum + item.discountAmount, 0) + (codeResult?.discountAmount ?? 0);
  const freeShipping = automaticResults.some((item) => item.freeShipping) || Boolean(codeResult?.freeShipping);

  return {
    codePromotion: codeResult,
    automaticPromotions: automaticResults.filter((item) => item.discountAmount > 0 || item.freeShipping),
    discountAmount,
    freeShipping,
  };
}