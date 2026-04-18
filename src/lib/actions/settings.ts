"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateSiteSettings(
  _prev: { error: string } | { success: true } | null,
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const entries = Array.from(formData.entries()) as [string, string][];

  await Promise.all(
    entries.map(([key, value]) =>
      db.siteSetting.updateMany({ where: { key }, data: { value } }),
    ),
  );

  revalidatePath("/admin/settings");
  return { success: true };
}
