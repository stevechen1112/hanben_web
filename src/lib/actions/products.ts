"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption", "iframe", "h1", "h2"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "width", "height", "loading"],
    iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen"],
    "*": ["class"],
  },
  allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
};

// ── 驗證 schema ────────────────────────────────────────────
const variantSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "規格名稱必填"),
  sku: z.string().optional(),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  inventory: z.coerce.number().int().min(0),
  isActive: z.coerce.boolean().default(true),
});

const imageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  altText: z.string().default(""),
  sortOrder: z.number().int().min(0),
  dbId: z.string().optional(),
});

const productSchema = z.object({
  title: z.string().min(1, "商品名稱必填"),
  slug: z.string().min(1, "Slug 必填").regex(/^[a-z0-9-]+$/, "Slug 只能包含小寫字母、數字和連字符"),
  description: z.string().optional(),
  bodyHtml: z.string().optional(),
  vendor: z.string().optional(),
  productType: z.string().optional(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tags: z.string().optional(), // 逗號分隔字串
  variants: z.array(variantSchema).min(1, "至少需要一個規格"),
  images: z.array(imageSchema).default([]),
});

type ActionResult = { error: string } | { success: true; id: string };

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

// ── 建立商品 ───────────────────────────────────────────────
export async function createProduct(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  // 解析 variants JSON
  let variantsRaw: unknown;
  try {
    variantsRaw = JSON.parse(formData.get("variants") as string);
  } catch {
    return { error: "規格資料格式錯誤" };
  }

  // 解析 images JSON
  let imagesRaw: unknown = [];
  try {
    const imgStr = formData.get("images") as string;
    if (imgStr) imagesRaw = JSON.parse(imgStr);
  } catch {
    // 圖片解析失敗不阻止儲存
  }

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: getOptionalString(formData, "description"),
    bodyHtml: getOptionalString(formData, "bodyHtml"),
    vendor: getOptionalString(formData, "vendor"),
    productType: getOptionalString(formData, "productType"),
    status: formData.get("status"),
    seoTitle: getOptionalString(formData, "seoTitle"),
    seoDescription: getOptionalString(formData, "seoDescription"),
    tags: getOptionalString(formData, "tags"),
    variants: variantsRaw,
    images: imagesRaw,
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "驗證失敗" };
  }

  const data = parsed.data;
  const safeBodyHtml = data.bodyHtml ? sanitizeHtml(data.bodyHtml, SANITIZE_OPTIONS) : undefined;
  const tags = data.tags
    ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  // 確認 slug 唯一
  const existing = await db.product.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: `Slug "${data.slug}" 已被使用` };

  const product = await db.product.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      bodyHtml: safeBodyHtml,
      vendor: data.vendor,
      productType: data.productType,
      status: data.status,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      tags,
      variants: {
        create: data.variants.map((v, i) => ({
          title: v.title,
          sku: v.sku || null,
          price: v.price,
          compareAtPrice: v.compareAtPrice ?? null,
          inventory: v.inventory,
          sortOrder: i,
          isActive: v.isActive,
        })),
      },
      images: data.images.length > 0 ? {
        create: data.images.map((img) => ({
          url: img.url,
          altText: img.altText || null,
          sortOrder: img.sortOrder,
        })),
      } : undefined,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath(`/products/${product.slug}`);
  redirect(`/admin/products/${product.id}`);
}

// ── 更新商品 ───────────────────────────────────────────────
export async function updateProduct(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  let variantsRaw: unknown;
  try {
    variantsRaw = JSON.parse(formData.get("variants") as string);
  } catch {
    return { error: "規格資料格式錯誤" };
  }

  let imagesRaw: unknown = [];
  try {
    const imgStr = formData.get("images") as string;
    if (imgStr) imagesRaw = JSON.parse(imgStr);
  } catch {
    // 圖片解析失敗不阻止儲存
  }

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: getOptionalString(formData, "description"),
    bodyHtml: getOptionalString(formData, "bodyHtml"),
    vendor: getOptionalString(formData, "vendor"),
    productType: getOptionalString(formData, "productType"),
    status: formData.get("status"),
    seoTitle: getOptionalString(formData, "seoTitle"),
    seoDescription: getOptionalString(formData, "seoDescription"),
    tags: getOptionalString(formData, "tags"),
    variants: variantsRaw,
    images: imagesRaw,
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "驗證失敗" };
  }

  const data = parsed.data;
  const safeBodyHtml = data.bodyHtml ? sanitizeHtml(data.bodyHtml, SANITIZE_OPTIONS) : undefined;
  const tags = data.tags
    ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const existingProduct = await db.product.findUnique({
    where: { id },
    select: { slug: true },
  });

  // 確認 slug 唯一（排除自己）
  const existing = await db.product.findFirst({
    where: { slug: data.slug, NOT: { id } },
  });
  if (existing) return { error: `Slug "${data.slug}" 已被使用` };

  // 取得現有 variants
  const currentVariants = await db.variant.findMany({ where: { productId: id } });
  const currentIds = currentVariants.map((v) => v.id);
  const incomingIds = data.variants.filter((v) => v.id).map((v) => v.id!);

  // 刪除被移除的 variants
  const toDelete = currentIds.filter((cid) => !incomingIds.includes(cid));

  await db.$transaction([
    // 更新基本資料
    db.product.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        bodyHtml: safeBodyHtml,
        vendor: data.vendor,
        productType: data.productType,
        status: data.status,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        tags,
      },
    }),
    // 刪除舊 variants
    ...(toDelete.length > 0
      ? [db.variant.deleteMany({ where: { id: { in: toDelete } } })]
      : []),
    // upsert variants
    ...data.variants.map((v, i) =>
      v.id
        ? db.variant.update({
            where: { id: v.id },
            data: {
              title: v.title,
              sku: v.sku || null,
              price: v.price,
              compareAtPrice: v.compareAtPrice ?? null,
              inventory: v.inventory,
              sortOrder: i,
              isActive: v.isActive,
            },
          })
        : db.variant.create({
            data: {
              productId: id,
              title: v.title,
              sku: v.sku || null,
              price: v.price,
              compareAtPrice: v.compareAtPrice ?? null,
              inventory: v.inventory,
              sortOrder: i,
              isActive: v.isActive,
            },
          }),
    ),
    // 刪除舊圖片並重建（最簡單、最可靠的策略）
    db.productImage.deleteMany({ where: { productId: id } }),
    ...data.images.map((img) =>
      db.productImage.create({
        data: {
          productId: id,
          url: img.url,
          altText: img.altText || null,
          sortOrder: img.sortOrder,
        },
      })
    ),
  ]);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/");
  revalidatePath(`/products/${data.slug}`);
  if (existingProduct && existingProduct.slug !== data.slug) {
    revalidatePath(`/products/${existingProduct.slug}`);
  }
  return { success: true, id };
}

// ── 刪除商品 ───────────────────────────────────────────────
export async function deleteProduct(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role === "EDITOR")
    return { error: "權限不足" };

  const existingProduct = await db.product.findUnique({
    where: { id },
    select: { slug: true },
  });

  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/");
  if (existingProduct) {
    revalidatePath(`/products/${existingProduct.slug}`);
  }
  redirect("/admin/products");
}

// ── 批次更新狀態 ───────────────────────────────────────────
export async function updateProductStatus(
  ids: string[],
  status: "ACTIVE" | "DRAFT" | "ARCHIVED",
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.product.updateMany({ where: { id: { in: ids } }, data: { status } });
  revalidatePath("/admin/products");
  return { success: true, id: "" };
}
