"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type ActionResult = { success: true } | { error: string };

// ── 更新 HomepageSection ─────────────────────────────────
export async function updateHomepageSection(
  id: string,
  data: {
    title?: string;
    subtitle?: string;
    content: Record<string, unknown>;
    isActive: boolean;
    sortOrder: number;
  },
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.homepageSection.update({
    where: { id },
    data: {
      title: data.title ?? null,
      subtitle: data.subtitle ?? null,
      content: data.content as object,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
  });

  revalidatePath("/admin/site-settings/homepage");
  revalidatePath("/");
  return { success: true };
}

// ── 批次更新排序 ─────────────────────────────────────────
export async function reorderHomepageSections(
  items: { id: string; sortOrder: number }[],
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.$transaction(
    items.map((item) =>
      db.homepageSection.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );

  revalidatePath("/admin/site-settings/homepage");
  revalidatePath("/");
  return { success: true };
}

// ── HeroSlide CRUD ───────────────────────────────────────
const slideSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  imageDesktop: z.string().min(1, "桌機圖片網址為必填"),
  imageMobile: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.preprocess((v) => v === "true" || v === true, z.boolean()),
});

export async function createHeroSlide(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = slideSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    imageDesktop: formData.get("imageDesktop"),
    imageMobile: formData.get("imageMobile"),
    ctaText: formData.get("ctaText"),
    ctaLink: formData.get("ctaLink"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "驗證失敗" };

  await db.heroSlide.create({ data: parsed.data });
  revalidatePath("/admin/site-settings/homepage");
  revalidatePath("/");
  return { success: true };
}

export async function updateHeroSlide(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = slideSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    imageDesktop: formData.get("imageDesktop"),
    imageMobile: formData.get("imageMobile"),
    ctaText: formData.get("ctaText"),
    ctaLink: formData.get("ctaLink"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "驗證失敗" };

  await db.heroSlide.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/site-settings/homepage");
  revalidatePath("/");
  return { success: true };
}

export async function deleteHeroSlide(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.heroSlide.delete({ where: { id } });
  revalidatePath("/admin/site-settings/homepage");
  revalidatePath("/");
  return {};
}

export async function reorderHeroSlides(
  items: { id: string; sortOrder: number }[],
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.$transaction(
    items.map((item) =>
      db.heroSlide.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );

  revalidatePath("/admin/site-settings/homepage");
  revalidatePath("/");
  return { success: true };
}
