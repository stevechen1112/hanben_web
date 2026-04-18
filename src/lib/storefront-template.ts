import { z } from "zod";

const mediaTypeSchema = z.enum(["image", "video"]);

const heroSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  body: z.string().optional(),
  mediaType: mediaTypeSchema.optional(),
  mediaUrl: z.string().optional(),
  mediaAlt: z.string().optional(),
  posterUrl: z.string().optional(),
});

const spotlightSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  mediaType: mediaTypeSchema.optional(),
  mediaUrl: z.string().optional(),
  mediaAlt: z.string().optional(),
});

export const storefrontTemplateSchema = z.object({
  hero: heroSchema.optional(),
  spotlight: spotlightSchema.optional(),
});

export type StorefrontTemplateContent = z.infer<typeof storefrontTemplateSchema>;

type StorefrontTemplateInput = {
  heroEyebrow?: FormDataEntryValue | null;
  heroHeading?: FormDataEntryValue | null;
  heroBody?: FormDataEntryValue | null;
  heroMediaType?: FormDataEntryValue | null;
  heroMediaUrl?: FormDataEntryValue | null;
  heroMediaAlt?: FormDataEntryValue | null;
  heroPosterUrl?: FormDataEntryValue | null;
  spotlightTitle?: FormDataEntryValue | null;
  spotlightBody?: FormDataEntryValue | null;
  spotlightMediaType?: FormDataEntryValue | null;
  spotlightMediaUrl?: FormDataEntryValue | null;
  spotlightMediaAlt?: FormDataEntryValue | null;
};

function cleanString(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function cleanMediaType(value: FormDataEntryValue | null | undefined) {
  const parsed = mediaTypeSchema.safeParse(cleanString(value));
  return parsed.success ? parsed.data : undefined;
}

export function buildStorefrontTemplateContent(input: StorefrontTemplateInput): StorefrontTemplateContent {
  const hero = {
    eyebrow: cleanString(input.heroEyebrow),
    heading: cleanString(input.heroHeading),
    body: cleanString(input.heroBody),
    mediaType: cleanMediaType(input.heroMediaType),
    mediaUrl: cleanString(input.heroMediaUrl),
    mediaAlt: cleanString(input.heroMediaAlt),
    posterUrl: cleanString(input.heroPosterUrl),
  };

  const spotlight = {
    title: cleanString(input.spotlightTitle),
    body: cleanString(input.spotlightBody),
    mediaType: cleanMediaType(input.spotlightMediaType),
    mediaUrl: cleanString(input.spotlightMediaUrl),
    mediaAlt: cleanString(input.spotlightMediaAlt),
  };

  const nextValue: StorefrontTemplateContent = {};

  if (Object.values(hero).some(Boolean)) {
    nextValue.hero = hero;
  }

  if (Object.values(spotlight).some(Boolean)) {
    nextValue.spotlight = spotlight;
  }

  return nextValue;
}

export function mergeStorefrontTemplateContent(
  existingValue: unknown,
  nextValue: StorefrontTemplateContent,
) {
  const base = existingValue && typeof existingValue === "object" && !Array.isArray(existingValue)
    ? { ...(existingValue as Record<string, unknown>) }
    : {};

  if (nextValue.hero) {
    base.hero = nextValue.hero;
  } else {
    delete base.hero;
  }

  if (nextValue.spotlight) {
    base.spotlight = nextValue.spotlight;
  } else {
    delete base.spotlight;
  }

  return base;
}

export function extractAdditionalStorefrontContent(value: unknown, omittedKeys: string[] = []) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, unknown>;
  }

  const base = { ...(value as Record<string, unknown>) };
  delete base.hero;
  delete base.spotlight;

  for (const key of omittedKeys) {
    delete base[key];
  }

  return base;
}

export function parseStorefrontTemplateContent(value: unknown): StorefrontTemplateContent {
  const parsed = storefrontTemplateSchema.safeParse(value);
  return parsed.success ? parsed.data : {};
}