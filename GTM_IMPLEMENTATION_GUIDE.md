# GTM Implementation Guide

這份文件是 hanben-admin 現行 tracking 架構對應到 Google Tag Manager 的實作對照表。

目標不是介紹 GTM 基礎，而是讓接手的人可以直接照這份文件把容器接起來，知道：

- 網站目前會推哪些 `dataLayer` event
- GTM 應該建立哪些 Variable
- 每個 event 應該綁哪種 Trigger
- 哪些 Tag 應該由 GTM 接手
- 哪些資料在 GTM 裡可以直接拿來做 GA4、Google Ads、remarketing

## 1. 先理解目前網站端行為

hanben-admin 的 Google 端整合採用這個原則：

1. 若後台有填 `Google Tag Manager 容器 ID`，網站會載入 GTM。
2. 若有 GTM，Google 端事件應以 GTM 為主，不再依賴 direct `gtag.js` routing。
3. 網站仍會先整理自己的標準化 payload，再推進 `dataLayer`。
4. `purchase` 之外，網站還會額外推 `google_ads_purchase` 與 `google_ads_remarketing`，方便 GTM 直接接 Google Ads。

關鍵實作位置：

- `src/components/storefront/tracking/tracking-scripts.tsx`
- `src/components/storefront/tracking/tracking-runtime.tsx`
- `src/lib/analytics.ts`

## 2. GTM 接線總覽

GTM 端至少建這四層：

1. Consent handling
2. GA4 base + GA4 ecommerce events
3. Google Ads purchase conversion
4. Google Ads remarketing / dynamic remarketing

建議容器內的命名規則：

- Variable：`DLV - ...`
- Trigger：`CE - ...`（Custom Event）
- Tag：`GA4 - ...` / `Ads - ...`

## 3. 網站目前會推的 dataLayer events

### 3.1 Consent 類

#### `consent_default`

用途：網站初始化時推送目前解析後的 consent 狀態。

範例結構：

```json
{
  "event": "consent_default",
  "consent": {
    "analytics": false,
    "ads": false,
    "necessary": true
  }
}
```

#### `consent_update`

用途：使用者更新 Cookie 偏好後推送。

範例結構：

```json
{
  "event": "consent_update",
  "consent": {
    "analytics": true,
    "ads": false,
    "necessary": true
  },
  "analytics_storage": "granted",
  "ad_storage": "denied",
  "ad_user_data": "denied",
  "ad_personalization": "denied"
}
```

### 3.2 Page / Ecommerce 類

#### `page_view`

```json
{
  "event": "page_view",
  "page_location": "https://example.com/products/foo",
  "page_path": "/products/foo",
  "page_title": "產品頁標題"
}
```

#### `view_item`

```json
{
  "event": "view_item",
  "ecommerce": {
    "currency": "TWD",
    "value": 999,
    "items": [ ... ]
  }
}
```

#### `add_to_cart`

```json
{
  "event": "add_to_cart",
  "ecommerce": {
    "currency": "TWD",
    "value": 999,
    "items": [ ... ]
  }
}
```

#### `view_cart`

```json
{
  "event": "view_cart",
  "ecommerce": {
    "currency": "TWD",
    "value": 2997,
    "items": [ ... ]
  }
}
```

#### `view_item_list`

```json
{
  "event": "view_item_list",
  "ecommerce": {
    "currency": "TWD",
    "item_list_id": "collection:all",
    "item_list_name": "首頁",
    "value": 2997,
    "items": [ ... ]
  }
}
```

#### `view_search_results`

```json
{
  "event": "view_search_results",
  "search_term": "舒活飲",
  "product_count": 4,
  "article_count": 2
}
```

#### `begin_checkout`

```json
{
  "event": "begin_checkout",
  "ecommerce": {
    "currency": "TWD",
    "value": 2997,
    "items": [ ... ]
  }
}
```

#### `purchase`

```json
{
  "event": "purchase",
  "event_id": "order-123-paid",
  "ecommerce": {
    "currency": "TWD",
    "transaction_id": "HANBEN-20260418-0001",
    "value": 2997,
    "items": [ ... ]
  }
}
```

### 3.3 Google Ads 專用類

#### `google_ads_purchase`

這是網站額外提供給 GTM 用來接 Google Ads conversion / enhanced conversions 的 event。

