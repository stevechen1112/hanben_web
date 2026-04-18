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

### 後台入口

- 前台：`/`
- 後台登入：`/admin/login`

### 第三方服務現況

- ECPay：已接入付款與物流流程，但是否能完整跑通取決於環境變數與 callback 網址
- Resend：模板與發信流程已在 repo 內，正式寄送需要驗證網域
- UploadThing：後台媒體上傳依賴 `UPLOADTHING_SECRET` 與 `UPLOADTHING_APP_ID`
- Sentry：目前 env 欄位已保留，但 repo 尚未完成完整 SDK 接線

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
