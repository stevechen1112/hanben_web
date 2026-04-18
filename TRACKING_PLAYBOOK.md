# Website Tracking Playbook

這份文件的目的，不是只記錄 hanben-admin 做了哪些 tracking，而是把這次累積下來的方法論整理成一份之後做新網站也能直接重用的 playbook。

若要實際在 GTM 裡接這些事件，請搭配 `GTM_IMPLEMENTATION_GUIDE.md` 一起看。

適用範圍：

- 電商網站
- 有前後台的內容 / 商品管理站
- 需要日後串接 GA4、GTM、Google Ads、Meta Pixel、Meta Conversions API、GSC 的網站
- 希望先把網站體質打好，再等外部平台資訊補齊的專案

## 1. 核心觀念

這次最重要的結論不是「把幾個追蹤碼塞進網站」，而是以下幾件事：

1. 網站要先擁有自己的事件模型，而不是完全依賴外部平台。
2. 網站要先把商品、清單、購物車、結帳、訂單、使用者識別資料整理好，外部平台才能正確吃到資料。
3. 外部平台資訊不一定一開始就有，所以系統必須能在「資訊尚未到位」時安全退化。
4. 管理者不應每次為了改 tracking 命名或填整合參數就改程式，因此後台要有可操作的設定入口。
5. 真正能讓未來新網站複用的，是一套穩定的事件契約、命名策略、後台設定模型、驗證流程，而不是單一網站的硬編碼。

簡單說：

- 先建網站體質
- 再接外部平台
- 再做驗證與投放

不是反過來。

## 2. 什麼叫網站體質先打好

如果要讓 Meta / Google / GTM / GA4 後續真的好接，網站至少要先具備這些條件：

### 2.1 商品識別穩定

每個商品事件都要有穩定且一致的識別資訊：

- product id
- variant id
- sku
- 商品名稱
- variant 名稱
- 價格
- 數量

如果這些欄位不穩定，之後你會遇到：

- Google Ads dynamic remarketing 對不上商品
- GA4 電商報表維度混亂
- Meta content_ids 無法穩定對應
- 同一商品在不同頁面被當成不同 item

### 2.2 清單事件有一致命名策略

商品清單不是只有「有沒有送 `view_item_list`」而已，更重要的是命名規則穩不穩定。

至少要先想清楚：

- 首頁推薦商品區的 list_id / list_name 是什麼
- 分類頁的 list_id 是否用 `collection:{slug}`
- 搜尋結果頁的 list_id 是否用 `search:{keyword}`
- 搜尋結果頁的 list_name 是否用 `搜尋結果：{keyword}`

如果命名每次改、不同頁面沒規則，之後：

- GTM trigger 很難寫
- GA4 探索報表很難分析
- Looker Studio 自訂維度難以對齊
- 新站很難複製舊站邏輯

### 2.3 Consent 與資料治理先到位

追蹤不只是送事件，還要考慮使用者同意狀態與資料界線：

- 是否有 cookie consent 橫幅
- 是否有 analytics / ads 分流同意狀態
- 是否有 Google Consent Mode 預設狀態
- 是否避免把不該送進 GA4 的個資直接送出
- 是否只在合適條件下啟用 Pixel / Ads user data

### 2.4 訂單與付款狀態可作為 server-side 觸發點

如果網站要接 Meta Conversions API 或更穩定的 purchase 回傳，必須有穩定的 server-side 訊號來源，例如：

- webhook
- 訂單首次轉為已付款的狀態
- 唯一 transaction id / event id

這樣才能處理：

- browser event / server event deduplication
- 用戶關閉頁面時 browser-side purchase 遺失
- 金流成功但前端頁面沒成功執行腳本的情況

## 3. 外部平台分工

很多團隊會誤以為「把 ID 填進後台就等於整合完成」。實際上要把責任拆成兩層：

### 3.1 網站負責的事情

- 建立穩定事件模型
- 整理商品 / 訂單 / 使用者資料結構
- 推送 dataLayer / gtag / fbq / server-side payload
- 管理 consent
- 提供後台設定入口
- 保證留白時安全退化

### 3.2 平台端負責的事情

- GTM 建 tag / trigger / variable
- GA4 建資料串流與報表
- Google Ads 建 conversion action / audience / remarketing
- Merchant Center / 商品 feed 對應
- Meta Events Manager / Pixel / CAPI 設定與測試
- Search Console 驗證

因此最準確的說法是：

網站可以先把「可接通的骨架」做好；平台帳號、容器、轉換動作、受眾、feed、驗證，仍然要在平台後台完成。

## 4. 建議採用的架構

### 4.1 GTM-first，但保留 direct fallback

最推薦的路線：

- 有 GTM 時，以 GTM 為主
- 沒有 GTM 時，GA / Ads 可有限度 direct send

原因：

- GTM 適合後續擴充與治理
- direct gtag 適合初期快速啟用
- 兩者並存時要明確避免重複送出

### 4.2 dataLayer-first

網站端不要只想著「直接呼叫某一家平台 SDK」，而要先建立自己的 data contract。

推薦順序：

1. 組合網站自己的標準化 payload
2. 推進 `dataLayer`
3. 再視情況 direct call `gtag` / `fbq`
4. purchase 等關鍵事件同步具備 server-side 能力

這樣做的好處：

- 平台可替換
- GTM 容易接
- 驗證清楚
- 新站可複製同一套事件規格

### 4.3 後台可管理，不把規則寫死

除了憑證與 ID，以下資訊也建議進 admin：

- GTM ID
- GA ID
- Google Ads ID
- Google Ads Conversion Label
- Meta Pixel ID
- Meta CAPI token
- GSC verification token
- 清單 tracking 命名規則

如果這些都硬寫在程式裡，之後每個新網站都會再踩一次同樣的維運痛點。

## 5. 建新網站時的推薦實作順序

### Phase 0. 資料模型先設計好

至少先有：

- Product
- ProductVariant
- Collection / Category
- Cart / CartLine
- Order / OrderItem
- SiteSetting

商品與訂單模型要能提供 tracking 所需欄位。

### Phase 1. 建立網站 tracking contract

先定義網站自己的事件，而不是先看平台畫面：

- `page_view`
- `view_item`
- `view_item_list`
- `view_search_results`
- `add_to_cart`
- `view_cart`
- `begin_checkout`
- `purchase`

可再依需求擴充：

- `add_payment_info`
- `add_shipping_info`
- `login`
- `sign_up`
- `generate_lead`

### Phase 2. 建立 consent 層

至少做：

- consent cookie
- analytics / ads 狀態
- Google Consent Mode default + update
- banner / 偏好設定 UI

### Phase 3. 建立 admin 設定層

讓後台可以設定：

- 平台憑證
- tracking naming
- 是否啟用某些整合
- 測試用欄位（例如 Meta test event code）

### Phase 4. 先接前台事件

先把核心 funnel 跑起來：

- 商品頁
- 商品清單頁
- 購物車
- 結帳
- 購買完成

### Phase 5. 再接 server-side purchase

這一步很重要，因為 purchase 是最有價值、也最容易遺失的事件。

### Phase 6. 最後才做平台端接線與驗證

平台端接線永遠是最後一步，而不是第一步。

## 6. hanben-admin 這次實際做了什麼

以下是這次專案已落地的部分，可作為未來新站的參考模板。

### 6.1 前台基礎設施

- root layout 會讀取 tracking settings 與 consent 狀態
- 自動注入 Google Consent Mode 預設值
- 有 Cookie 偏好橫幅
- 有 runtime 監聽 consent 更新與 route 變更 page view

### 6.2 事件層

目前已建好的主要事件：

- `view_item`
- `add_to_cart`
- `view_cart`
- `begin_checkout`
- `purchase`
- `view_item_list`
- `view_search_results`

### 6.3 清單層與搜尋層

目前已覆蓋：

- 首頁商品模組
- 分類商品頁
- 搜尋商品結果頁

其中搜尋頁不只送商品清單，也會送搜尋意圖事件。

### 6.4 Google 端

目前支援：

- GTM 容器載入
- direct Google tag fallback
- Google Ads purchase conversion
- enhanced conversions
- dynamic remarketing payload
- GSC verification meta tag

### 6.5 Meta 端

目前支援：

