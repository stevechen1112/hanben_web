import { cache } from "react";
import { db } from "@/lib/db";

export const getSiteSettingMap = cache(async () => {
  const settings = await db.siteSetting.findMany();
  return new Map(settings.map((setting) => [setting.key, setting.value]));
});

export async function getSiteSetting(key: string, fallback = "") {
  const settings = await getSiteSettingMap();
  return settings.get(key) ?? fallback;
}

export async function getSiteMetadataDefaults() {
  const settings = await getSiteSettingMap();
  return {
    title: settings.get("seo_title") || settings.get("site_name") || "漢本三代",
    description:
      settings.get("seo_description") ||
      settings.get("site_description") ||
      "漢本三代是以承襲三代的漢方智慧守護為核心的循養品牌。",
    siteName: settings.get("site_name") || "漢本三代",
    gaId: settings.get("ga_id") || "",
    pixelId: settings.get("facebook_pixel_id") || "",
  };
}