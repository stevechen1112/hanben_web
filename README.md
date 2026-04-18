# Hanben Admin

漢本三代官網與後台整合專案。這個 repo 同時包含：

- 對外 storefront
- 會員帳號與購物流程
- 內部 admin CMS / 訂單 / 商品 / 媒體管理
- PostgreSQL + Prisma 資料模型
- 綠界金流 / 物流、Resend 郵件、UploadThing 媒體上傳整合

目前專案已不是初始模板，而是可直接開發與部署的電商站點骨架。

## 專案現況

目前已落地的核心模組包含：

- Storefront 首頁、商品頁、分類頁、文章列表/文章頁、聯絡頁、FAQ、品牌與政策頁
- 購物車、結帳、訂單結果頁
- 會員登入、註冊、忘記密碼、帳戶相關頁面
- Admin 後台登入與受保護區域
- 商品、分類、頁面、文章、FAQ、首頁區塊、Hero、導覽選單、公告列管理
- 訂單管理、出貨狀態與履約操作
- UploadThing 媒體庫
- Prisma seed 初始化資料
- 綠界付款與物流 webhook 路由

目前資料預設值也已和站內樣式同步，例如頂部公告列預設為金底白字。

## 技術棧

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7 + PostgreSQL
- NextAuth v5 beta
- TanStack Query / Table
- TipTap 富文本編輯器
- UploadThing
- Resend
- ECPay Payment / Logistics

## 目錄概覽

```text
src/
	app/
		(storefront)/     前台頁面
		admin/            後台頁面
		api/              API routes / webhooks
	components/
		storefront/       前台 UI
		admin/            後台 UI
		ui/               共用元件
	lib/
		actions/          Server actions
		auth.ts           驗證流程
		checkout.ts       結帳資料與驗證
		ecpay*.ts         綠界整合
		shipping.ts       運費規則
		site-settings.ts  網站設定
prisma/
	schema.prisma       資料模型
	seed.ts             初始資料
```

## 本機開發

### 需求

- Node.js 20+
- npm
- PostgreSQL

### 1. 安裝依賴

```bash
npm install
```

### 2. 建立環境變數

```bash
copy .env.example .env
```

填入至少以下欄位：

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

若要測試完整流程，還需要補齊：

- `ECPAY_*`
- `ECPAY_LOGISTICS_*`
- `UPLOADTHING_*`
- `RESEND_*`

若要啟用廣告成效回傳與 server-side purchase tracking，另可選填：

- `META_CONVERSIONS_API_ACCESS_TOKEN`
- `META_CONVERSIONS_API_TEST_EVENT_CODE`
- `META_GRAPH_API_VERSION`（預設 `v22.0`）

這些值在正式使用時建議優先填在後台 `網站設定 > 追蹤 / 廣告`；`.env` 僅作 fallback 或部署初期暫代。

### 3. 初始化資料庫

若是新環境，建議至少執行：

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

如果你是以 migration 流程管理 schema，也可以改用：

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

預設網址：`http://localhost:3000`

## Seed 後的預設資料

`npm run db:seed` 目前會建立或更新：

- `SUPER_ADMIN` 管理員
- 導覽選單與 footer
- 網站基本設定
- 頂部公告列
- 運費規則
- 商品、集合、頁面、文章、FAQ、首頁內容

預設管理員帳號：

- Email: `admin@hanben.com.tw`
- Password: `Hanben@2025!`

首次登入後應立即更換密碼，正式環境不可沿用。

## 常用指令

```bash
npm run dev            # 開發模式
npm run build          # 產生 production build
npm run build:linode   # Linode 低記憶體主機用 production build
npm run start          # 啟動 production server
npm run lint           # 執行 ESLint
npm run format         # 格式化 src 下常用檔案
npm run db:generate    # 產生 Prisma Client
npm run db:migrate     # Prisma migrate dev
npm run db:push        # 直接同步 schema 到資料庫
npm run db:studio      # 開啟 Prisma Studio
npm run db:seed        # 寫入初始資料
npm run content:replatform
```

`content:replatform` 用於重新整理或轉換既有提供素材，屬於內容搬移工具，不是一般開發流程的必要步驟。

## 重要開發注意事項

### 靜態頁與重建

這個專案有部分 storefront 頁面會在 build 時靜態產出。若你修改的是資料庫內容，但頁面本身屬於靜態輸出，必須重新 build 才會在 production server 反映。

常見情境：

- 首頁公告列或首頁區塊調整後，`npm run build` 再 `npm run start`
- 只跑 dev server 時，通常能直接看到最新資料

### Linode 部署備註

目前已驗證一台 `1 vCPU / 2 GB RAM` 的 Linode 會在預設 `next build` (Turbopack) 階段因記憶體壓力而不穩定；同一台機器改用 `npm run build:linode` 可穩定完成 build。

若你是部署到目前這台 Linode，建議流程為：

```bash
npm ci --include=dev
npm run db:generate
npx prisma db push
npm run db:seed
npm run build:linode
npm run start
```

若使用 systemd 管理服務，build 完成後改為重啟 service，而不是手動執行 `npm run start`。

### 後台入口

- 前台：`/`
- 後台登入：`/admin/login`

