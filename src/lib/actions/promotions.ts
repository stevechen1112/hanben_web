"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Result = { success: true } | { error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role === "CUSTOMER") {
    throw new Error("未授權");
  }
}

export async function savePromotion(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const type = String(formData.get("type") || "AUTOMATIC");
  const code = String(formData.get("code") || "").trim();

  const data = {
    name: String(formData.get("name") || "").trim(),
    type: type as "COUPON_CODE" | "AUTOMATIC" | "BUY_X_GET_Y",
    code: code || null,
    discountType: String(formData.get("discountType") || "FIXED_AMOUNT") as
      | "PERCENTAGE"
      | "FIXED_AMOUNT"
      | "FREE_SHIPPING",
    discountValue: Number(formData.get("discountValue") || 0),
    minOrderAmount: Number(formData.get("minOrderAmount") || 0) || null,
    maxUses: Number(formData.get("maxUses") || 0) || null,
    startAt: new Date(String(formData.get("startAt") || new Date().toISOString())),
    endAt: String(formData.get("endAt") || "").trim()
      ? new Date(String(formData.get("endAt")))
      : null,
    isActive: String(formData.get("isActive") || "") === "on",
  };

  if (!data.name) throw new Error("請輸入促銷名稱。");

  if (id) {
    await db.promotion.update({ where: { id }, data });
  } else {
    await db.promotion.create({ data });
  }

  revalidatePath("/admin/promotions");
}

export async function deletePromotion(id: string): Promise<void> {
  await requireAdmin();
  await db.promotion.delete({ where: { id } });
  revalidatePath("/admin/promotions");
}