```json
{
  "event": "google_ads_purchase",
  "google_ads": {
    "send_to": "AW-123456789/AbCdEfGhIjk",
    "value": 2997,
    "currency": "TWD",
    "transaction_id": "HANBEN-20260418-0001"
  },
  "user_data": {
    "email": "user@example.com",
    "phone_number": "+886912345678",
    "address": {
      "city": "Taipei",
      "country": "TW"
    }
  }
}
```

注意：

- `user_data` 只有在 ads consent granted 時才可能存在。
- 若站內未收齊 email / phone，`user_data` 可能為空。

#### `google_ads_remarketing`

這是網站額外提供給 GTM 用來接 dynamic remarketing 的 event。

```json
{
  "event": "google_ads_remarketing",
  "source_event": "view_item",
  "google_ads_remarketing": {
    "ecomm_pagetype": "product",
    "ecomm_prodid": ["variant-id-1"],
    "ecomm_totalvalue": 999,
    "google_business_vertical": "retail",
    "items": [ ... ]
  }
}
```

`source_event` 可能值：

- `view_item`
- `add_to_cart`
- `view_cart`
- `view_item_list`
- `begin_checkout`
- `purchase`

`ecomm_pagetype` 目前可能值：

- `product`
- `cart`
- `checkout`
- `purchase`
- `category`
- `searchresults`
- `home`

## 4. GTM 先建立哪些 Data Layer Variables

以下是最建議先建立的一批 DLV。

### 4.1 GA4 / ecommerce 通用

- `DLV - ecommerce`
  - Data Layer Variable Name: `ecommerce`
- `DLV - ecommerce.currency`
  - `ecommerce.currency`
- `DLV - ecommerce.value`
  - `ecommerce.value`
- `DLV - ecommerce.transaction_id`
  - `ecommerce.transaction_id`
- `DLV - ecommerce.item_list_id`
  - `ecommerce.item_list_id`
- `DLV - ecommerce.item_list_name`
  - `ecommerce.item_list_name`
- `DLV - ecommerce.items`
  - `ecommerce.items`

### 4.2 Page view

- `DLV - page_location`
  - `page_location`
- `DLV - page_path`
  - `page_path`
- `DLV - page_title`
  - `page_title`

### 4.3 Search

- `DLV - search_term`
  - `search_term`
- `DLV - product_count`
  - `product_count`
- `DLV - article_count`
  - `article_count`

### 4.4 Google Ads purchase

- `DLV - google_ads`
  - `google_ads`
- `DLV - google_ads.send_to`
  - `google_ads.send_to`
- `DLV - google_ads.value`
  - `google_ads.value`
- `DLV - google_ads.currency`
  - `google_ads.currency`
- `DLV - google_ads.transaction_id`
  - `google_ads.transaction_id`
- `DLV - user_data`
  - `user_data`

### 4.5 Google Ads remarketing

- `DLV - remarketing`
  - `google_ads_remarketing`
- `DLV - remarketing.ecomm_pagetype`
  - `google_ads_remarketing.ecomm_pagetype`
- `DLV - remarketing.ecomm_prodid`
  - `google_ads_remarketing.ecomm_prodid`
- `DLV - remarketing.ecomm_totalvalue`
  - `google_ads_remarketing.ecomm_totalvalue`
- `DLV - remarketing.items`
  - `google_ads_remarketing.items`
- `DLV - source_event`
  - `source_event`

### 4.6 Consent

- `DLV - consent`
  - `consent`
- `DLV - consent.analytics`
  - `consent.analytics`
- `DLV - consent.ads`
  - `consent.ads`
- `DLV - ad_storage`
  - `ad_storage`
- `DLV - analytics_storage`
  - `analytics_storage`

## 5. GTM 要建立哪些 Triggers

全部建成 Custom Event Trigger 即可。

### 5.1 基本事件 Triggers

- `CE - page_view`
  - Event name: `page_view`
- `CE - view_item`
  - Event name: `view_item`
- `CE - add_to_cart`
  - Event name: `add_to_cart`
- `CE - view_cart`
  - Event name: `view_cart`
- `CE - view_item_list`
  - Event name: `view_item_list`
- `CE - view_search_results`
  - Event name: `view_search_results`
- `CE - begin_checkout`
  - Event name: `begin_checkout`
- `CE - purchase`
  - Event name: `purchase`

### 5.2 Google Ads 專用 Triggers

- `CE - google_ads_purchase`
  - Event name: `google_ads_purchase`
- `CE - google_ads_remarketing`
  - Event name: `google_ads_remarketing`

### 5.3 Consent Triggers

- `CE - consent_default`
  - Event name: `consent_default`
- `CE - consent_update`
  - Event name: `consent_update`

## 6. GTM 要建立哪些 Tags

## 6.1 GA4 Configuration Tag

Tag 類型：Google Tag 或 GA4 Configuration

建議：

- 以 GTM 容器中統一管理 Google tag / GA4 Configuration
- 關閉自動 page_view，因為網站已自行推送 `page_view`

建議設定：

- Measurement ID：你的 `G-XXXXXXXXXX`
- Send a page view event when this configuration loads：關閉
- Trigger：All Pages

## 6.2 GA4 Event Tags

以下事件可各建一個 GA4 Event Tag，event name 與網站推送的事件名稱一致。

### `page_view`

- Tag name：`GA4 - page_view`
- Event name：`page_view`
- Parameters：
  - `page_location` = `{{DLV - page_location}}`
  - `page_path` = `{{DLV - page_path}}`
  - `page_title` = `{{DLV - page_title}}`
- Trigger：`CE - page_view`

### `view_item`

- Tag name：`GA4 - view_item`
- Event name：`view_item`
- Parameters：
  - `currency` = `{{DLV - ecommerce.currency}}`
  - `value` = `{{DLV - ecommerce.value}}`
  - `items` = `{{DLV - ecommerce.items}}`
- Trigger：`CE - view_item`

### `add_to_cart`

- Tag name：`GA4 - add_to_cart`
- Event name：`add_to_cart`
- Parameters：
  - `currency` = `{{DLV - ecommerce.currency}}`
  - `value` = `{{DLV - ecommerce.value}}`
  - `items` = `{{DLV - ecommerce.items}}`
- Trigger：`CE - add_to_cart`

### `view_cart`

- Tag name：`GA4 - view_cart`
- Event name：`view_cart`
- Parameters：
  - `currency` = `{{DLV - ecommerce.currency}}`
  - `value` = `{{DLV - ecommerce.value}}`
  - `items` = `{{DLV - ecommerce.items}}`
- Trigger：`CE - view_cart`

### `view_item_list`

- Tag name：`GA4 - view_item_list`
- Event name：`view_item_list`
- Parameters：
  - `currency` = `{{DLV - ecommerce.currency}}`
  - `value` = `{{DLV - ecommerce.value}}`
  - `item_list_id` = `{{DLV - ecommerce.item_list_id}}`
  - `item_list_name` = `{{DLV - ecommerce.item_list_name}}`
  - `items` = `{{DLV - ecommerce.items}}`
- Trigger：`CE - view_item_list`

### `view_search_results`

- Tag name：`GA4 - view_search_results`
- Event name：`view_search_results`
- Parameters：
  - `search_term` = `{{DLV - search_term}}`
  - `product_count` = `{{DLV - product_count}}`
  - `article_count` = `{{DLV - article_count}}`
- Trigger：`CE - view_search_results`

### `begin_checkout`

- Tag name：`GA4 - begin_checkout`
- Event name：`begin_checkout`
- Parameters：
  - `currency` = `{{DLV - ecommerce.currency}}`
  - `value` = `{{DLV - ecommerce.value}}`
  - `items` = `{{DLV - ecommerce.items}}`
- Trigger：`CE - begin_checkout`

### `purchase`

- Tag name：`GA4 - purchase`
- Event name：`purchase`
- Parameters：
  - `currency` = `{{DLV - ecommerce.currency}}`
  - `value` = `{{DLV - ecommerce.value}}`
  - `transaction_id` = `{{DLV - ecommerce.transaction_id}}`
  - `items` = `{{DLV - ecommerce.items}}`
- Trigger：`CE - purchase`

## 6.3 Google Ads Conversion Tag

建議吃網站推的 `google_ads_purchase`，不要自己在 GTM 重新拼交易值。

Tag 類型：Google Ads Conversion Tracking

設定方式：

- Conversion ID：填你的 Ads Conversion ID
- Conversion Label：填對應 Purchase conversion label
- Conversion Value：`{{DLV - google_ads.value}}`
- Currency Code：`{{DLV - google_ads.currency}}`
- Transaction ID：`{{DLV - google_ads.transaction_id}}`
- User-provided Data：若 GTM 介面支援 enhanced conversions / user-provided data，可使用 `{{DLV - user_data}}`
- Trigger：`CE - google_ads_purchase`

注意：

