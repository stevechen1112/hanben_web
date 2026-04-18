type AboutStorySection = {
  heading?: string;
  subheading?: string;
  imageUrl?: string;
  imageAlt?: string;
  paragraphs?: string[];
};

export type AboutPageContent = {
  backgroundImageUrl?: string;
  backgroundImageAlt?: string;
  brandSpiritHeading?: string;
  brandSpiritLines?: string[];
  brandSpiritHighlight?: string;
  brandCoreImageUrl?: string;
  brandCoreImageAlt?: string;
  brandCommitmentHeading?: string;
  brandCommitmentLines?: string[];
  brandCommitmentHighlight?: string;
  storyDividerDesktopUrl?: string;
  storyDividerMobileUrl?: string;
  storyDividerAlt?: string;
  storyHeading?: string;
  storySubheading?: string;
  storyIntro?: string;
  storySections?: AboutStorySection[];
  thirdGenerationHeading?: string;
  thirdGenerationSubheading?: string;
  thirdGenerationParagraphs?: string[];
  thirdGenerationImageUrl?: string;
  thirdGenerationImageAlt?: string;
};

type AboutPageFormInput = {
  backgroundImageUrl?: FormDataEntryValue | null;
  backgroundImageAlt?: FormDataEntryValue | null;
  brandSpiritHeading?: FormDataEntryValue | null;
  brandSpiritLines?: FormDataEntryValue | null;
  brandSpiritHighlight?: FormDataEntryValue | null;
  brandCoreImageUrl?: FormDataEntryValue | null;
  brandCoreImageAlt?: FormDataEntryValue | null;
  brandCommitmentHeading?: FormDataEntryValue | null;
  brandCommitmentLines?: FormDataEntryValue | null;
  brandCommitmentHighlight?: FormDataEntryValue | null;
  storyDividerDesktopUrl?: FormDataEntryValue | null;
  storyDividerMobileUrl?: FormDataEntryValue | null;
  storyDividerAlt?: FormDataEntryValue | null;
  storyHeading?: FormDataEntryValue | null;
  storySubheading?: FormDataEntryValue | null;
  storyIntro?: FormDataEntryValue | null;
  storySection1Heading?: FormDataEntryValue | null;
  storySection1Subheading?: FormDataEntryValue | null;
  storySection1ImageUrl?: FormDataEntryValue | null;
  storySection1ImageAlt?: FormDataEntryValue | null;
  storySection1Paragraphs?: FormDataEntryValue | null;
  storySection2Heading?: FormDataEntryValue | null;
  storySection2Subheading?: FormDataEntryValue | null;
  storySection2ImageUrl?: FormDataEntryValue | null;
  storySection2ImageAlt?: FormDataEntryValue | null;
  storySection2Paragraphs?: FormDataEntryValue | null;
  thirdGenerationHeading?: FormDataEntryValue | null;
  thirdGenerationSubheading?: FormDataEntryValue | null;
  thirdGenerationParagraphs?: FormDataEntryValue | null;
  thirdGenerationImageUrl?: FormDataEntryValue | null;
  thirdGenerationImageAlt?: FormDataEntryValue | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function asOptionalStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return normalized.length > 0 ? normalized : undefined;
}

function toMultilineArray(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : undefined;
}

function buildStorySection(input: {
  heading?: FormDataEntryValue | null;
  subheading?: FormDataEntryValue | null;
  imageUrl?: FormDataEntryValue | null;
  imageAlt?: FormDataEntryValue | null;
  paragraphs?: FormDataEntryValue | null;
}) {
  const section: AboutStorySection = {
    heading: asOptionalString(input.heading),
    subheading: asOptionalString(input.subheading),
    imageUrl: asOptionalString(input.imageUrl),
    imageAlt: asOptionalString(input.imageAlt),
    paragraphs: toMultilineArray(input.paragraphs),
  };

  return Object.values(section).some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value))
    ? section
    : undefined;
}

