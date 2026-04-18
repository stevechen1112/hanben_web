"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type ActionResult = { success: true } | { error: string };

// ── 批次更新一組 SiteSetting keys ─────────────────────────
export async function updateSiteSettings(
  updates: { key: string; value: string }[],
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.$transaction(
    updates.map(({ key, value }) =>
      db.siteSetting.updateMany({
        where: { key },
        data: { value },
      }),
    ),
  );

  revalidatePath("/admin/site-settings");
  revalidatePath("/");
  return { success: true };
}
