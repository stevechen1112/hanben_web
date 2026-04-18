import "dotenv/config";

import path from "node:path";
import { db } from "../src/lib/db";
import { legacyOfficialMediaUrls } from "../src/lib/legacy-official-media";
import { importManagedMediaFile, inspectManagedMediaFile, walkFiles, type ManagedMediaFileDetails } from "../src/lib/managed-media";

type SourceRoot = {
  key: string;
  rootPath: string;
};

const sourceRoots: SourceRoot[] = [
  { key: "official-site", rootPath: path.join(process.cwd(), "官網") },
  { key: "shopify-site", rootPath: path.join(process.cwd(), "三代官方網站_SHOPIFY") },
];

const legacyOfficialRootPath = path.join(process.cwd(), "public", "official");
const legacyOfficialSourceRootKey = "legacy-official";

function replaceUrlsInString(value: string, replacements: Map<string, string>) {
  let nextValue = value;

  for (const [legacyPath, managedUrl] of replacements) {
    nextValue = nextValue.split(legacyPath).join(managedUrl);
  }

  return nextValue;
}

function replaceUrlsInJson(value: unknown, replacements: Map<string, string>): unknown {
  if (typeof value === "string") {
    return replaceUrlsInString(value, replacements);
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceUrlsInJson(item, replacements));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, replaceUrlsInJson(entryValue, replacements)]),
    );
  }

  return value;
}

