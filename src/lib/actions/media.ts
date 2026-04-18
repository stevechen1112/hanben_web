"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type ActionResult = { success: true } | { error: string };

// ── 更新 altText ───────────────────────────────────────────
export async function updateMediaAlt(
  id: string,
  altText: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = z.string().max(255).safeParse(altText);
  if (!parsed.success) return { error: "描述文字過長" };

  await db.mediaFile.update({
    where: { id },
    data: { altText: parsed.data || null },
  });

  revalidatePath("/admin/media");
  return { success: true };
}

// ── 刪除單筆媒體 ───────────────────────────────────────────
export async function deleteMedia(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role === "EDITOR")
    return { error: "權限不足" };

  await db.mediaFile.delete({ where: { id } });
  revalidatePath("/admin/media");
  return { success: true };
}

// ── 批次刪除 ───────────────────────────────────────────────
export async function deleteMediaBatch(ids: string[]): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role === "EDITOR")
    return { error: "權限不足" };

  if (ids.length === 0) return { error: "請至少選擇一個檔案" };

  await db.mediaFile.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin/media");
  return { success: true };
}
