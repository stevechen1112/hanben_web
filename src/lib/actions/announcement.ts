"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type ActionResult = { success: true; id: string } | { error: string };

const hexColorSchema = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "需為 #RRGGBB 格式");

const backgroundColorSchema = z
  .string()
  .trim()
  .refine((value) => /^#[0-9a-fA-F]{6}$/.test(value) || /^transparent$/i.test(value), "需為 #RRGGBB 或 transparent")
  .transform((value) => (value.toLowerCase() === "transparent" ? "transparent" : value));

const barSchema = z.object({
  text: z.string().min(1, "公告文字為必填"),
  link: z.string().optional(),
  bgColor: backgroundColorSchema.default("#C6974A"),
  textColor: hexColorSchema.default("#FFFFFF"),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.preprocess((v) => v === "true" || v === true, z.boolean()),
});

export async function createAnnouncement(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = barSchema.safeParse({
    text: formData.get("text"),
    link: formData.get("link"),
    bgColor: formData.get("bgColor"),
    textColor: formData.get("textColor"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "驗證失敗" };

  const item = await db.announcementBar.create({
    data: {
      text: parsed.data.text,
      link: parsed.data.link || null,
      bgColor: parsed.data.bgColor,
      textColor: parsed.data.textColor,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/admin/site-settings/announcement");
  revalidatePath("/");
  return { success: true, id: item.id };
}

export async function updateAnnouncement(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = barSchema.safeParse({
    text: formData.get("text"),
    link: formData.get("link"),
    bgColor: formData.get("bgColor"),
    textColor: formData.get("textColor"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "驗證失敗" };

  await db.announcementBar.update({
    where: { id },
    data: {
      text: parsed.data.text,
      link: parsed.data.link || null,
      bgColor: parsed.data.bgColor,
      textColor: parsed.data.textColor,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/admin/site-settings/announcement");
  revalidatePath("/");
  return { success: true, id };
}

export async function deleteAnnouncement(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.announcementBar.delete({ where: { id } });
  revalidatePath("/admin/site-settings/announcement");
  revalidatePath("/");
  return {};
}

export async function toggleAnnouncementActive(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.announcementBar.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/site-settings/announcement");
  revalidatePath("/");
  return {};
}

export async function reorderAnnouncements(
  items: { id: string; sortOrder: number }[],
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.$transaction(
    items.map((item) =>
      db.announcementBar.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );

  revalidatePath("/admin/site-settings/announcement");
  revalidatePath("/");
  return {};
}
