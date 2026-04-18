"use server";

import sanitizeHtml from "sanitize-html";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { buildAboutPageContent } from "@/lib/about-page-content";
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

const pageSchema = z.object({
  title: z.string().min(1, "頁面標題必填"),
  slug: z.string().min(1, "Slug 必填").regex(/^[a-z0-9-]+$/, "Slug 只能包含小寫字母、數字和連字符"),
  bodyHtml: z.string().min(1, "頁面內容必填"),
  isPublished: z.coerce.boolean().default(false),
  template: z.string().default("default"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

function parseCustomContentJson(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return {} as Record<string, unknown>;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("額外內容 JSON 必須是物件");
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "額外內容 JSON 格式錯誤");
  }
}

function buildPageContent(
  existingValue: unknown,
  templateContent: ReturnType<typeof buildStorefrontTemplateContent>,
  additionalContent: Record<string, unknown>,
) {
  const templateMerged = mergeStorefrontTemplateContent(existingValue, templateContent) as Record<string, unknown>;

  for (const key of Object.keys(templateMerged)) {
    if (key !== "hero" && key !== "spotlight") {
      delete templateMerged[key];
    }
  }

  return {
    ...templateMerged,
    ...additionalContent,
  } as Prisma.InputJsonValue;
}

export async function createPage(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = pageSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    bodyHtml: formData.get("bodyHtml"),
    isPublished: formData.get("isPublished") === "true",
    template: formData.get("template"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "驗證失敗" };

  const existing = await db.page.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { error: `Slug "${parsed.data.slug}" 已被使用` };

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

  let additionalContent: Record<string, unknown>;
  try {
    additionalContent = parseCustomContentJson(formData.get("customContentJson"));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "額外內容 JSON 格式錯誤" };
  }

  if (parsed.data.slug === "about" || parsed.data.template === "about") {
    additionalContent = {
      ...additionalContent,
      about: buildAboutPageContent({
        backgroundImageUrl: formData.get("aboutBackgroundImageUrl"),
        backgroundImageAlt: formData.get("aboutBackgroundImageAlt"),
        brandSpiritHeading: formData.get("aboutBrandSpiritHeading"),
        brandSpiritLines: formData.get("aboutBrandSpiritLines"),
        brandSpiritHighlight: formData.get("aboutBrandSpiritHighlight"),
        brandCoreImageUrl: formData.get("aboutBrandCoreImageUrl"),
        brandCoreImageAlt: formData.get("aboutBrandCoreImageAlt"),
        brandCommitmentHeading: formData.get("aboutBrandCommitmentHeading"),
        brandCommitmentLines: formData.get("aboutBrandCommitmentLines"),
        brandCommitmentHighlight: formData.get("aboutBrandCommitmentHighlight"),
        storyDividerDesktopUrl: formData.get("aboutStoryDividerDesktopUrl"),
        storyDividerMobileUrl: formData.get("aboutStoryDividerMobileUrl"),
        storyDividerAlt: formData.get("aboutStoryDividerAlt"),
        storyHeading: formData.get("aboutStoryHeading"),
        storySubheading: formData.get("aboutStorySubheading"),
        storyIntro: formData.get("aboutStoryIntro"),
        storySection1Heading: formData.get("aboutStorySection1Heading"),
        storySection1Subheading: formData.get("aboutStorySection1Subheading"),
        storySection1ImageUrl: formData.get("aboutStorySection1ImageUrl"),
        storySection1ImageAlt: formData.get("aboutStorySection1ImageAlt"),
        storySection1Paragraphs: formData.get("aboutStorySection1Paragraphs"),
        storySection2Heading: formData.get("aboutStorySection2Heading"),
        storySection2Subheading: formData.get("aboutStorySection2Subheading"),
        storySection2ImageUrl: formData.get("aboutStorySection2ImageUrl"),
        storySection2ImageAlt: formData.get("aboutStorySection2ImageAlt"),
        storySection2Paragraphs: formData.get("aboutStorySection2Paragraphs"),
        thirdGenerationHeading: formData.get("aboutThirdGenerationHeading"),
        thirdGenerationSubheading: formData.get("aboutThirdGenerationSubheading"),
        thirdGenerationParagraphs: formData.get("aboutThirdGenerationParagraphs"),
        thirdGenerationImageUrl: formData.get("aboutThirdGenerationImageUrl"),
        thirdGenerationImageAlt: formData.get("aboutThirdGenerationImageAlt"),
      }),
    };
  }

  const page = await db.page.create({
    data: {
      ...parsed.data,
      bodyHtml: sanitizeHtml(parsed.data.bodyHtml, SANITIZE_OPTIONS),
      content: buildPageContent({}, content, additionalContent),
    },
  });

  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${page.id}`);
}

export async function updatePage(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = pageSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    bodyHtml: formData.get("bodyHtml"),
    isPublished: formData.get("isPublished") === "true",
    template: formData.get("template"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "驗證失敗" };

  const existing = await db.page.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (existing) return { error: `Slug "${parsed.data.slug}" 已被使用` };

  const current = await db.page.findUnique({
    where: { id },
    select: { content: true },
  });

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

  let additionalContent: Record<string, unknown>;
  try {
    additionalContent = parseCustomContentJson(formData.get("customContentJson"));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "額外內容 JSON 格式錯誤" };
  }

  if (parsed.data.slug === "about" || parsed.data.template === "about") {
    additionalContent = {
      ...additionalContent,
      about: buildAboutPageContent({
        backgroundImageUrl: formData.get("aboutBackgroundImageUrl"),
        backgroundImageAlt: formData.get("aboutBackgroundImageAlt"),
        brandSpiritHeading: formData.get("aboutBrandSpiritHeading"),
        brandSpiritLines: formData.get("aboutBrandSpiritLines"),
        brandSpiritHighlight: formData.get("aboutBrandSpiritHighlight"),
        brandCoreImageUrl: formData.get("aboutBrandCoreImageUrl"),
        brandCoreImageAlt: formData.get("aboutBrandCoreImageAlt"),
        brandCommitmentHeading: formData.get("aboutBrandCommitmentHeading"),
        brandCommitmentLines: formData.get("aboutBrandCommitmentLines"),
        brandCommitmentHighlight: formData.get("aboutBrandCommitmentHighlight"),
        storyDividerDesktopUrl: formData.get("aboutStoryDividerDesktopUrl"),
        storyDividerMobileUrl: formData.get("aboutStoryDividerMobileUrl"),
        storyDividerAlt: formData.get("aboutStoryDividerAlt"),
        storyHeading: formData.get("aboutStoryHeading"),
        storySubheading: formData.get("aboutStorySubheading"),
        storyIntro: formData.get("aboutStoryIntro"),
        storySection1Heading: formData.get("aboutStorySection1Heading"),
        storySection1Subheading: formData.get("aboutStorySection1Subheading"),
        storySection1ImageUrl: formData.get("aboutStorySection1ImageUrl"),
        storySection1ImageAlt: formData.get("aboutStorySection1ImageAlt"),
        storySection1Paragraphs: formData.get("aboutStorySection1Paragraphs"),
        storySection2Heading: formData.get("aboutStorySection2Heading"),
        storySection2Subheading: formData.get("aboutStorySection2Subheading"),
        storySection2ImageUrl: formData.get("aboutStorySection2ImageUrl"),
        storySection2ImageAlt: formData.get("aboutStorySection2ImageAlt"),
        storySection2Paragraphs: formData.get("aboutStorySection2Paragraphs"),
        thirdGenerationHeading: formData.get("aboutThirdGenerationHeading"),
        thirdGenerationSubheading: formData.get("aboutThirdGenerationSubheading"),
        thirdGenerationParagraphs: formData.get("aboutThirdGenerationParagraphs"),
        thirdGenerationImageUrl: formData.get("aboutThirdGenerationImageUrl"),
        thirdGenerationImageAlt: formData.get("aboutThirdGenerationImageAlt"),
      }),
    };
  }

  await db.page.update({
    where: { id },
    data: {
      ...parsed.data,
      bodyHtml: sanitizeHtml(parsed.data.bodyHtml, SANITIZE_OPTIONS),
      content: buildPageContent(current?.content, content, additionalContent),
    },
  });

  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${id}`);
  return { success: true, id };
}

export async function deletePage(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  await db.page.delete({ where: { id } });
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}
