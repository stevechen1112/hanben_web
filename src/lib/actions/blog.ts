"use server";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { buildStorefrontTemplateContent, mergeStorefrontTemplateContent } from "@/lib/storefront-template";

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

type ActionResult = { error: string } | { success: true; id: string };

const articleSchema = z.object({
  channelId: z.string().min(1, "請選擇頻道"),
  title: z.string().min(1, "文章標題必填"),
  slug: z.string().min(1, "Slug 必填").regex(/^[a-z0-9-]+$/, "Slug 只能包含小寫字母、數字和連字符"),
  excerpt: z.string().optional(),
  bodyHtml: z.string().min(1, "文章內容必填"),
  featureImage: z.string().url("請輸入有效的圖片 URL").optional().or(z.literal("")),
  author: z.string().optional(),
  tags: z.string().optional(),
  isPublished: z.coerce.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function createArticle(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = articleSchema.safeParse({
    channelId: formData.get("channelId"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    bodyHtml: formData.get("bodyHtml"),
    featureImage: formData.get("featureImage"),
    author: formData.get("author"),
    tags: formData.get("tags"),
    isPublished: formData.get("isPublished") === "true",
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "驗證失敗" };

  const data = parsed.data;
  const safeBodyHtml = sanitizeHtml(data.bodyHtml, SANITIZE_OPTIONS);
  const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const content = buildStorefrontTemplateContent({
    heroEyebrow: formData.get("heroEyebrow"),
    heroHeading: formData.get("heroHeading"),
    heroBody: formData.get("heroBody"),
    heroMediaType: formData.get("heroMediaType"),
    heroMediaUrl: formData.get("heroMediaUrl"),
    heroMediaAlt: formData.get("heroMediaAlt"),
    heroPosterUrl: formData.get("heroPosterUrl"),
    spotlightTitle: formData.get("spotlightTitle"),
    spotlightBody: formData.get("spotlightBody"),
    spotlightMediaType: formData.get("spotlightMediaType"),
    spotlightMediaUrl: formData.get("spotlightMediaUrl"),
    spotlightMediaAlt: formData.get("spotlightMediaAlt"),
  });

  const existing = await db.blogArticle.findFirst({
    where: { channelId: data.channelId, slug: data.slug },
  });
  if (existing) return { error: `此頻道下 Slug "${data.slug}" 已被使用` };

  const article = await db.blogArticle.create({
    data: {
      channelId: data.channelId,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      bodyHtml: safeBodyHtml,
      content: mergeStorefrontTemplateContent({}, content) as Prisma.InputJsonValue,
      featureImage: data.featureImage || null,
      author: data.author,
      tags,
      isPublished: data.isPublished,
      publishedAt: data.isPublished ? new Date() : null,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    },
  });

  revalidatePath("/admin/blog/articles");
  redirect(`/admin/blog/articles/${article.id}`);
}

export async function updateArticle(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = articleSchema.safeParse({
    channelId: formData.get("channelId"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    bodyHtml: formData.get("bodyHtml"),
    featureImage: formData.get("featureImage"),
    author: formData.get("author"),
    tags: formData.get("tags"),
    isPublished: formData.get("isPublished") === "true",
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "驗證失敗" };

  const data = parsed.data;
  const safeBodyHtml = sanitizeHtml(data.bodyHtml, SANITIZE_OPTIONS);
  const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const content = buildStorefrontTemplateContent({
    heroEyebrow: formData.get("heroEyebrow"),
    heroHeading: formData.get("heroHeading"),
    heroBody: formData.get("heroBody"),
    heroMediaType: formData.get("heroMediaType"),
    heroMediaUrl: formData.get("heroMediaUrl"),
    heroMediaAlt: formData.get("heroMediaAlt"),
    heroPosterUrl: formData.get("heroPosterUrl"),
    spotlightTitle: formData.get("spotlightTitle"),
    spotlightBody: formData.get("spotlightBody"),
    spotlightMediaType: formData.get("spotlightMediaType"),
    spotlightMediaUrl: formData.get("spotlightMediaUrl"),
    spotlightMediaAlt: formData.get("spotlightMediaAlt"),
  });

  const existing = await db.blogArticle.findFirst({
    where: { channelId: data.channelId, slug: data.slug, NOT: { id } },
  });
  if (existing) return { error: `此頻道下 Slug "${data.slug}" 已被使用` };

  // 取得目前文章以判斷是否首次發布
  const current = await db.blogArticle.findUnique({
    where: { id },
    select: { isPublished: true, content: true },
  });
  const wasPublished = current?.isPublished ?? false;

  await db.blogArticle.update({
    where: { id },
    data: {
      channelId: data.channelId,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      bodyHtml: safeBodyHtml,
      content: mergeStorefrontTemplateContent(current?.content, content) as Prisma.InputJsonValue,
      featureImage: data.featureImage || null,
      author: data.author,
      tags,
      isPublished: data.isPublished,
      publishedAt: data.isPublished && !wasPublished ? new Date() : undefined,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    },
  });

  revalidatePath("/admin/blog/articles");
  revalidatePath(`/admin/blog/articles/${id}`);
  return { success: true, id };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.blogArticle.delete({ where: { id } });
  revalidatePath("/admin/blog/articles");
  redirect("/admin/blog/articles");
}
