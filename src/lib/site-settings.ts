import { cache } from "react";
import { db } from "@/lib/db";

export type TrackingSettings = {
  gaId: string;
  gtmId: string;
  googleAdsConversionLabel: string;
  googleAdsId: string;
  pixelId: string;
};

export type TrackingNamingSettings = {
  collectionListIdPrefix: string;
  homeFeaturedListId: string;
  homeFeaturedListName: string;
  searchListIdPrefix: string;
  searchListNamePrefix: string;
};

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
    googleSiteVerification: settings.get("google_search_console_verification") || "",
    siteName: settings.get("site_name") || "漢本三代",
    gaId: settings.get("ga_id") || "",
    pixelId: settings.get("facebook_pixel_id") || "",
  };
}

export async function getTrackingSettings(): Promise<TrackingSettings> {
  const settings = await getSiteSettingMap();
  return {
    gaId: settings.get("ga_id") || "",
    gtmId: settings.get("google_tag_manager_id") || "",
    googleAdsConversionLabel: settings.get("google_ads_conversion_label") || "",
    googleAdsId: settings.get("google_ads_id") || "",
    pixelId: settings.get("facebook_pixel_id") || "",
  };
}

export async function getTrackingNamingSettings(): Promise<TrackingNamingSettings> {
  const settings = await getSiteSettingMap();
  return {
    collectionListIdPrefix: settings.get("tracking_collection_list_id_prefix") || "collection:",
    homeFeaturedListId: settings.get("tracking_home_featured_list_id") || "homepage:featured-products",
    homeFeaturedListName: settings.get("tracking_home_featured_list_name") || "",
    searchListIdPrefix: settings.get("tracking_search_list_id_prefix") || "search:",
    searchListNamePrefix: settings.get("tracking_search_list_name_prefix") || "搜尋結果：",
  };
}