async function importAllProvidedMedia() {
  const imported = new Map<string, string>();
  const replacements = new Map<string, string>();

  async function upsertManagedMedia(
    filePath: string,
    result: ManagedMediaFileDetails,
    altText?: string,
  ) {
    const existing = await db.mediaFile.findFirst({ where: { url: result.url } });

    if (existing) {
      await db.mediaFile.update({
        where: { id: existing.id },
        data: {
          filename: result.filename,
          mimeType: result.mimeType,
          size: result.size,
          width: result.width,
          height: result.height,
          folder: result.folder,
          altText: existing.altText ?? altText ?? path.basename(filePath, path.extname(filePath)),
        },
      });
    } else {
      await db.mediaFile.create({
        data: {
          filename: result.filename,
          url: result.url,
          mimeType: result.mimeType,
          size: result.size,
          width: result.width,
          height: result.height,
          folder: result.folder,
          altText: altText ?? path.basename(filePath, path.extname(filePath)),
        },
      });
    }
  }

  for (const sourceRoot of sourceRoots) {
    const files = await walkFiles(sourceRoot.rootPath);

    for (const filePath of files) {
      const sourceRelativePath = `${sourceRoot.key}/${path.relative(sourceRoot.rootPath, filePath).replace(/\\/g, "/")}`;
      const result = await importManagedMediaFile({
        sourcePath: filePath,
        sourceRelativePath,
        sourceRootKey: sourceRoot.key,
      });

      imported.set(sourceRelativePath, result.url);
      await upsertManagedMedia(filePath, result);
    }
  }

  for (const [legacyPath, managedUrl] of Object.entries(legacyOfficialMediaUrls)) {
    const relativePath = legacyPath.replace(/^\/official\//, "");
    const altText = path.basename(relativePath, path.extname(relativePath));

    try {
      const managedAsset = await inspectManagedMediaFile(managedUrl);
      imported.set(`${legacyOfficialSourceRootKey}/${relativePath}`, managedAsset.url);
      replacements.set(legacyPath, managedAsset.url);
      await upsertManagedMedia(path.join(legacyOfficialRootPath, ...relativePath.split("/")), managedAsset, altText);
      continue;
    } catch {
      const legacyFilePath = path.join(legacyOfficialRootPath, ...relativePath.split("/"));
      const result = await importManagedMediaFile({
        sourcePath: legacyFilePath,
        sourceRelativePath: relativePath,
        sourceRootKey: legacyOfficialSourceRootKey,
      });

      imported.set(`${legacyOfficialSourceRootKey}/${relativePath}`, result.url);
      replacements.set(legacyPath, result.url);
      await upsertManagedMedia(legacyFilePath, result, altText);
    }
  }

  return { imported, replacements };
}

async function migrateDatabase(replacements: Map<string, string>, imported: Map<string, string>) {
  const [products, collections, pages, articles, homepageSections, heroSlides] = await Promise.all([
    db.product.findMany({ include: { images: true } }),
    db.collection.findMany(),
    db.page.findMany(),
    db.blogArticle.findMany(),
    db.homepageSection.findMany(),
    db.heroSlide.findMany(),
  ]);

  await db.$transaction([
    ...products.flatMap((product) => {
      const updates: Array<ReturnType<typeof db.product.update> | ReturnType<typeof db.productImage.update>> = [];
      const nextBodyHtml = product.bodyHtml ? replaceUrlsInString(product.bodyHtml, replacements) : product.bodyHtml;

      if (nextBodyHtml !== product.bodyHtml) {
        updates.push(db.product.update({ where: { id: product.id }, data: { bodyHtml: nextBodyHtml } }));
      }

      for (const image of product.images) {
        const nextUrl = replacements.get(image.url);

        if (nextUrl && nextUrl !== image.url) {
          updates.push(db.productImage.update({ where: { id: image.id }, data: { url: nextUrl } }));
        }
      }

      return updates;
    }),
    ...collections.flatMap((collection) => {
      const nextImageUrl = collection.imageUrl ? replacements.get(collection.imageUrl) ?? collection.imageUrl : collection.imageUrl;
      return nextImageUrl !== collection.imageUrl
        ? [db.collection.update({ where: { id: collection.id }, data: { imageUrl: nextImageUrl } })]
        : [];
    }),
    ...pages.flatMap((page) => {
      const nextBodyHtml = replaceUrlsInString(page.bodyHtml, replacements);
      const nextContent = replaceUrlsInJson(page.content, replacements);
      return nextBodyHtml !== page.bodyHtml || JSON.stringify(nextContent) !== JSON.stringify(page.content)
        ? [db.page.update({ where: { id: page.id }, data: { bodyHtml: nextBodyHtml, content: nextContent as object } })]
        : [];
    }),
    ...articles.flatMap((article) => {
      const nextBodyHtml = replaceUrlsInString(article.bodyHtml, replacements);
      const nextFeatureImage = article.featureImage ? replacements.get(article.featureImage) ?? article.featureImage : article.featureImage;
      const nextContent = replaceUrlsInJson(article.content, replacements);
      return nextBodyHtml !== article.bodyHtml || nextFeatureImage !== article.featureImage || JSON.stringify(nextContent) !== JSON.stringify(article.content)
        ? [db.blogArticle.update({ where: { id: article.id }, data: { bodyHtml: nextBodyHtml, featureImage: nextFeatureImage, content: nextContent as object } })]
        : [];
    }),
    ...homepageSections.flatMap((section) => {
      const nextContent = replaceUrlsInJson(section.content, replacements);
      return JSON.stringify(nextContent) !== JSON.stringify(section.content)
        ? [db.homepageSection.update({ where: { id: section.id }, data: { content: nextContent as object } })]
        : [];
    }),
    ...heroSlides.flatMap((slide) => {
      const nextDesktop = replacements.get(slide.imageDesktop) ?? slide.imageDesktop;
      const nextMobile = slide.imageMobile ? replacements.get(slide.imageMobile) ?? slide.imageMobile : slide.imageMobile;
      return nextDesktop !== slide.imageDesktop || nextMobile !== slide.imageMobile
        ? [db.heroSlide.update({ where: { id: slide.id }, data: { imageDesktop: nextDesktop, imageMobile: nextMobile } })]
        : [];
    }),
  ]);

  const herbalGuidePage = await db.page.findUnique({ where: { slug: "chinese-herbal-guide" } });

  if (herbalGuidePage) {
    const herbalItems = [
      ["台灣天仙果", "打通行動根本", replacements.get("/official/herbal-guide/herb-01-taiwan-fig.jpg")],
      ["牛膝頭", "基礎行動力", replacements.get("/official/herbal-guide/herb-02-niuxitou.jpg")],
      ["細本山葡萄", "來自深山的淬鍊", replacements.get("/official/herbal-guide/herb-03-mountain-grape.jpg")],
      ["刺五加", "打通行動根本", replacements.get("/official/herbal-guide/herb-04-eleuthero.jpg")],
      ["白鶴靈芝", "大自然的草本仙鶴", replacements.get("/official/herbal-guide/herb-05-white-crane.jpg")],
      ["薑黃", "打通行動根本", replacements.get("/official/herbal-guide/herb-06-turmeric.jpg")],
      ["番紅花", "紅色鑽石", replacements.get("/official/herbal-guide/herb-07-saffron.jpg")],
      ["紅田烏", "濕地孕育的食養之葉", replacements.get("/official/herbal-guide/herb-08-hongtianwu.jpg")],
      ["甘草", "行動節奏的溫和支撐", replacements.get("/official/herbal-guide/herb-09-licorice.jpg")],
      ["桂花", "清香保養", replacements.get("/official/herbal-guide/herb-10-osmanthus.jpg")],
      ["雞屎藤", "日曬是關鍵", replacements.get("/official/herbal-guide/herb-11-paederia.jpg")],
      ["橄欖", "溫和基底", replacements.get("/official/herbal-guide/herb-12-olive.jpg")],
      ["紅棗", "溫潤調和", replacements.get("/official/herbal-guide/herb-13-red-date.jpg")],
      ["黃耆", "補氣之長", replacements.get("/official/herbal-guide/herb-14-astragalus.jpg")],
    ].map(([title, subtitle, imageUrl]) => ({ title, subtitle, imageUrl }));

    await db.page.update({
      where: { id: herbalGuidePage.id },
      data: {
        content: {
          ...(herbalGuidePage.content as Record<string, unknown>),
          herbalItems,
        },
      },
    });
  }

  const aboutPage = await db.page.findUnique({ where: { slug: "about" } });

  if (aboutPage) {
    await db.page.update({
      where: { id: aboutPage.id },
      data: {
        content: {
          ...(aboutPage.content as Record<string, unknown>),
          about: {
            backgroundImageUrl: replacements.get("/official/about/about-brand-spirit-bg.jpg") ?? null,
            brandCoreImageUrl: replacements.get("/official/about/about-brand-core.jpg") ?? null,
            storyDividerDesktopUrl: replacements.get("/official/about/about-story-divider-desktop.png") ?? null,
            storyDividerMobileUrl: replacements.get("/official/about/about-story-divider-mobile.png") ?? null,
            storyDividerAlt: "品牌故事分隔圖",
            storySections: [
              {
                imageUrl: replacements.get("/official/about/about-generation-1.jpg") ?? null,
                imageAlt: "第一代漢方傳承",
              },
              {
                imageUrl: replacements.get("/official/about/about-generation-2.jpg") ?? null,
                imageAlt: "第二代漢方傳承",
              },
            ],
            thirdGenerationImageUrl: replacements.get("/official/about/about-generation-3.png") ?? null,
            thirdGenerationImageAlt: "第三代漢方傳承",
          },
        },
      },
    });
  }

  const siteLogoUrl = replacements.get("/official/shared/header-logo.png");
  if (siteLogoUrl) {
    await db.siteSetting.upsert({
      where: { key: "site_logo_url" },
      update: { value: siteLogoUrl },
      create: {
        key: "site_logo_url",
        value: siteLogoUrl,
        type: "text",
        group: "general",
        label: "網站 Logo",
      },
    });
  }
}

async function main() {
  const { imported, replacements } = await importAllProvidedMedia();

  await migrateDatabase(replacements, imported);

  console.log(`Imported ${imported.size} provided files into managed media.`);
  console.log(`Repointed ${replacements.size} legacy asset paths.`);
}

main()
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });