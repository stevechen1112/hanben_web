import { db } from "@/lib/db";
import { SettingsGroup } from "@/components/admin/settings-group";

export default async function GeneralSettingsPage() {
  const settings = await db.siteSetting.findMany({
    where: {
      group: { in: ["general", "seo", "social", "contact"] },
    },
  });

  function val(key: string) {
    return settings.find((s) => s.key === key)?.value ?? "";
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">網站設定</h1>
        <p className="text-sm text-stone-500 mt-0.5">SEO、社群連結與聯絡資訊</p>
      </div>

      {/* SEO */}
      <SettingsGroup
        title="SEO 設定"
        fields={[
          {
            key: "seo_title",
            label: "Meta Title（全站預設）",
            value: val("seo_title"),
            placeholder: "漢本三代 — 傳承三代的漢方智慧",
          },
          {
            key: "seo_description",
            label: "Meta Description",
            value: val("seo_description"),
            type: "textarea",
            placeholder: "網站簡介，建議 80–160 字",
          },
        ]}
      />

      {/* 社群 */}
      <SettingsGroup
        title="品牌識別"
        fields={[
          {
            key: "site_logo_url",
            label: "網站 Logo",
            value: val("site_logo_url"),
            type: "media",
            placeholder: "從媒體庫選擇網站 Logo",
          },
        ]}
      />

      <SettingsGroup
        title="社群 / 追蹤碼"
        fields={[
          {
            key: "facebook_url",
            label: "Facebook 粉絲專頁網址",
            value: val("facebook_url"),
            type: "url",
            placeholder: "https://www.facebook.com/…",
          },
          {
            key: "instagram_url",
            label: "Instagram 網址",
            value: val("instagram_url"),
            type: "url",
            placeholder: "https://www.instagram.com/…",
          },
          {
            key: "line_url",
            label: "LINE 加入連結",
            value: val("line_url"),
            type: "url",
            placeholder: "https://line.me/R/ti/p/…",
          },
          {
            key: "facebook_pixel_id",
            label: "Facebook Pixel ID",
            value: val("facebook_pixel_id"),
            placeholder: "863478774420303",
          },
          {
            key: "ga_id",
            label: "Google Analytics 追蹤 ID",
            value: val("ga_id"),
            placeholder: "GT-XXXXXXXXX",
          },
        ]}
      />

      {/* 聯絡資訊 */}
      <SettingsGroup
        title="聯絡資訊"
        fields={[
          {
            key: "contact_phone",
            label: "聯絡電話",
            value: val("contact_phone"),
            placeholder: "04-2XXX-XXXX",
          },
          {
            key: "contact_email",
            label: "聯絡 Email",
            value: val("contact_email"),
            placeholder: "service@hanben.com.tw",
          },
          {
            key: "contact_address",
            label: "地址",
            value: val("contact_address"),
            placeholder: "台中市XX區XX路XX號",
          },
        ]}
      />
    </div>
  );
}
