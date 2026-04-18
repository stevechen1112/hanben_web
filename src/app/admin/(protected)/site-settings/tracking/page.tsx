import { SettingsGroup } from "@/components/admin/settings-group";
import { db } from "@/lib/db";

export default async function TrackingSettingsPage() {
  const settings = await db.siteSetting.findMany({
    where: {
      key: {
        in: [
          "google_tag_manager_id",
          "ga_id",
          "google_search_console_verification",
          "google_ads_id",
          "google_ads_conversion_label",
          "tracking_home_featured_list_id",
          "tracking_home_featured_list_name",
          "tracking_collection_list_id_prefix",
          "tracking_search_list_id_prefix",
          "tracking_search_list_name_prefix",
          "facebook_pixel_id",
          "meta_capi_access_token",
          "meta_capi_test_event_code",
          "meta_graph_api_version",
        ],
      },
    },
  });

  function val(key: string) {
    return settings.find((setting) => setting.key === key)?.value ?? "";
  }

  function hasValue(key: string) {
    return val(key).trim().length > 0;
  }

  const trackingStatuses = [
    {
      label: "Google Tag Manager",
      ready: hasValue("google_tag_manager_id"),
      detail: hasValue("google_tag_manager_id")
        ? "已設定容器 ID，可改由 GTM 接管 GA4 / Ads / Consent Mode。"
        : "尚未設定，不影響網站；前台仍可先用既有事件層與後台命名規則待命。",
    },
    {
      label: "Google Analytics / Google Tag",
      ready: hasValue("ga_id"),
      detail: hasValue("ga_id")
        ? "已設定，未使用 GTM 時可直接載入 Google tag。"
        : "尚未設定，GA4 頁面與事件不會直接送出。",
    },
    {
      label: "Google Ads Purchase / Remarketing",
      ready: hasValue("google_ads_id") && hasValue("google_ads_conversion_label"),
      detail: hasValue("google_ads_id") && hasValue("google_ads_conversion_label")
        ? "已設定，purchase conversion 與 remarketing payload 已具備接收條件。"
        : "尚未完整設定，站內仍會保留事件結構，但不會送出可用的 Google Ads conversion。",
    },
    {
      label: "Meta Pixel",
      ready: hasValue("facebook_pixel_id"),
      detail: hasValue("facebook_pixel_id")
        ? "已設定，使用者同意廣告 Cookie 後即可載入 Pixel。"
        : "尚未設定，前台不會載入 Meta Pixel。",
    },
    {
      label: "Meta Conversions API",
      ready: hasValue("meta_capi_access_token"),
      detail: hasValue("meta_capi_access_token")
        ? "已設定，付款成功 webhook 可回傳 server-side purchase。"
        : "尚未設定，ECPay 付款成功後不會送出 Meta server-side purchase。",
    },
    {
      label: "Google Search Console",
      ready: hasValue("google_search_console_verification"),
      detail: hasValue("google_search_console_verification")
        ? "已設定，網站會自動輸出 verification meta tag。"
        : "尚未設定，不影響 SEO 頁面本身，只是還不能完成 GSC 驗證。",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">追蹤 / 廣告整合</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            先把網站體質與事件鏈路建好，之後你只要把 GTM、Pixel、Meta CAPI 等參數填進來，就能直接打通量測與回傳。
          </p>
        </div>

        <div className="rounded-2xl border border-[#eadab5] bg-[#fffaf0] p-4 text-sm leading-7 text-stone-600">
          <p className="font-semibold text-[#7a1414]">目前已經先做好：</p>
          <p>1. Cookie consent 與 Google Consent Mode 預設狀態。</p>
          <p>2. 商品瀏覽、加入購物車、開始結帳、已付款 purchase 事件。</p>
          <p>3. 首頁商品模組、分類頁、搜尋商品結果頁的 `view_item_list` 與 list-level remarketing。</p>
          <p>4. 搜尋頁的 `view_search_results` 事件。</p>
          <p>5. ECPay 付款成功後的 Meta Conversions API server-side purchase 基礎。</p>
          <p>6. Google Ads purchase conversion 與 enhanced conversions 的前端結構。</p>
          <p className="mt-2 text-xs leading-6 text-stone-500">
            也就是說，這一頁除了憑證與 ID，也能直接管理商品清單 tracking 的命名規則，不需要再重改網站主體結構。
          </p>
        </div>

        <div className="rounded-2xl border border-[#d8c7a0] bg-[#fffdf7] p-4 text-sm leading-7 text-stone-600">
          <p className="font-semibold text-stone-800">現在還沒有外部資訊也沒關係</p>
          <p>這些欄位都可以先留白。留白時網站不會壞，只是對應的第三方追蹤不會啟用。</p>
          <p>目前你仍然可以先完成商品、內容、結帳流程、後台管理，以及站內 tracking 命名規則整理。</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-7 text-stone-600">
          <p className="font-semibold text-stone-800">調整命名時請注意</p>
          <p>首頁、分類、搜尋結果頁的 list ID / list name 規則都能在這頁調整。</p>
          <p>若你的 GTM 觸發條件、自訂變數、Looker Studio 或 GA4 探索報表有依賴這些命名，請同步更新，避免報表斷層。</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-stone-800">追蹤整備狀態</p>
              <p className="mt-1 text-xs leading-6 text-stone-500">這裡只反映目前後台是否已填入必要外部資訊，不代表站內事件層是否存在。事件層本身已先建好。</p>
            </div>
            <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              {trackingStatuses.filter((item) => item.ready).length}/{trackingStatuses.length} 已就緒
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {trackingStatuses.map((item) => (
              <div key={item.label} className="rounded-xl border border-stone-200 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-stone-800">{item.label}</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${item.ready ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}
                  >
                    {item.ready ? "已設定" : "尚未設定"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-6 text-stone-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SettingsGroup
        title="事件命名 / 清單規則"
        description="這些欄位控制 `view_item_list` 與搜尋相關事件在 dataLayer / GA4 中使用的命名。之後若要調整規則，從這裡改即可。"
        fields={[
          {
            key: "tracking_home_featured_list_id",
            label: "首頁商品清單 List ID",
            value: val("tracking_home_featured_list_id") || "homepage:featured-products",
            placeholder: "homepage:featured-products",
            description: "首頁商品模組送出 `view_item_list` 時的 list_id。建議維持穩定，方便 GTM 與報表對應。",
            group: "analytics",
          },
          {
            key: "tracking_home_featured_list_name",
            label: "首頁商品清單 List Name 覆寫",
            value: val("tracking_home_featured_list_name"),
            placeholder: "留白則沿用首頁商品區塊標題",
            description: "可選。若留白，系統會直接使用首頁商品區塊標題作為 list_name。",
            group: "analytics",
          },
          {
            key: "tracking_collection_list_id_prefix",
            label: "分類頁 List ID 前綴",
            value: val("tracking_collection_list_id_prefix") || "collection:",
            placeholder: "collection:",
            description: "分類商品頁會組成 `{前綴}{collection.slug}`，例如 `collection:all`。",
            group: "analytics",
          },
          {
            key: "tracking_search_list_id_prefix",
            label: "搜尋頁 List ID 前綴",
            value: val("tracking_search_list_id_prefix") || "search:",
            placeholder: "search:",
            description: "搜尋商品結果頁會組成 `{前綴}{關鍵字}`，例如 `search:舒活飲`。",
            group: "analytics",
          },
          {
            key: "tracking_search_list_name_prefix",
            label: "搜尋頁 List Name 前綴",
            value: val("tracking_search_list_name_prefix") || "搜尋結果：",
            placeholder: "搜尋結果：",
            description: "搜尋商品結果頁的 `view_item_list` 會組成 `{前綴}{關鍵字}`；搜尋意圖事件 `view_search_results` 仍會獨立送出 `search_term`。",
            group: "analytics",
          },
        ]}
      />

      <SettingsGroup
        title="Google 端設定"
        description="GTM 為主要建議入口。若已填 GTM 容器 ID，網站會以 GTM 為主，不再另外直接載入 gtag.js。GA 與 GSC 也一起收斂在這一區管理。"
        fields={[
          {
            key: "google_tag_manager_id",
            label: "Google Tag Manager 容器 ID",
            value: val("google_tag_manager_id"),
            placeholder: "GTM-XXXXXXX",
            description: "建議主要使用這個欄位，後續 GA4、Google Ads、Consent Mode 都可由 GTM 接管。",
            group: "social",
          },
          {
            key: "ga_id",
            label: "Google Analytics / Google Tag ID",
            value: val("ga_id"),
            placeholder: "GT-XXXXXXXXX 或 G-XXXXXXXXXX",
            description: "若尚未使用 GTM，可先填這個讓站台直接載入 Google tag。",
            group: "social",
          },
          {
            key: "google_search_console_verification",
            label: "Google Search Console 驗證碼",
            value: val("google_search_console_verification"),
            placeholder: "google-site-verification=... 或 token 內容",
            description: "填入 HTML meta 驗證碼後，網站會自動輸出 Search Console 需要的驗證 meta tag。",
            group: "seo",
          },
          {
            key: "google_ads_id",
            label: "Google Ads ID",
            value: val("google_ads_id"),
            placeholder: "AW-XXXXXXXXX",
            description: "已可用於 purchase conversion 與動態再行銷。若未使用 GTM，站台會直接送出 Google Ads conversion。",
            group: "social",
          },
          {
            key: "google_ads_conversion_label",
            label: "Google Ads Conversion Label",
            value: val("google_ads_conversion_label"),
            placeholder: "AbCdEFghijkLMNoPq",
            description: "和 Google Ads ID 一起填好後，已付款結果頁會送出 purchase conversion，並帶 enhanced conversions 所需的 email / phone 資料。商品頁、購物車、結帳頁也會同步推送動態再行銷資料層。",
            group: "social",
          },
        ]}
      />

      <SettingsGroup
        title="Meta 瀏覽器端"
        description="這一區管理 Facebook / Instagram 廣告常用的 Pixel 與測試輔助參數。"
        fields={[
          {
            key: "facebook_pixel_id",
            label: "Meta Pixel ID",
            value: val("facebook_pixel_id"),
            placeholder: "123456789012345",
            description: "站台前端會在使用者允許廣告 Cookie 後載入 Pixel。",
            group: "social",
          },
          {
            key: "meta_capi_test_event_code",
            label: "Meta Test Event Code",
            value: val("meta_capi_test_event_code"),
            placeholder: "TEST12345",
            description: "正式上線可留空；除錯 Conversions API 時可暫時填入。",
            group: "social",
          },
        ]}
      />

      <SettingsGroup
        title="Meta Server-side CAPI"
        description="用於付款成功 webhook 回傳 Meta Conversions API。這些欄位屬於敏感憑證，只有 admin 後台可見。"
        fields={[
          {
            key: "meta_capi_access_token",
            label: "Meta CAPI Access Token",
            value: val("meta_capi_access_token"),
            type: "password",
            storageType: "password",
            placeholder: "EAAG...",
            description: "網站會優先讀這個欄位；若留空才 fallback 到環境變數。",
            group: "social",
          },
          {
            key: "meta_graph_api_version",
            label: "Meta Graph API Version",
            value: val("meta_graph_api_version") || "v22.0",
            placeholder: "v22.0",
            description: "通常維持預設即可，僅在 Meta 升版後才需要調整。",
            group: "social",
          },
        ]}
      />
    </div>
  );
}