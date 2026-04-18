"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type ActionResult = { success: true } | { error: string };

// ── 批次更新一組 SiteSetting keys ─────────────────────────
export async function updateSiteSettings(
  updates: {
    key: string;
    value: string;
    group?: string;
    label?: string;
    type?: string;
  }[],
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.$transaction(
    updates.map(({ key, value, group, label, type }) =>
      db.siteSetting.upsert({
        where: { key },
        update: { value },
        create: {
          key,
          value,
          type: type || "text",
          group: group || "general",
          label: label || key,
        },
      }),
    ),
  );

  revalidatePath("/admin/site-settings");
  revalidatePath("/");
  return { success: true };
}
