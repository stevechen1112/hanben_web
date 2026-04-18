import { z } from "zod";
import type { CartSnapshot } from "@/lib/cart";
import type { ShippingOption } from "@/lib/shipping";

export const paymentMethodOptions = [
  {
    value: "credit_card",
    label: "信用卡",
    description: "使用綠界信用卡付款，完成後立即返回結果頁。",
  },
  {
    value: "atm",
    label: "ATM 虛擬帳號",
    description: "取得虛擬帳號後於期限內完成轉帳。",
  },
  {
    value: "cvs_code",
    label: "超商代碼",
    description: "取得超商繳費代碼後至門市機台列印繳款。",
  },
] as const;

export type PaymentMethod = (typeof paymentMethodOptions)[number]["value"];

export const checkoutFormSchema = z
  .object({
    email: z.email("請輸入正確 Email"),
    phone: z.string().trim().min(8, "請輸入聯絡電話"),
    shippingName: z.string().trim().min(2, "請輸入收件人姓名"),
    shippingPhone: z.string().trim().min(8, "請輸入收件人電話"),
    shippingMethod: z.string().trim().min(1, "請選擇送貨方式"),
    paymentMethod: z.enum(["credit_card", "atm", "cvs_code"], {
      message: "請選擇付款方式",
    }),
    shippingZip: z.string().trim(),
    shippingCity: z.string().trim(),
    shippingDistrict: z.string().trim(),
    shippingAddress: z.string().trim(),
    cvsStoreId: z.string().trim(),
    cvsStoreName: z.string().trim(),
    cvsStoreAddress: z.string().trim(),
    promoCode: z.string().trim(),
    note: z.string().trim().max(500, "備註最多 500 字"),
  })
  .superRefine((value, ctx) => {
    if (value.shippingMethod.startsWith("home_")) {
      if (!value.shippingZip) {
        ctx.addIssue({
          path: ["shippingZip"],
          code: z.ZodIssueCode.custom,
          message: "請輸入郵遞區號",
        });
      }
      if (!value.shippingCity) {
        ctx.addIssue({
          path: ["shippingCity"],
          code: z.ZodIssueCode.custom,
          message: "請輸入縣市",
        });
      }
      if (!value.shippingDistrict) {
        ctx.addIssue({
          path: ["shippingDistrict"],
          code: z.ZodIssueCode.custom,
          message: "請輸入鄉鎮市區",
        });
      }
      if (!value.shippingAddress) {
        ctx.addIssue({
          path: ["shippingAddress"],
          code: z.ZodIssueCode.custom,
          message: "請輸入詳細地址",
        });
      }
    }

    if (value.shippingMethod.startsWith("cvs_")) {
      if (!value.cvsStoreId) {
        ctx.addIssue({
          path: ["cvsStoreId"],
          code: z.ZodIssueCode.custom,
          message: "請先選擇超商門市",
        });
      }
      if (!value.cvsStoreName) {
        ctx.addIssue({
          path: ["cvsStoreName"],
          code: z.ZodIssueCode.custom,
          message: "請先選擇超商門市",
        });
      }
      if (!value.cvsStoreAddress) {
        ctx.addIssue({
          path: ["cvsStoreAddress"],
          code: z.ZodIssueCode.custom,
          message: "請先選擇超商門市",
        });
      }
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export type CheckoutPageProps = {
  initialCart: CartSnapshot;
  shippingOptions: ShippingOption[];
};

export const checkoutStepFields = {
  1: ["email", "phone"],
  2: ["shippingName", "shippingPhone"],
  3: [
    "shippingMethod",
    "shippingZip",
    "shippingCity",
    "shippingDistrict",
    "shippingAddress",
    "cvsStoreId",
    "cvsStoreName",
    "cvsStoreAddress",
  ],
  4: ["paymentMethod"],
} as const;

export function computeCheckoutSummary(
  cart: CartSnapshot,
  shippingOption: ShippingOption | null,
  discountAmount = 0,
  freeShipping = false,
) {
  const subtotal = cart.subtotal;
  const shippingFee = shippingOption
    ? freeShipping || (shippingOption.freeShippingMin != null && subtotal >= shippingOption.freeShippingMin)
      ? 0
      : shippingOption.baseFee
    : 0;

  return {
    subtotal,
    discountAmount,
    shippingFee,
    total: Math.max(subtotal - discountAmount, 0) + shippingFee,
  };
}