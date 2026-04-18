"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type ActionResult =
  | { success: true; id: string }
  | { error: string };

// ── Schema ─────────────────────────────────────────────────
const collectionSchema = z.object({
  title: z.string().min(1, "名稱為必填"),
  slug: z
    .string()
    .min(1, "Slug 為必填")
    .regex(/^[a-z0-9-]+$/, "Slug 只能包含小寫英文、數字、連字符"),
  description: z.string().optional(),
  imageUrl: z.string().url("圖片 URL 格式錯誤").optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.preprocess((v) => v === "true" || v === true, z.boolean()),
});

// ── 建立集合 ───────────────────────────────────────────────
export async function createCollection(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = collectionSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "驗證失敗" };
  }

  const data = parsed.data;

  const existing = await db.collection.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: `Slug "${data.slug}" 已被使用` };

  const collection = await db.collection.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/collections");
  redirect(`/admin/collections/${collection.id}`);
}

// ── 更新集合 ───────────────────────────────────────────────
export async function updateCollection(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = collectionSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "驗證失敗" };
  }

  const data = parsed.data;

  // 解析商品關聯 JSON：[{ productId, sortOrder }]
  let productsRaw: { productId: string; sortOrder: number }[] = [];
  try {
    const productsStr = formData.get("products") as string;
    if (productsStr) productsRaw = JSON.parse(productsStr);
  } catch {
    // 忽略解析錯誤
  }

  const existing = await db.collection.findFirst({
    where: { slug: data.slug, NOT: { id } },
  });
  if (existing) return { error: `Slug "${data.slug}" 已被使用` };

  await db.$transaction([
    db.collection.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    }),
    // 同步商品關聯：刪除全部後重建
    db.collectionProduct.deleteMany({ where: { collectionId: id } }),
    ...productsRaw.map((p) =>
      db.collectionProduct.create({
        data: {
          collectionId: id,
          productId: p.productId,
          sortOrder: p.sortOrder,
        },
      })
    ),
  ]);

  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${id}`);
  return { success: true, id };
}

// ── 刪除集合 ───────────────────────────────────────────────
export async function deleteCollection(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role === "EDITOR")
    return { error: "權限不足" };

  await db.collection.delete({ where: { id } });
  revalidatePath("/admin/collections");
  redirect("/admin/collections");
}
