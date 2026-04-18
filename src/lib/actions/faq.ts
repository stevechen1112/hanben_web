"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type ActionResult = { success: true; id: string } | { error: string };

const faqSchema = z.object({
  question: z.string().min(1, "問題為必填"),
  answer: z.string().min(1, "答案為必填"),
  category: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.preprocess((v) => v === "true" || v === true, z.boolean()),
});

// ── 建立 FAQ ──────────────────────────────────────────────
export async function createFaq(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: formData.get("category"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "驗證失敗" };
  }

  const item = await db.faqItem.create({
    data: {
      question: parsed.data.question,
      answer: parsed.data.answer,
      category: parsed.data.category || null,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/admin/content/faq");
  redirect(`/admin/content/faq/${item.id}`);
}

// ── 更新 FAQ ──────────────────────────────────────────────
export async function updateFaq(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: formData.get("category"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "驗證失敗" };
  }

  await db.faqItem.update({
    where: { id },
    data: {
      question: parsed.data.question,
      answer: parsed.data.answer,
      category: parsed.data.category || null,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/admin/content/faq");
  return { success: true, id };
}

// ── 刪除 FAQ ──────────────────────────────────────────────
export async function deleteFaq(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role === "EDITOR")
    return { error: "權限不足" };

  await db.faqItem.delete({ where: { id } });
  revalidatePath("/admin/content/faq");
  redirect("/admin/content/faq");
}

// ── 批次更新排序 ───────────────────────────────────────────
export async function reorderFaq(
  items: { id: string; sortOrder: number }[],
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.$transaction(
    items.map((item) =>
      db.faqItem.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );

  revalidatePath("/admin/content/faq");
  return {};
}

// ── 切換啟用狀態 ───────────────────────────────────────────
export async function toggleFaqActive(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.faqItem.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/content/faq");
  return {};
}