- Meta Pixel 在使用者同意 ads cookie 後才載入
- Meta Conversions API server-side purchase
- browser / server deduplication event id

### 6.6 Admin 後台

目前後台已可管理：

- GTM / GA / Ads / Meta / GSC 參數
- 商品清單 tracking 命名規則
- 敏感憑證顯示 / 隱藏
- 整備狀態面板
- 留白時的安全退化說明

## 7. hanben-admin 這次對應的實作位置

以下是本專案的重要檔案，未來做新站時可直接當參考：

- `src/app/layout.tsx`：整站 tracking bootstrap
- `src/components/storefront/tracking/tracking-scripts.tsx`：Google scripts / GTM / tracking state 注入
- `src/components/storefront/tracking/tracking-runtime.tsx`：consent update、page view、Meta Pixel runtime
- `src/components/storefront/tracking/consent-banner.tsx`：Cookie 偏好 UI
- `src/lib/tracking-consent.ts`：consent state model
- `src/lib/analytics.ts`：統一事件層
- `src/components/storefront/tracking/product-view-tracker.tsx`：商品頁 `view_item`
- `src/components/storefront/tracking/product-list-tracker.tsx`：商品清單 `view_item_list`
- `src/components/storefront/tracking/search-results-tracker.tsx`：搜尋意圖 `view_search_results`
- `src/components/storefront/tracking/purchase-event-tracker.tsx`：purchase tracker
- `src/lib/meta-conversions.ts`：Meta CAPI server-side purchase
- `src/app/api/webhooks/ecpay/payment/route.ts`：付款成功 webhook 回傳
- `src/app/admin/(protected)/site-settings/tracking/page.tsx`：追蹤 / 廣告設定頁
- `src/lib/site-settings.ts`：tracking settings / naming settings 存取
- `src/lib/actions/site-settings.ts`：後台儲存 site settings

## 8. 未來新站的推薦清單

如果之後又做一個新網站，建議照這個順序執行：

### 8.1 先做網站內部能力

1. 把商品與訂單資料模型整理好。
2. 把事件契約整理好。
3. 把 consent 做好。
4. 把 admin 設定入口做好。
5. 把核心事件先打通。
6. 把 purchase server-side 補上。

### 8.2 再接外部平台

1. 取得 GTM / GA / Ads / Meta / GSC 資訊。
2. 填進 admin。
3. 在 GTM / Meta / Google 平台端完成容器、conversion、audience、feed、驗證等設定。
4. 做測試與驗證。

### 8.3 最後做驗證

至少驗證：

- 瀏覽商品是否有 `view_item`
- 瀏覽清單是否有 `view_item_list`
- 搜尋是否有 `view_search_results`
- 加入購物車是否有 `add_to_cart`
- 結帳是否有 `begin_checkout`
- 完成付款是否有 browser-side purchase
- 完成付款是否有 server-side purchase
- 是否有 dedup
- consent 拒絕時是否正確不送對應追蹤

## 9. 常見錯誤

### 9.1 只裝 Pixel / gtag，沒有網站自己的事件層

這樣之後每次改平台、改 GTM、改後台欄位，都會重新拆站。

### 9.2 清單命名規則混亂

這會直接破壞報表可讀性與新站複用性。

### 9.3 purchase 只做前端，不做 server-side

最終一定會遇到遺失與數據不穩。

### 9.4 不做 consent 就直接送

這會讓後續治理成本變高，也容易留下合規風險。

### 9.5 把所有規則都寫死在程式裡

這會讓商務端、投放端、營運端每次調整都依賴工程。

## 10. 這份文件怎麼用

之後如果要再做新網站，建議：

1. 先讀這份文件，確認要不要沿用同樣的事件 contract。
2. 先把資料模型與 admin 設定架構搭起來。
3. 沿用 hanben-admin 的 tracking 檔案拆分方式。
4. 最後才把外部平台帳號資訊填進去。

如果照這份 playbook 做，新站會從一開始就具備：

- 可治理的 tracking 結構
- 可後台管理的整合能力
- 可驗證的事件鏈路
- 可逐步接通的外部平台架構

而不是每次都從「先貼一段追蹤碼」重新開始。