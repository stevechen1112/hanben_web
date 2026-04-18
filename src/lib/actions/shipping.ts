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

export async function saveShippingRule(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const data = {
    name: String(formData.get("name") || "").trim(),
    shippingMethod: String(formData.get("shippingMethod") || "").trim(),
    logisticsType: String(formData.get("logisticsType") || "").trim(),
    logisticsSubType: String(formData.get("logisticsSubType") || "").trim(),
    temperature: String(formData.get("temperature") || "").trim() || null,
    baseFee: Number(formData.get("baseFee") || 0),
    freeShippingMin: Number(formData.get("freeShippingMin") || 0) || null,
    codFee: Number(formData.get("codFee") || 0) || null,
    isActive: String(formData.get("isActive") || "") === "on",
    sortOrder: Number(formData.get("sortOrder") || 0),
  };

  if (!data.name || !data.shippingMethod || !data.logisticsType || !data.logisticsSubType) {
    throw new Error("請完整填寫運費規則資料。");
  }

  if (id) {
    await db.shippingRule.update({ where: { id }, data });
  } else {
    await db.shippingRule.create({ data });
  }

  revalidatePath("/admin/shipping");
}

export async function deleteShippingRule(id: string): Promise<void> {
  await requireAdmin();
  await db.shippingRule.delete({ where: { id } });
  revalidatePath("/admin/shipping");
}