### 第三方服務現況

- ECPay：已接入付款與物流流程，但是否能完整跑通取決於環境變數與 callback 網址
- Resend：模板與發信流程已在 repo 內，正式寄送需要驗證網域
- UploadThing：後台媒體上傳依賴 `UPLOADTHING_SECRET` 與 `UPLOADTHING_APP_ID`
- Sentry：目前 env 欄位已保留，但 repo 尚未完成完整 SDK 接線

## Tracking / GTM

如果你想把這套做法複用到下一個網站，先讀 [TRACKING_PLAYBOOK.md](./TRACKING_PLAYBOOK.md)。這份文件整理了平台埋設、網站體質調整、後台設計、事件契約、驗證流程，以及 hanben-admin 這次的實作地圖。

如果你要實際在 GTM 容器裡接事件、建 Tag / Trigger / Variable，直接看 [GTM_IMPLEMENTATION_GUIDE.md](./GTM_IMPLEMENTATION_GUIDE.md)。

目前 storefront 已內建一層可直接上線的追蹤基礎設施：

- 就算你目前還沒有 GTM、GA4、Google Ads、Meta Pixel、Meta CAPI 等外部資訊，也可以先留白；網站不會因此壞掉，只是對應的第三方追蹤不會啟用
- 後台 `網站設定 > 追蹤 / 廣告` 會顯示目前各整合的整備狀態，方便之後逐項補齊

- 後台 `網站設定 > 追蹤 / 廣告` 可設定 `Facebook Pixel ID`、`Google Analytics ID`、`Google Tag Manager 容器 ID`、`Google Ads ID`、`Google Ads Conversion Label`、Meta CAPI Access Token 等整合參數
- 後台 `網站設定 > 追蹤 / 廣告` 也可設定 `Google Search Console 驗證碼`，網站會自動輸出驗證 meta tag
- 前台 root layout 會自動注入 Google Consent Mode 預設狀態，並顯示 Cookie 偏好橫幅
- 商品頁會送出 `view_item`
- 加入購物車會送出 `add_to_cart`
- 結帳頁會送出 `begin_checkout`
- 訂單已付款時，結果頁會送出 client-side `purchase`
- 若已填 `Google Ads ID` 與 `Google Ads Conversion Label`，已付款結果頁也會送出 Google Ads `purchase conversion`
- Google Ads enhanced conversions 目前會在 purchase conversion 同步附帶 email / phone 的 user-provided data
- Google Ads remarketing / 動態再行銷資料層目前已涵蓋商品頁、購物車、結帳、購買完成等關鍵節點
- 商品清單頁也已補上 `view_item_list` 與 list-level remarketing：目前涵蓋分類商品頁與搜尋結果商品清單
- 首頁商品模組也會送出 `view_item_list`，搜尋頁則額外送出 `view_search_results`
- 後台 `網站設定 > 追蹤 / 廣告` 也已納入這些規則：可直接管理首頁商品清單 List ID、分類頁 List ID 前綴、搜尋頁 List ID / List Name 前綴
- ECPay 付款 webhook 在訂單首次轉為 `PAID` 時，會嘗試透過 Meta Conversions API 回傳 server-side `Purchase`

補充規則：

- 若設定了 `Google Tag Manager 容器 ID`，Google 端以 GTM 為主，不再直接載入 `gtag.js`
- 若有 GTM，網站會額外推送 `google_ads_purchase` dataLayer event 與 `user_data`，方便後續直接在 GTM 內接 Google Ads conversion / enhanced conversions
- 若有 GTM，網站也會推送 `google_ads_remarketing` dataLayer event，內含 `ecomm_pagetype`、`ecomm_prodid`、`ecomm_totalvalue` 與 `retail` 商品資料，方便接動態再行銷
- 若沒有 GTM，但已填 `Google Ads ID` 與 `Conversion Label`，網站會直接用 Google tag 送出 conversion
- Meta Pixel 仍可直接由站台載入；若你也在 GTM 內配置 Meta Pixel，請避免雙重送出
- Meta Conversions API 會使用付款成功 webhook 與相同 `event_id`（`order-{orderId}-paid`）做 browser / server deduplication
- Meta CAPI 會優先讀後台設定頁的值；若後台留空，才 fallback 到 `.env`

## 部署

部署與正式環境交接細節請看 [DEPLOYMENT.md](./DEPLOYMENT.md)。

內容包含：

- Vercel 上線流程
- PostgreSQL 與 Prisma 部署步驟
- Cloudflare / DNS 注意事項
- ECPay / Resend / UploadThing 交接清單
- 上線前驗收項目

## 建議工作流程

1. 建立 `.env` 並連到本機或測試 PostgreSQL。
2. 執行 `npm run db:generate && npm run db:push && npm run db:seed`。
3. 用 `npm run dev` 驗證前台與 `/admin/login`。
4. 要驗證接近正式環境的輸出時，改用 `npm run build` + `npm run start`。

## 補充

如果你要更新資料模型，請同步檢查：

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/lib/actions/`
- 對應 admin 表單與 storefront 查詢

這個 repo 的 README 以「讓新接手的人可以直接跑起來」為目標維護；若專案功能範圍有變，請同步更新此文件。