export function buildAboutPageContent(input: AboutPageFormInput) {
  const storySections = [
    buildStorySection({
      heading: input.storySection1Heading,
      subheading: input.storySection1Subheading,
      imageUrl: input.storySection1ImageUrl,
      imageAlt: input.storySection1ImageAlt,
      paragraphs: input.storySection1Paragraphs,
    }),
    buildStorySection({
      heading: input.storySection2Heading,
      subheading: input.storySection2Subheading,
      imageUrl: input.storySection2ImageUrl,
      imageAlt: input.storySection2ImageAlt,
      paragraphs: input.storySection2Paragraphs,
    }),
  ].filter((section): section is AboutStorySection => Boolean(section));

  const content: AboutPageContent = {
    backgroundImageUrl: asOptionalString(input.backgroundImageUrl),
    backgroundImageAlt: asOptionalString(input.backgroundImageAlt),
    brandSpiritHeading: asOptionalString(input.brandSpiritHeading),
    brandSpiritLines: toMultilineArray(input.brandSpiritLines),
    brandSpiritHighlight: asOptionalString(input.brandSpiritHighlight),
    brandCoreImageUrl: asOptionalString(input.brandCoreImageUrl),
    brandCoreImageAlt: asOptionalString(input.brandCoreImageAlt),
    brandCommitmentHeading: asOptionalString(input.brandCommitmentHeading),
    brandCommitmentLines: toMultilineArray(input.brandCommitmentLines),
    brandCommitmentHighlight: asOptionalString(input.brandCommitmentHighlight),
    storyDividerDesktopUrl: asOptionalString(input.storyDividerDesktopUrl),
    storyDividerMobileUrl: asOptionalString(input.storyDividerMobileUrl),
    storyDividerAlt: asOptionalString(input.storyDividerAlt),
    storyHeading: asOptionalString(input.storyHeading),
    storySubheading: asOptionalString(input.storySubheading),
    storyIntro: asOptionalString(input.storyIntro),
    storySections: storySections.length > 0 ? storySections : undefined,
    thirdGenerationHeading: asOptionalString(input.thirdGenerationHeading),
    thirdGenerationSubheading: asOptionalString(input.thirdGenerationSubheading),
    thirdGenerationParagraphs: toMultilineArray(input.thirdGenerationParagraphs),
    thirdGenerationImageUrl: asOptionalString(input.thirdGenerationImageUrl),
    thirdGenerationImageAlt: asOptionalString(input.thirdGenerationImageAlt),
  };

  return Object.fromEntries(Object.entries(content).filter(([, value]) => Array.isArray(value) ? value.length > 0 : Boolean(value))) as AboutPageContent;
}

export function parseAboutPageContent(value: unknown): AboutPageContent {
  const root = asRecord(value);
  const source = "about" in root ? asRecord(root.about) : root;
  const rawStorySections = Array.isArray(source.storySections) ? source.storySections : [];
  const storySections = rawStorySections
    .map((item) => {
      const section = asRecord(item);

      return {
        heading: asOptionalString(section.heading),
        subheading: asOptionalString(section.subheading),
        imageUrl: asOptionalString(section.imageUrl),
        imageAlt: asOptionalString(section.imageAlt),
        paragraphs: asOptionalStringArray(section.paragraphs),
      } satisfies AboutStorySection;
    })
    .filter((section) => Object.values(section).some((entry) => Array.isArray(entry) ? entry.length > 0 : Boolean(entry)));

  return {
    backgroundImageUrl: asOptionalString(source.backgroundImageUrl),
    backgroundImageAlt: asOptionalString(source.backgroundImageAlt),
    brandSpiritHeading: asOptionalString(source.brandSpiritHeading),
    brandSpiritLines: asOptionalStringArray(source.brandSpiritLines),
    brandSpiritHighlight: asOptionalString(source.brandSpiritHighlight),
    brandCoreImageUrl: asOptionalString(source.brandCoreImageUrl),
    brandCoreImageAlt: asOptionalString(source.brandCoreImageAlt),
    brandCommitmentHeading: asOptionalString(source.brandCommitmentHeading),
    brandCommitmentLines: asOptionalStringArray(source.brandCommitmentLines),
    brandCommitmentHighlight: asOptionalString(source.brandCommitmentHighlight),
    storyDividerDesktopUrl: asOptionalString(source.storyDividerDesktopUrl),
    storyDividerMobileUrl: asOptionalString(source.storyDividerMobileUrl),
    storyDividerAlt: asOptionalString(source.storyDividerAlt),
    storyHeading: asOptionalString(source.storyHeading),
    storySubheading: asOptionalString(source.storySubheading),
    storyIntro: asOptionalString(source.storyIntro),
    storySections: storySections.length > 0 ? storySections : undefined,
    thirdGenerationHeading: asOptionalString(source.thirdGenerationHeading),
    thirdGenerationSubheading: asOptionalString(source.thirdGenerationSubheading),
    thirdGenerationParagraphs: asOptionalStringArray(source.thirdGenerationParagraphs),
    thirdGenerationImageUrl: asOptionalString(source.thirdGenerationImageUrl),
    thirdGenerationImageAlt: asOptionalString(source.thirdGenerationImageAlt),
  };
}