- 若你用 GTM 接這個 Tag，站內 direct Google Ads conversion 已在有 GTM 時停止 direct send，不會重複。
- `send_to` 已在 dataLayer 中提供，但 GTM Ads Conversion Tag 通常仍會以 Tag 設定頁中的 Conversion ID / Label 為準。

## 6.4 Google Ads Remarketing Tag

Tag 類型：Google Ads Remarketing

可直接從 `google_ads_remarketing` 事件取值。

建議參數對應：

- `ecomm_pagetype` = `{{DLV - remarketing.ecomm_pagetype}}`
- `ecomm_prodid` = `{{DLV - remarketing.ecomm_prodid}}`
- `ecomm_totalvalue` = `{{DLV - remarketing.ecomm_totalvalue}}`
- `items` = `{{DLV - remarketing.items}}`
- `google_business_vertical` = 固定 `retail`

Trigger：`CE - google_ads_remarketing`

若你只想針對特定來源事件發送 remarketing，可再加條件：

- `{{DLV - source_event}} equals view_item`
- `{{DLV - source_event}} equals add_to_cart`
- `{{DLV - source_event}} equals purchase`

但一般情況下，直接用全部 `google_ads_remarketing` 事件即可。

## 6.5 Consent Tags

如果你的 GTM 容器要更細緻處理 consent，可建立自訂 tag 或依 GTM Consent Settings 使用：

- `consent_default`
- `consent_update`

但這個專案目前已由網站端先呼叫 `gtag('consent', ...)` 處理 Google Consent Mode。也就是說，GTM 端通常只需確保 Tag 的 Consent Settings 與網站策略一致，不一定需要再自建額外 consent tag。

## 7. 推薦的 GTM 最小實作組合

如果你想先快速上線，最低限度建這些就夠：

1. GA4 Configuration
2. `GA4 - page_view`
3. `GA4 - view_item`
4. `GA4 - add_to_cart`
5. `GA4 - begin_checkout`
6. `GA4 - purchase`
7. `Ads - purchase conversion`
8. `Ads - remarketing`

如果要把報表做完整，再補：

1. `GA4 - view_item_list`
2. `GA4 - view_search_results`
3. `GA4 - view_cart`

## 8. GTM Preview 驗證清單

至少檢查這些：

### 8.1 首頁

- 是否看到 `page_view`
- 是否看到首頁商品模組的 `view_item_list`
- `ecommerce.item_list_id` 是否為後台設定值

### 8.2 分類頁

- 是否看到 `view_item_list`
- `ecommerce.item_list_id` 是否像 `collection:slug`

### 8.3 搜尋頁

- 是否看到 `view_search_results`
- 是否看到 `view_item_list`
- `search_term`、`product_count`、`article_count` 是否正確

### 8.4 商品頁

- 是否看到 `view_item`
- 是否同時看到 `google_ads_remarketing`
- `ecomm_pagetype` 是否為 `product`

### 8.5 加入購物車

- 是否看到 `add_to_cart`
- 是否同時看到 `google_ads_remarketing`

### 8.6 結帳頁

- 是否看到 `begin_checkout`
- remarketing 的 `ecomm_pagetype` 是否為 `checkout`

### 8.7 完成購買

- 是否看到 `purchase`
- 是否看到 `google_ads_purchase`
- 是否看到 `google_ads_remarketing`
- `transaction_id` 是否穩定
- `user_data` 是否只在 ads consent granted 時出現

## 9. 常見實作錯誤

### 9.1 GTM 與 direct tag 重複送出

hanben-admin 的設計已避免 Google 端在有 GTM 時 direct 送 conversion，但若你又手動在站上加其他 Google script，仍可能重複。

### 9.2 GTM 裡自己重拼 ecommerce payload

這通常會讓資料不一致。建議直接吃網站已推好的 `ecommerce` / `google_ads` / `google_ads_remarketing`。

### 9.3 忽略 consent 狀態

若 GTM Tag 未設定好 Consent Settings，可能出現網站端不想送、但 GTM 還是送的情況。

### 9.4 沒把清單命名規則穩定化

若後台調整了 list_id prefix，但 GTM / GA4 報表還寫死舊規則，資料分析會直接斷掉。

## 10. 建議與 playbook 搭配使用

如果你是第一次接這套架構，建議先讀：

- `TRACKING_PLAYBOOK.md`

看完 playbook 再回到這份文件實作 GTM，會比較清楚哪些是網站責任、哪些是 GTM 責任。