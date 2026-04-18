# 漢本三代 (hanben.com.tw) 完整前後台規劃文件

> 基於前端復刻專案基礎，為漢本三代建立一套完整可獨立運作的電商管理後台與前台平台。  
> 目標：替換 Shopify，以復刻網站為基礎轉換為可自行維護的開源平台。

---

## 一、前端網站現況分析

### 1.1 平台概況

| 項目 | 說明 |
|------|------|
| 目前平台 | Shopify (Dawn theme) |
| Shopify 店鋪 | `3fw661-x1.myshopify.com` |
| 語言 | 繁體中文 (zh-TW) |
| 字體 | Noto Serif TC（仿宋體） |
| 色系 | 主色 `#B72020`（紅）、漸層 `#0a0e88 → #00b1ce` |
| RWD | Desktop / Tablet / Mobile 三斷點 |

### 1.2 頁面清單（共 20 頁）

| 類型 | URL 路徑 | 中文名稱 | SSIM |
|------|----------|----------|------|
| 首頁 | `/` | 首頁 | 0.767 |
| 商品 | `/products/漢本三代-活力包` | 活力包 15 包裝 | 0.808 |
| 商品 | `/products/漢本三代-活力包-15包裝-2組` | 活力包 2 組 | 0.808 |
| 商品 | `/products/漢本三代-活力包-15包裝-3組` | 活力包 3 組 | 0.807 |
| 商品 | `/products/漢本三代-活力包-15包裝-4組` | 活力包 4 組 | 0.808 |
| 商品 | `/products/漢本三代-活力包-5包口味體驗組/` | 活力包 5 包體驗組 | 0.806 |
| 集合 | `/collections/frontpage/` | 精選商品 | 0.869 |
| 靜態頁 | `/pages/about/` | 關於漢本 | 0.697 |
| 靜態頁 | `/pages/contact/` | 聯絡我們 | 0.817 |
| 靜態頁 | `/pages/qa/` | 常見問題 | 0.811 |
| 靜態頁 | `/pages/news/` | 最新消息 | 0.823 |
| 靜態頁 | `/pages/certification/` | 安心保障 | 0.730 |
| 靜態頁 | `/pages/chinese-herbal-guide/` | 漢方小百科 | 0.735 |
| 靜態頁 | `/pages/養護知識/` | 養護知識 | 0.821 |
| 靜態頁 | `/pages/退換貨說明/` | 退換貨說明 | 0.750 |
| 靜態頁 | `/pages/sore-daily-life/` | 痠痛日常 | 0.823 |
| 靜態頁 | `/pages/sore-daily-life-articles/` | 痠痛日常文章列表 | 0.811 |
| 部落格 | `/blogs/最新消息/` | 最新消息列表 | 0.637 |
| 部落格 | `/blogs/sore-daily-life/` | 痠痛日常部落格 | 0.879 |
| 文章 | `/blogs/最新消息/歡慶測試歡慶測試歡慶測試/` | 測試文章 | 0.711 |

### 1.3 前端功能清單

#### 全站共用元件
- **公告欄（Announcement Bar）**：可自訂文字橫幅
- **Header 導覽列**：Logo + 8 個選單項目 + 搜尋 + 會員 + 購物車
- **Mobile 漢堡選單**：slide-out drawer
- **Cart Drawer**：側滑出式購物車
- **會員 Popover**：登入、註冊、訂單查詢
- **Footer**：品牌語、免費電話 0800-000-848、地址、政策連結
- **搜尋 Modal**：全站商品搜尋

#### 導覽選單結構
```
首頁
關於漢本三代
最新消息
養護知識 (external → blog.hanben.com.tw)
安心保障
常見問題
退換貨說明
聯絡我們
```

#### 首頁 Sections（7 個區塊）
1. **Hero 輪播**：多張 slide，含標題、副標、CTA 按鈕
2. **品牌故事區塊**：文字 + 影片嵌入
3. **品牌統計數字**：4 張卡片，購買人數、使用者數、滿意度等
4. **商品展示區塊**：商品卡片列表
5. **品牌核心價值**：icon + 文字格式
6. **品牌影片區**：YouTube 影片
7. **功能 icon grid**：多張服務 icon 欄

#### 商品詳情頁
- 商品圖片 gallery（多圖 + zoom）
- 商品名稱、描述（富文字）
- 定價 + 促銷價（加刪線比較價）
- 規格選擇器、數量 +/- 按鈕
- 加入購物車按鈕
- 庫存狀態顯示
- Sticky Add-to-Cart（滾動時固定按鈕）
- BOGOS（Buy One Get One）促銷提示
- 相關推薦（related products）

#### 商品規格（5 SKU，同商品不同組合）

| 變體名稱 | 促銷價 | 定價 | Product ID |
|----------|--------|------|------------|
| 5 包口味體驗組 | $550 | $864 | - |
| 15 包裝 | $2,299 | $2,599 | 9196937249007 |
| 15 包裝二組 | $3,899 | $5,198 | - |
| 15 包裝三組 | $5,666 | $7,797 | - |
| 15 包裝四組 | $6,999 | $10,396 | - |

#### 聯絡表單欄位
- 姓名 (text)
- Email (email)
- 電話 (tel)
- 訊息內容 (textarea)

#### QA 頁面
- 手風琴（accordion）展開、收合，Q&A 8+ 組

#### 第三方整合
- **PushDaddy Chat** → 客服聊天 widget
- **Facebook Messenger Support** → FB 對話元件
- **BOGOS** → 買贈促銷、促銷引擎
- **AKO Commerce** → 再購、推薦引擎
- **Facebook Pixel**（ID: 863478774420303）
- **Google Analytics**（GT-KVN7BBKM）

---

## 二、系統架構

### 2.1 技術棧

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│  Next.js 15 (App Router) + TypeScript                   │
│  Tailwind CSS v4 + shadcn/ui                            │
│  Noto Serif TC 字體                                     │
├─────────────────────────────────────────────────────────┤
│                      Backend                            │
│  Next.js API Routes (Server Actions)                    │
│  Prisma ORM v7 + @prisma/adapter-pg                     │
│  PostgreSQL (Docker port 5433)                          │
│  NextAuth.js v5（管理員 + 會員認證）                    │
│  Uploadthing / S3（圖片、媒體上傳）                     │
├─────────────────────────────────────────────────────────┤
│                      Payment                            │
│  綠界 ECPay（信用卡、ATM、超商）                        │
│  LINE Pay（選配）                                       │
├─────────────────────────────────────────────────────────┤
│                   Infrastructure                        │
│  Vercel（部署）or VPS（Docker）                         │
│  Cloudflare（CDN + DNS）                                │
│  Resend / SendGrid（Email）                             │
└─────────────────────────────────────────────────────────┘
```

### 2.2 專案目錄結構

```
hanben-admin/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (storefront)/         # 前台頁面
│   │   │   ├── page.tsx          # 首頁
│   │   │   ├── products/
│   │   │   ├── collections/
│   │   │   ├── blogs/
│   │   │   ├── pages/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   └── account/
│   │   ├── admin/                # 後台管理
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── content/
│   │   │   ├── blog/
│   │   │   ├── site-settings/
│   │   │   ├── promotions/
│   │   │   ├── analytics/
│   │   │   ├── shipping/
│   │   │   └── contact/
│   │   └── api/
│   │       ├── auth/
│   │       ├── checkout/
│   │       ├── payment/
│   │       ├── upload/
│   │       └── webhooks/
│   ├── components/
│   │   ├── storefront/           # 前台元件
│   │   └── admin/                # 後台元件
│   └── lib/
│       ├── db.ts
│       ├── auth.ts
│       ├── ecpay-common.ts
│       ├── ecpay.ts
│       ├── ecpay-logistics.ts
│       ├── email.ts
│       └── upload.ts
├── public/
│   └── uploads/
└── .env
```

---

## 三、資料庫設計（ERD）

### 3.1 核心資料模型

```
Product ──< Variant
Product ──< ProductImage
Product >──< Collection（透過 CollectionProduct）

Customer ──< Order ──< OrderItem >── Variant
Customer ──< Address
Customer ──< Cart ──< CartItem >── Variant

BlogChannel ──< BlogArticle

HomepageSection
HeroSlide
Page
FaqItem
SiteSetting
NavigationMenu ──< NavigationItem
AnnouncementBar
Promotion
ShippingRule
ContactSubmission
MediaFile
AuditLog
```

### 3.2 完整 Prisma Schema

```prisma
// ==================== 認證與管理員 ====================

model AdminUser {
  id            String     @id @default(cuid())
  email         String     @unique
  passwordHash  String
  name          String
  role          AdminRole  @default(EDITOR)
  auditLogs     AuditLog[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  EDITOR
}

model Customer {
  id                 String    @id @default(cuid())
  email              String    @unique
  passwordHash       String
  firstName          String?
  lastName           String?
  phone              String?
  acceptsMarketing   Boolean   @default(false)
  addresses          Address[]
  orders             Order[]
  carts              Cart[]
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
}

model Address {
  id            String   @id @default(cuid())
  customerId    String
  customer      Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  label         String?  // 家裡、公司
  recipientName String
  phone         String
  zipCode       String
  city          String
  district      String
  addressLine   String
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// ==================== 商品系統 ====================

model Product {
  id             String              @id @default(cuid())
  title          String
  slug           String              @unique
  description    String?             @db.Text
  bodyHtml       String?             @db.Text
  vendor         String?
  productType    String?
  status         ProductStatus       @default(DRAFT)
  seoTitle       String?
  seoDescription String?
  tags           String[]
  variants       Variant[]
  images         ProductImage[]
  collections    CollectionProduct[]
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt
}

enum ProductStatus {
  ACTIVE
  DRAFT
  ARCHIVED
}

model Variant {
  id             String      @id @default(cuid())
  productId      String
  product        Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  title          String
  sku            String?     @unique
  price          Decimal     @db.Decimal(10, 2)
  compareAtPrice Decimal?    @db.Decimal(10, 2)
  costPrice      Decimal?    @db.Decimal(10, 2)
  inventory      Int         @default(0)
  trackInventory Boolean     @default(true)
  weight         Decimal?    @db.Decimal(8, 2)
  weightUnit     String      @default("g")
  sortOrder      Int         @default(0)
  isActive       Boolean     @default(true)
  orderItems     OrderItem[]
  cartItems      CartItem[]
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model ProductImage {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  altText   String?
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
}

// ==================== 集合、分類 ====================

model Collection {
  id          String              @id @default(cuid())
  title       String
  slug        String              @unique
  description String?             @db.Text
  imageUrl    String?
  sortOrder   Int                 @default(0)
  isActive    Boolean             @default(true)
  products    CollectionProduct[]
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
}

model CollectionProduct {
  id           String     @id @default(cuid())
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  productId    String
  product      Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  sortOrder    Int        @default(0)

  @@unique([collectionId, productId])
}

// ==================== 內容管理（CMS）====================

model Page {
  id             String   @id @default(cuid())
  title          String
  slug           String   @unique
  bodyHtml       String   @db.Text
  seoTitle       String?
  seoDescription String?
  isPublished    Boolean  @default(false)
  template       String   @default("default") // default, contact, qa
  sortOrder      Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model BlogChannel {
  id          String        @id @default(cuid())
  title       String
  slug        String        @unique
  description String?
  articles    BlogArticle[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model BlogArticle {
  id             String      @id @default(cuid())
  channelId      String
  channel        BlogChannel @relation(fields: [channelId], references: [id], onDelete: Cascade)
  title          String
  slug           String
  excerpt        String?     @db.Text
  bodyHtml       String      @db.Text
  featureImage   String?
  author         String?
  tags           String[]
  isPublished    Boolean     @default(false)
  publishedAt    DateTime?
  seoTitle       String?
  seoDescription String?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@unique([channelId, slug])
}

model FaqItem {
  id        String   @id @default(cuid())
  question  String
  answer    String   @db.Text
  category  String?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ==================== 首頁區塊管理 ====================

model HomepageSection {
  id          String   @id @default(cuid())
  sectionType String   // hero_slider, brand_story, stats_section, product_showcase, brand_values, video_section, icon_grid
  title       String?
  subtitle    String?
  content     Json
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model HeroSlide {
  id           String   @id @default(cuid())
  title        String?
  subtitle     String?
  imageDesktop String
  imageMobile  String?
  ctaText      String?
  ctaLink      String?
  sortOrder    Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// ==================== 網站設定 ====================

model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   @db.Text
  type      String   @default("text") // text, html, image, json, boolean
  group     String   // general, header, footer, seo, social, contact
  label     String
  updatedAt DateTime @updatedAt
}

model NavigationMenu {
  id       String           @id @default(cuid())
  location String           @unique // header, footer
  items    NavigationItem[]
  updatedAt DateTime        @updatedAt
}

model NavigationItem {
  id         String          @id @default(cuid())
  menuId     String
  menu       NavigationMenu  @relation(fields: [menuId], references: [id], onDelete: Cascade)
  parentId   String?
  parent     NavigationItem? @relation("SubItems", fields: [parentId], references: [id], onDelete: SetNull)
  children   NavigationItem[] @relation("SubItems")
  title      String
  url        String
  isExternal Boolean         @default(false)
  sortOrder  Int             @default(0)
}

model AnnouncementBar {
  id        String   @id @default(cuid())
  text      String
  link      String?
  bgColor   String   @default("#B72020")
  textColor String   @default("#FFFFFF")
  isActive  Boolean  @default(true)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ==================== 購物車 & 訂單 ====================

model Cart {
  id         String     @id @default(cuid())
  customerId String?
  customer   Customer?  @relation(fields: [customerId], references: [id])
  sessionId  String?    @unique
  items      CartItem[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  variantId String
  variant   Variant  @relation(fields: [variantId], references: [id])
  quantity  Int
  createdAt DateTime @default(now())

  @@unique([cartId, variantId])
}

model Order {
  id               String         @id @default(cuid())
  orderNumber      String         @unique
  customerId       String?
  customer         Customer?      @relation(fields: [customerId], references: [id])
  email            String
  phone            String?
  status           OrderStatus    @default(PENDING)
  paymentStatus    PaymentStatus  @default(UNPAID)
  shippingStatus   ShippingStatus @default(UNFULFILLED)
  subtotal         Decimal        @db.Decimal(10, 2)
  shippingFee      Decimal        @db.Decimal(10, 2) @default(0)
  discountAmount   Decimal        @db.Decimal(10, 2) @default(0)
  total            Decimal        @db.Decimal(10, 2)
  note             String?        @db.Text
  // 收件資料（snapshot）
  shippingName     String
  shippingPhone    String
  shippingZip      String
  shippingCity     String
  shippingDistrict String
  shippingAddress  String
  // 付款資料
  paymentMethod    String?        // ecpay_credit, ecpay_atm, ecpay_cvs, line_pay
  paymentRef       String?        // 綠界交易編號
  paidAt           DateTime?
  // 出貨資料
  shippingMethod   String?        // home_tcat, home_ecan, cvs_fami, cvs_unimart, cvs_hilife
  logisticsId      String?        // 綠界 AllPayLogisticsID
  trackingNumber   String?
  cvsStoreId       String?
  cvsStoreName     String?
  cvsStoreAddress  String?
  shippedAt        DateTime?
  deliveredAt      DateTime?
  // 取消、退貨
  cancelledAt      DateTime?
  cancelReason     String?
  items            OrderItem[]
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  UNPAID
  PAID
  PARTIALLY_REFUNDED
  REFUNDED
  FAILED
}

enum ShippingStatus {
  UNFULFILLED
  PARTIALLY_FULFILLED
  FULFILLED
  RETURNED
}

model OrderItem {
  id           String  @id @default(cuid())
  orderId      String
  order        Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variantId    String
  variant      Variant @relation(fields: [variantId], references: [id])
  productTitle String
  variantTitle String
  sku          String?
  quantity     Int
  unitPrice    Decimal @db.Decimal(10, 2)
  total        Decimal @db.Decimal(10, 2)
}

// ==================== 促銷系統 ====================

model Promotion {
  id              String        @id @default(cuid())
  name            String
  type            PromotionType
  code            String?       @unique
  discountType    DiscountType
  discountValue   Decimal       @db.Decimal(10, 2)
  minOrderAmount  Decimal?      @db.Decimal(10, 2)
  maxUses         Int?
  usedCount       Int           @default(0)
  startAt         DateTime
  endAt           DateTime?
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
}

enum PromotionType {
  COUPON_CODE   // 手動輸入折扣碼
  AUTOMATIC     // 自動套用
  BUY_X_GET_Y   // 買 X 送 Y（BOGOS）
}

enum DiscountType {
  PERCENTAGE    // 打折比例（%）
  FIXED_AMOUNT  // 固定金額扣除
  FREE_SHIPPING // 免運
}

// ==================== 運費規則 ====================

model ShippingRule {
  id               String   @id @default(cuid())
  name             String   // "黑貓宅急便 - 常溫 - 本縣市"
  shippingMethod   String   // home_tcat, cvs_fami, cvs_unimart, cvs_hilife
  logisticsType    String   // Home, CVS
  logisticsSubType String   // TCAT, ECAN, FAMI, UNIMART, HILIFE
  temperature      String?  // 0001, 0002, 0003（宅配）
  baseFee          Decimal  @db.Decimal(10, 2)
  freeShippingMin  Decimal? @db.Decimal(10, 2) // 滿額免運門檻（null = 不免運）
  codFee           Decimal? @db.Decimal(10, 2) // 代收貨款手續費
  isActive         Boolean  @default(true)
  sortOrder        Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

// ==================== 聯絡表單 ====================

model ContactSubmission {
  id        String    @id @default(cuid())
  name      String
  email     String
  phone     String?
  message   String    @db.Text
  isRead    Boolean   @default(false)
  repliedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

// ==================== 媒體庫 ====================

model MediaFile {
  id        String   @id @default(cuid())
  filename  String
  url       String
  mimeType  String
  size      Int      // bytes
  width     Int?
  height    Int?
  altText   String?
  folder    String   @default("/")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ==================== 稽核日誌 ====================

model AuditLog {
  id        String    @id @default(cuid())
  adminId   String
  admin     AdminUser @relation(fields: [adminId], references: [id])
  action    String    // CREATE, UPDATE, DELETE
  entity    String    // Product, Order, Customer, etc.
  entityId  String
  changes   Json?
  ipAddress String?
  createdAt DateTime  @default(now())
}
```

---

## 四、後台功能模組

### 4.1 Dashboard 儀表板

| 指標 | 說明 |
|------|------|
| 今日營收 | 今日已付款訂單總額 |
| 月份營收 | 當月累積 |
| 待出貨訂單數 | 已付款未出貨 |
| 低庫存警示 | 庫存 < 閾值的 variant |
| 新客戶數 | 本週新註冊 |
| 未讀聯絡訊息 | 待回覆表單 |
| 營收趨勢圖 | 近 30 天折線圖 |
| 熱銷商品表 | Top 5 商品 by 銷量 |

### 4.2 商品管理

```
/admin/products              → 商品列表（搜尋、篩選、批次操作）
/admin/products/new          → 新增商品
/admin/products/[id]         → 編輯商品
/admin/collections           → 集合管理
/admin/collections/[id]      → 編輯集合（含商品排序、關聯）
```

**商品編輯頁功能**
- 標題、Slug（自動生成）
- 富文字編輯器（TipTap）→ 商品描述
- 圖片上傳（多圖排序、最多 10 張）
- 變體管理表格（增刪、SKU、價格、庫存、重量）
- SEO 設定（title, description）
- 狀態（上架、草稿、封存）
- 標籤管理

### 4.3 訂單管理

```
/admin/orders                → 訂單列表（多狀態篩選）
/admin/orders/[id]           → 訂單詳情
```

**訂單詳情頁功能**
- 訂單摘要（金額明細、計算）
- 客戶資料
- 收件資料
- 付款狀態更新
- 出貨操作（填入物流單號）
- 訂單備註
- 退款操作（全額、部分）
- 訂單狀態時間軸（視覺化歷程）

### 4.4 客戶管理

```
/admin/customers             → 客戶列表
/admin/customers/[id]        → 客戶詳情（含歷史訂單）
```

### 4.5 內容管理

```
/admin/content/pages         → 靜態頁面列表
/admin/content/pages/[id]    → 編輯頁面（富文字）
/admin/content/faq           → FAQ 管理（拖拉排序）
/admin/content/faq/[id]      → 編輯 Q&A
```

**預設靜態頁面（10 個）**
- 關於漢本（`about`）
- 聯絡我們（`contact`）→ 聯絡表單模板
- 常見問題（`qa`）→ 渲染 FAQ 資料
- 最新消息（`news`）
- 安心保障（`certification`）
- 漢方小百科（`chinese-herbal-guide`）
- 養護知識
- 痠痛日常（`sore-daily-life`）
- 痠痛日常文章列表（`sore-daily-life-articles`）
- 退換貨說明

### 4.6 部落格管理

```
/admin/blog/channels         → 部落格頻道管理
/admin/blog/articles         → 文章列表
/admin/blog/articles/new     → 新增文章
/admin/blog/articles/[id]    → 編輯文章
```

**部落格頻道（兩個）**
- 最新消息（`最新消息`）
- 痠痛日常（`sore-daily-life`）

### 4.7 網站設定

```
/admin/site-settings/general      → 網站名稱、Logo、Favicon、品牌色系
/admin/site-settings/navigation   → 導覽選單編輯（header / footer）
/admin/site-settings/homepage     → 首頁區塊管理（7 個 sections）
/admin/site-settings/announcement → 公告欄管理
/admin/site-settings/seo          → 全站 SEO 設定
/admin/site-settings/social       → 社群連結、Pixel、GA 設定
/admin/site-settings/contact      → 客服電話、地址、Email
```

### 4.8 促銷管理

```
/admin/promotions            → 促銷活動列表
/admin/promotions/new        → 新增促銷
/admin/promotions/[id]       → 編輯促銷
```

**促銷類型**
- 折扣碼（手動輸入、有效期、使用次數上限）
- 自動折扣（滿額折扣、滿額免運）
- 買 X 送 Y（仿 BOGOS 功能）

### 4.9 運費設定

```
/admin/shipping              → 運費規則管理
```

**運費規則**
- 黑貓宅急便（`TCAT`）：依溫層、距離、規格計價，可設滿額免運
- 超商取貨（`FAMI`、`UNIMART`、`HILIFE`）：固定費率或滿額免運
- 代收貨款（貨到付款）：額外手續費設定
- 運費計算邏輯：根據 `shippingMethod` 查詢對應費率

### 4.10 聯絡表單管理

```
/admin/contact               → 表單列表（未讀、已讀、已回覆 tab）
/admin/contact/[id]          → 表單詳情及回覆
```

### 4.11 媒體庫

```
/admin/media                 → 圖片、檔案管理（資料夾、搜尋、批次刪除）
```

---

## 五、前台頁面渲染

### 5.1 路由對照

| 前台路由 | 功能 | 資料來源 |
|----------|------|----------|
| `/` | 首頁 | HomepageSection + HeroSlide |
| `/products/[slug]` | 商品詳情 | Product + Variant |
| `/collections/[slug]` | 商品集合 | Collection + Products |
| `/pages/[slug]` | 靜態頁面 | Page |
| `/blogs/[channel]/` | 部落格頻道 | BlogChannel + BlogArticle |
| `/blogs/[channel]/[slug]` | 文章詳情 | BlogArticle |
| `/cart` | 購物車 | Cart + CartItem |
| `/checkout` | 結帳 | Order creation |
| `/account` | 會員中心 | Customer |
| `/account/orders` | 訂單列表 | Order |
| `/account/orders/[id]` | 訂單詳情 | Order + OrderItem |
| `/search` | 搜尋結果 | Product full-text search |

### 5.2 結帳流程

```
購物車 → 登入/訪客結帳 → 收件資料 → 送貨方式 → 付款方式 → 確認訂單 → 付款 → 完成
  ↑
  Cart Drawer（AJAX 更新）          綠界 ECPay 跳轉付款頁
```

### 5.3 會員功能

- 註冊、登入（Email + 密碼）
- 忘記密碼（Email 重設）
- 個人資料編輯
- 收件地址管理（多組）
- 訂單查詢、追蹤
- 行銷訂閱管理

---

## 六、金流整合 — 綠界 ECPay

### 6.1 支援付款方式

| 方式 | 綠界參數（ChoosePayment） | 說明 |
|------|--------------------------|------|
| 信用卡 | `Credit` | 一次付清 / 分期（3/6/12/18/24 期） |
| ATM 轉帳 | `ATM` | 虛擬帳號，最多 3 天內繳款 |
| 超商代碼 | `CVS` | 超商多媒體機台繳費 |
| 超商條碼 | `BARCODE` | 列印條碼超商繳費 |
| Apple Pay | `ApplePay` | 選配 |
| TWQR | `TWQR` | 台灣 Pay QR Code |

### 6.2 API 端點彙整

#### 建立訂單（AioCheckOut/V5）

| 環境 | URL |
|------|-----|
| 正式 | `https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5` |
| 測試 | `https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5` |

**送出方式**：HTTP POST，Content-Type: `application/x-www-form-urlencoded`

**必填參數**

| 參數 | 類別 | 長度 | 說明 |
|------|------|------|------|
| `MerchantID` | String | 10 | 商店編號 |
| `MerchantTradeNo` | String | 20 | 商店訂單編號（唯一，不可重複） |
| `MerchantTradeDate` | String | 20 | 交易時間 `yyyy/MM/dd HH:mm:ss` |
| `PaymentType` | String | 20 | 固定 `aio` |
| `TotalAmount` | Int | - | 交易金額（整數，不含小數） |
| `TradeDesc` | String | 200 | 交易描述 |
| `ItemName` | String | 400 | 商品名稱，多筆用 `#` 分隔 |
| `ReturnURL` | String | 200 | 付款結果通知回傳網址（Server 端接收） |
| `ChoosePayment` | String | 20 | 付款方式：`Credit`/`ATM`/`CVS`/`BARCODE`/`ALL` |
| `CheckMacValue` | String | 64 | SHA256 驗簽值 |
| `EncryptType` | Int | - | 固定 `1`（SHA256） |

**選填參數（常用）**

| 參數 | 說明 |
|------|------|
| `OrderResultURL` | 付款完成導回前台的頁面 URL |
| `ClientBackURL` | 付款頁「回到商店」的連結 URL |
| `NeedExtraPaidInfo` | `Y` 回傳額外付款資訊 |
| `StoreID` | 商店門市編號 |
| `CreditInstallment` | 分期數 `3,6,12,18,24`（逗號分隔） |
| `InstallmentAmount` | 分期付款金額 |
| `ExpireDate` | ATM 繳費有效天數（1-60，預設 3） |

#### CheckMacValue 計算方式

```
1. 將所有參數（不含 CheckMacValue）依 key 字母排序
2. 組合字串：HashKey={HashKey}&{排序後 key=value}&HashIV={HashIV}
3. URL Encode（RFC 1866, 小寫）
4. 轉小寫
5. SHA256 雜湊
6. 轉大寫即為 CheckMacValue
```

#### 付款結果通知（ReturnURL callback）

綠界 POST 回傳至 `ReturnURL`，需驗簽並回傳

| 參數 | 說明 |
|------|------|
| `RtnCode` | `1` = 付款成功，其餘為失敗 |
| `MerchantTradeNo` | 商店訂單編號 |
| `TradeNo` | 綠界交易編號 |
| `TradeAmt` | 交易金額 |
| `PaymentDate` | 付款時間 |
| `PaymentType` | 實際付款方式（如 `Credit_CreditCard`） |
| `CheckMacValue` | 回傳驗簽碼，需驗證 |

**回應規格**：收到通知後，Server 必須回傳 `1|OK`，否則綠界持續重試通知。

### 6.3 測試資料

| 項目 | 值 |
|------|-----|
| MerchantID | `3002607` |
| HashKey | `pwFHCqoQZGmho4w6` |
| HashIV | `EkRm7iFT261dpevs` |
| 測試信用卡號 | `4311-9522-2222-2222`（安全碼 `222`，有效期任意未過即可） |
| 管理後台 | `https://vendor-stage.ecpay.com.tw` |

### 6.4 付款流程

```
1. 前台送出訂單 → 建立 Order（status: PENDING, paymentStatus: UNPAID）
2. Server 組裝 AioCheckOut/V5 參數 + SHA256 CheckMacValue
3. 前台 form POST 跳轉至綠界付款頁
4. 顧客完成付款
5. 綠界 POST 通知 Server ReturnURL → 驗簽 + 更新 paymentStatus = PAID
6. Server 回傳 "1|OK"
7. 綠界導回前台 OrderResultURL → 顯示訂單完成頁
```

### 6.5 退款流程

```
後台操作退款 → 呼叫綠界退款 API → 更新訂單狀態 → 通知客戶 Email
```

---

## 七、物流整合 — 綠界 ECPay Logistics

### 7.1 支援物流類型

| 物流類型 | LogisticsType | LogisticsSubType | 說明 |
|----------|---------------|------------------|------|
| 全家 B2C | `CVS` | `FAMI` | 全家超商取貨（B2C） |
| 統一超商 B2C | `CVS` | `UNIMART` | 7-ELEVEN 取貨（B2C） |
| 萊爾富 B2C | `CVS` | `HILIFE` | 萊爾富取貨（B2C） |
| 全家 C2C | `CVS` | `FAMIC2C` | 全家店到店 |
| 統一超商 C2C | `CVS` | `UNIMARTC2C` | 7-ELEVEN 寄貨取 |
| 萊爾富 C2C | `CVS` | `HILIFEC2C` | 萊爾富寄貨取 |
| 黑貓宅急便 | `Home` | `TCAT` | 黑貓宅急便 |
| 宅配通 | `Home` | `ECAN` | 宅配通 |

**溫層（宅配）**：`0001` 常溫 / `0002` 冷藏 / `0003` 冷凍  
**代收貨款**：`Y` 貨到付款 / `N` 非代收

### 7.2 API 端點

| 功能 | 正式環境 URL | 說明 |
|------|-------------|------|
| **超商地圖** | `https://logistics.ecpay.com.tw/Express/map` | 超市選擇器（前端嵌入） |
| **建立物流訂單** | `https://logistics.ecpay.com.tw/Express/Create` | 建立出貨單 |
| **物流訂單查詢** | `https://logistics.ecpay.com.tw/Helper/QueryLogisticsTradeInfo/V2` | 追蹤物流狀態 |
| **列印出貨一段標** | `https://logistics.ecpay.com.tw/helper/printTradeDocument` | 出貨標籤列印 |
| **建立測試資料** | `https://logistics.ecpay.com.tw/Express/CreateTestData` | B2C 測試資料 |

**逆物流端點**

| 功能 | URL |
|------|-----|
| 宅配逆物流 | `/Express/ReturnHome` |
| 全家 B2C 逆物流 | `/express/ReturnCVS` |
| 統一超商 B2C 逆物流 | `/express/ReturnUniMartCVS` |
| 萊爾富 B2C 逆物流 | `/express/ReturnHiLifeCVS` |

**測試環境**：以上 URL `logistics.ecpay.com.tw` 改為 `logistics-stage.ecpay.com.tw`

### 7.3 建立物流訂單（CreateShippingOrder）

**送出方式**：HTTP POST，加密方式為 **MD5**（注意！物流用 MD5，金流用 SHA256）

**必填參數**

| 參數 | 類別 | 長度 | 說明 |
|------|------|------|------|
| `MerchantID` | String | 10 | 商店編號 |
| `MerchantTradeDate` | String | 20 | `yyyy/MM/dd HH:mm:ss` |
| `LogisticsType` | String | 20 | `CVS` 或 `Home` |
| `LogisticsSubType` | String | 20 | 如 `FAMI`、`UNIMART`、`TCAT` |
| `GoodsAmount` | Int | - | 商品金額 |
| `SenderName` | String | 10 | 寄件人姓名 |
| `ReceiverName` | String | 10 | 收件人姓名 |
| `ServerReplyURL` | String | 200 | 物流狀態變更通知 URL |
| `CheckMacValue` | String | 32 | MD5 驗簽值 |

**選填參數（常用）**

| 參數 | 說明 |
|------|------|
| `MerchantTradeNo` | 商店訂單編號（max 20） |
| `IsCollection` | 代收貨款 `Y`/`N` |
| `CollectionAmount` | 代收金額 |
| `GoodsName` | 商品名稱（max 50） |
| `SenderPhone` | 寄件人電話 |
| `ReceiverPhone` | 收件人電話 |
| `ReceiverCellPhone` | 收件人手機 |
| `ReceiverEmail` | 收件人 Email（max 50） |
| `TradeDesc` | 交易描述（max 200） |
| `Remark` | 備註（max 200） |

**宅配額外參數（LogisticsType = Home）**

| 參數 | 說明 |
|------|------|
| `SenderZipCode` | 寄件人郵遞區號 |
| `SenderAddress` | 寄件人地址 |
| `ReceiverZipCode` | 收件人郵遞區號 |
| `ReceiverAddress` | 收件人地址 |
| `Temperature` | 溫層 `0001`/`0002`/`0003` |
| `Distance` | 距離 `00` 本縣市 / `01` 外縣市 / `02` 離島 |
| `Specification` | 規格 `0001`(60cm) / `0002`(90cm) / `0003`(120cm) / `0004`(150cm) |
| `ScheduledPickupTime` | 預計取件時段 `1`(9-12) / `2`(12-17) / `3`(17-20) / `4`(不限) |
| `ScheduledDeliveryTime` | 預計送達時段 |

**超商取貨額外參數（LogisticsType = CVS）**

| 參數 | 說明 |
|------|------|
| `ReceiverStoreID` | 收件門市代碼（超商電子地圖選擇器取得） |

### 7.4 超商地圖（門市選擇器）

前端嵌入 iframe 讓用戶選擇取貨門市。

| 參數 | 說明 |
|------|------|
| `MerchantID` | 商店編號 |
| `LogisticsType` | `CVS` |
| `LogisticsSubType` | `FAMI`/`UNIMART`/`HILIFE` |
| `IsCollection` | 是否代收貨款 |
| `ServerReplyURL` | 門市資料回傳 URL |

回傳資料包含：門市代碼 `CVSStoreID`、門市名稱 `CVSStoreName`、門市地址 `CVSAddress`、門市電話 `CVSTelephone`。

### 7.5 CheckMacValue（物流用 MD5）

```
1. 將所有參數（不含 CheckMacValue）依 key 字母排序
2. 組合字串：HashKey={HashKey}&{排序後 key=value}&HashIV={HashIV}
3. URL Encode（小寫）
4. 轉小寫
5. MD5 雜湊
6. 轉大寫即為 CheckMacValue
```

> ⚠️ **重要**：物流用 **MD5** 加密，金流用 **SHA256** 加密，必須分開處理。

### 7.6 物流測試資料

| 項目 | 值 |
|------|-----|
| B2C 測試 MerchantID | `2000132` |
| C2C 測試 MerchantID | `2000933` |
| HashKey | `5294y06JbISpM5x9`（B2C 測試預設） |
| HashIV | `v77hoKGq4kWxNNIS`（B2C 測試預設） |

> 注意：以上僅供 B2C 測試預設，實際串接請至綠界測試商家後台確認

### 7.7 物流串接流程

```
結帳時選擇「超商取貨」：
1. 前端嵌入綠界超商地圖 → 顧客選擇門市 → 回傳 CVSStoreID + CVSStoreName
2. 訂單建立時儲存門市資料
3. 付款完成後，後台呼叫 CreateShippingOrder 建立物流訂單
4. 取得 AllPayLogisticsID（物流編號）
5. 列印一段標（出貨標籤）→ 寄送至取貨中心
6. 綠界回傳 ServerReplyURL 通知物流狀態更新
7. 更新 Order.shippingStatus

結帳時選擇「宅配」：
1. 顧客填寫收件地址
2. 付款完成後，後台呼叫 CreateShippingOrder（LogisticsType = Home）
3. 取得物流編號 + 追蹤碼
4. 通知顧客出貨 Email
```

---

## 八、實施計畫

> 註：`[-]` 表示已完成主要程式開發，但仍有外部服務驗證、細節補強或部分子需求尚待完成。

### Phase 1：基礎架構 + 後台管理

#### 1A — 專案初始化

- [x] **[P1-01]** 建立 Next.js 15 專案
  - `npx create-next-app@latest hanben-admin --typescript --tailwind --eslint --app --src-dir`
  - 設定 `tsconfig.json` path alias `@/*`
- [x] **[P1-02]** 安裝核心依賴
  - `npm i prisma @prisma/client next-auth@5 bcryptjs zod react-hook-form`
  - `npm i -D @types/bcryptjs`
- [x] **[P1-03]** 安裝 UI 依賴
  - `npx shadcn@latest init`（New York style, CSS variables, `#B72020` 主色）
  - `npm i @tanstack/react-table @tanstack/react-query recharts date-fns`
  - 引入 Noto Serif TC Google Font → `src/app/layout.tsx`
- [x] **[P1-04]** 配置 Prisma + PostgreSQL
  - `npx prisma init --datasource-provider postgresql`
  - 建立 `.env`（`DATABASE_URL`, `NEXTAUTH_SECRET`, `ECPAY_*` 等）
  - 貼入 §3.2 完整 Prisma Schema
  - `npx prisma migrate dev --name init`
  - 建立 `src/lib/db.ts`（PrismaClient singleton）
- [x] **[P1-05]** 建立專案目錄骨架
  - 依 §2.2 建立 `src/app/(storefront)/`、`src/app/admin/`、`src/app/api/` 等空目錄
  - 建立 `src/components/storefront/`、`src/components/admin/`
  - 建立 `src/lib/`、`src/types/`
- [x] **[P1-06]** 設定 `.env.example` + `.gitignore`
  - `.env.example` 列出所有環境變數 key（無 value）
  - `.gitignore` 加入 `.env`、`node_modules/`、`.next/`
- [x] **[P1-07]** ESLint + Prettier 設定
  - 統一程式碼風格，啟用 `@typescript-eslint/strict`

#### 1B — 認證系統

- [x] **[P1-08]** NextAuth.js v5 設定 → P1-04
  - `src/lib/auth.ts` → Credentials Provider（Admin + Customer 分離）
  - `src/app/api/auth/[...nextauth]/route.ts`
  - Session strategy: JWT
  - 擴充 `session.user` 含 `role`、`customerId`
- [x] **[P1-09]** Admin 登入頁面
  - `src/app/admin/login/page.tsx` → Email + 密碼表單
  - Server Action 驗證 bcrypt → 返回 JWT
  - 登入失敗顯示錯誤訊息 + rate limiting（5 次/分鐘）
- [x] **[P1-10]** Admin Seed Script → P1-04
  - `prisma/seed.ts` → 建立預設 SUPER_ADMIN 帳號
  - `npx prisma db seed`
- [x] **[P1-11]** Admin 路由守衛 → P1-08
  - `src/app/admin/layout.tsx` → Server Component 檢查 session
  - 未登入則 redirect `/admin/login`
  - Middleware `src/middleware.ts` 保護 `/admin/*` 路由

#### 1C — 後台 Layout + Dashboard

- [x] **[P1-12]** 後台 Layout 骨架 → P1-11
  - `src/app/admin/layout.tsx` → Sidebar + Header + Main content area
  - `src/components/admin/sidebar.tsx` → 導覽選單（Dashboard、商品、訂單、客戶、內容、部落格、設定、促銷、運費、聯絡、媒體）
  - `src/components/admin/header.tsx` → 麵包屑 + 通知 + 管理員頭像、登出
  - RWD：Desktop sidebar / Mobile hamburger drawer
- [x] **[P1-13]** Dashboard 頁面 → P1-12
  - `src/app/admin/dashboard/page.tsx`
  - 統計卡片（今日訂單、月營收、待出貨、低庫存、新客戶、未讀訊息）
  - 先放 mock data，後續接入實際查詢
  - 營收趨勢折線圖（Recharts）+ 熱銷商品表格

#### 1D — 商品管理

- [x] **[P1-14]** 商品列表頁 → P1-12
  - `src/app/admin/products/page.tsx`
  - Server Component + TanStack Table
  - 欄位：商品縮圖、名稱、狀態、價格、庫存總計、建立日期
  - 搜尋（title）、篩選（status）、分頁（20/page）
  - 批次操作：上架、下架、刪除
- [x] **[P1-15]** 商品新增、編輯頁 → P1-14
  - `src/app/admin/products/new/page.tsx`
  - `src/app/admin/products/[id]/page.tsx`
  - React Hook Form + Zod 驗證
  - 欄位：title, slug（自動生成）, description, bodyHtml, vendor, productType, status, tags
  - SEO 區塊：seoTitle, seoDescription（折疊式）
  - Server Action：`createProduct()`、`updateProduct()`
- [x] **[P1-16]** 富文字編輯器（TipTap）→ P1-03
  - `src/components/admin/rich-text-editor.tsx`
  - 功能：粗體、斜體、標題、列表、連結、圖片嵌入、影片嵌入
  - 輸出 HTML，儲存至 `bodyHtml`
  - sanitize-html 過濾 XSS
- [x] **[P1-17]** 商品圖片上傳 → P1-15
  - `src/components/admin/image-uploader.tsx`
  - 多圖上傳 + 拖拉排序（dnd-kit）
  - 上傳至 Uploadthing / S3 → 回傳 URL
  - 儲存 ProductImage（url, altText, sortOrder）
  - 最多 10 張，支援 webp、jpg、png
- [x] **[P1-18]** 變體管理 → P1-15
  - `src/components/admin/variant-table.tsx`
  - 可編輯表格：title, sku, price, compareAtPrice, costPrice, inventory, weight, isActive
  - 新增、編輯、刪除變體（inline editing）
  - Server Action：`createVariant()`、`updateVariant()`、`deleteVariant()`
  - 批次庫存調整

#### 1E — 集合管理

- [x] **[P1-19]** 集合列表 → P1-12
  - `src/app/admin/collections/page.tsx`
  - 欄位：縮圖、名稱、商品數、狀態
- [x] **[P1-20]** 集合編輯頁 → P1-19
  - `src/app/admin/collections/[id]/page.tsx`
  - 欄位：title, slug, description, imageUrl, isActive
  - 商品關聯：搜尋選擇器 + 拖拉排序已選商品
  - 儲存 CollectionProduct 中間表

#### 1F — 媒體庫

- [x] **[P1-21]** 媒體庫頁面 → P1-17
  - `src/app/admin/media/page.tsx`
  - Grid 展示所有已上傳圖片、檔案
  - 上傳、編輯（filename、altText）、批次刪除
  - 資料夾篩選
  - 點選圖片 → 複製 URL / 編輯 altText
- [x] **[P1-22]** 媒體庫 API → P1-21
  - `src/app/api/upload/route.ts` → 上傳 endpoint
  - Server Action：`deleteMedia()`、`updateMediaAlt()`

---

### Phase 2：內容管理 + 前台渲染

#### 2A — 靜態頁面 CMS

- [x] **[P2-01]** 靜態頁面列表 → P1-12
  - `src/app/admin/content/pages/page.tsx`
  - 欄位：標題、slug、發佈狀態、模板、更新日期
- [x] **[P2-02]** 靜態頁面編輯 → P2-01, P1-16
  - `src/app/admin/content/pages/[id]/page.tsx`
  - 欄位：title, slug, bodyHtml（TipTap）, template, isPublished, SEO
  - Server Action：`createPage()`、`updatePage()`
- [x] **[P2-03]** 預設 10 個靜態頁面 → P2-02
  - Seed script 從復刻 HTML 擷取內容，建立頁面
  - `about`、`contact`、`qa`、`news`、`certification`、`chinese-herbal-guide`、`養護知識`、`sore-daily-life`、`sore-daily-life-articles`、`退換貨說明`

#### 2B — FAQ 管理

- [x] **[P2-04]** FAQ 列表 → P1-12
  - `src/app/admin/content/faq/page.tsx`
  - 拖拉排序（dnd-kit）、啟用、停用 toggle
- [x] **[P2-05]** FAQ 新增、編輯 → P2-04
  - `src/app/admin/content/faq/[id]/page.tsx`
  - 欄位：question, answer（TipTap）, category, sortOrder, isActive
- [x] **[P2-06]** 預設 FAQ 資料 → P2-05
  - 從復刻 QA 頁面擷取 9+ 組 Q&A，seed 入 FaqItem

#### 2C — 部落格系統

- [x] **[P2-07]** 部落格頻道管理 → P1-12
  - `src/app/admin/blog/channels/page.tsx`
  - CRUD：title, slug, description
  - 預設頻道「最新消息」、「sore-daily-life」
- [x] **[P2-08]** 文章列表 → P2-07
  - `src/app/admin/blog/articles/page.tsx`
  - 篩選：頻道、發佈狀態
- [x] **[P2-09]** 文章編輯 → P2-08, P1-16
  - `src/app/admin/blog/articles/[id]/page.tsx`
  - 欄位：channel, title, slug, excerpt, bodyHtml（TipTap）, featureImage, author, tags, isPublished, publishedAt, SEO

#### 2D — 網站設定

- [x] **[P2-10]** 一般設定頁 → P1-12
  - `src/app/admin/site-settings/general/page.tsx`
  - 網站名稱、Logo 上傳、Favicon 上傳、品牌色系
  - 讀寫 SiteSetting（key-value）
- [x] **[P2-11]** 導覽選單編輯器 → P2-10
  - `src/app/admin/site-settings/navigation/page.tsx`
  - Header / Footer 選單
  - 巢狀拖拉排序（parent/children）
  - 選單項目：title, url, isExternal
- [x] **[P2-12]** 首頁區塊管理 → P2-10
  - `src/app/admin/site-settings/homepage/page.tsx`
  - 管理 7 個 section（hero_slider、brand_story、stats_section、product_showcase、brand_values、video_section、icon_grid）
  - 每個 section 展開編輯 JSON content
  - Hero Slider 子管理：slide 列表 CRUD + 拖拉排序
- [x] **[P2-13]** 公告欄管理 → P2-10
  - `src/app/admin/site-settings/announcement/page.tsx`
  - CRUD：text, link, bgColor, textColor, isActive, sortOrder
- [x] **[P2-14]** SEO、社群、聯絡設定 → P2-10
  - SEO：全站 meta title、description、og_image
  - 社群：FB Pixel ID, GA ID, 社群連結
  - 聯絡：電話、地址、Email
- [x] **[P2-15]** 預設網站設定 → P2-10
  - Seed script 寫入 §九 初始值：site_name, primary_color, contact_phone 等
  - 預設 8 個 Header 導覽 + Footer 導覽

#### 2E — 前台頁面渲染

- [x] **[P2-16]** 前台 Layout → P2-11, P2-13
  - `src/app/(storefront)/layout.tsx`
  - `src/components/storefront/header.tsx` → 讀 NavigationMenu 渲染二層導覽列
  - `src/components/storefront/footer.tsx` → 讀 SiteSetting 渲染聯絡資訊
  - `src/components/storefront/announcement-bar.tsx` → 讀 AnnouncementBar 渲染
  - `src/components/storefront/mobile-menu.tsx` → 漢堡選單 drawer
- [x] **[P2-17]** 首頁渲染 → P2-12, P2-16
  - `src/app/(storefront)/page.tsx`
  - 依 HomepageSection sortOrder 依序渲染 7 個區塊
  - 各 section 對應 component：`hero-slider.tsx`、`brand-story.tsx`、`stats-section.tsx`、`product-showcase.tsx`、`brand-values.tsx`、`video-section.tsx`、`icon-grid.tsx`
  - 完整復刻 CSS（色系、字體、間距）
- [x] **[P2-18]** 商品詳情頁 → P2-16
  - `src/app/(storefront)/products/[slug]/page.tsx`
  - 商品 gallery（zoom）、價格、數量、規格選擇器、加入購物車
  - Sticky Add-to-Cart（mobile）
  - 商品描述（bodyHtml 渲染）
  - 相關商品推薦
- [x] **[P2-19]** 集合頁 → P2-16
  - `src/app/(storefront)/collections/[slug]/page.tsx`
  - 商品 grid + 分頁
- [x] **[P2-20]** 靜態頁面渲染 → P2-16
  - `src/app/(storefront)/pages/[slug]/page.tsx`
  - 支援 template 類型：default（純內文）、contact（聯絡表單）、qa（渲染 FAQ accordion）
- [x] **[P2-21]** 部落格渲染 → P2-16
  - `src/app/(storefront)/blogs/[channel]/page.tsx` → 文章列表 + 分頁
  - `src/app/(storefront)/blogs/[channel]/[slug]/page.tsx` → 文章詳情
- [x] **[P2-22]** 搜尋功能 → P2-16
  - `src/components/storefront/search-modal.tsx` → 即時搜尋 Modal
  - `src/app/(storefront)/search/page.tsx` → 完整搜尋結果頁
  - `src/app/api/search/route.ts` → Product full-text search API

---

### Phase 3：購物車 + 結帳 + 支付

#### 3A — 購物車

- [x] **[P3-01]** Cart Store（前端狀態）→ P2-18
  - `src/lib/cart-store.ts` → Zustand store（非 React Context）
  - 方法：addItem, removeItem, updateQuantity, clearCart
  - 同步至 Server Cart（登入用戶）或 localStorage（訪客）
- [x] **[P3-02]** Cart Drawer 元件 → P3-01
  - `src/components/storefront/cart-drawer.tsx`
  - 右側滑出，商品列表 + 數量調整 + 刪除 + 小計
  - 空購物車狀態
  - 前往結帳按鈕
- [x] **[P3-03]** Cart API → P3-01
  - `src/app/api/cart/route.ts` → GET（讀取購物車）/ POST（更新購物車）
  - Session 識別：登入者用 customerId / 訪客用 sessionId（cookie）
  - 讀寫 Cart + CartItem model

#### 3B — 結帳流程

- [x] **[P3-04]** 結帳頁面 → P3-02
  - `src/app/(storefront)/checkout/page.tsx`
  - 多步驟表單（單頁完成）：
    1. 聯絡資料（email, phone）
    2. 收件資料（姓名、地址，或超商取貨）
    3. 送貨方式（宅配、超商取貨）
    4. 付款方式（信用卡、ATM、超商代碼）
    5. 訂單確認（商品明細 + 金額計算）
  - Zod 驗證每個步驟
- [x] **[P3-05]** 送貨方式選擇器 → P3-04
  - 宅配：填寫地址（縣市、區、郵遞區號、詳細地址）
  - 超商取貨：嵌入綠界超商電子地圖 iframe → 接收回傳市場資料
  - `src/components/storefront/cvs-store-picker.tsx` → 超商選擇嵌入 + 接收回傳
  - `src/app/api/logistics/map/route.ts` → 提供超商地圖 ServerReplyURL 接收市場資料
  - 超商不需 CheckMacValue，只需 MerchantID + LogisticsType + LogisticsSubType + ServerReplyURL
- [x] **[P3-06]** 運費計算 → P3-05
  - `src/lib/shipping.ts` → 根據 shippingMethod 計算運費
  - 黑貓宅配：固定費率，或滿額免運
  - 超商取貨：固定 $60 或滿額免運（依 ShippingRule 設定）
  - 回傳 shippingFee 更新訂單小計

#### 3C — 訂單建立

- [x] **[P3-07]** 建立訂單 Server Action → P3-04
  - `src/app/api/checkout/route.ts`
  - 驗證庫存 → 扣減庫存（transaction）
  - 建立 Order（PENDING/UNPAID）+ OrderItem（snapshot price）
  - 產生 orderNumber（`HB-YYYYMMDD-XXXX`）
  - 清空購物車
  - 回傳 orderId
- [x] **[P3-08]** 庫存扣減邏輯 → P3-07
  - Prisma transaction：`variant.inventory -= quantity`
  - 庫存不足 → 回傳錯誤，不建立訂單
  - 付款超時、取消 → 釋放庫存（cron job 或 webhook）

#### 3D — 綠界金流串接

- [x] **[P3-09]** ECPay 共用工具模組 → P1-04
  - `src/lib/ecpay-common.ts` → 共用函式（金流 + 物流通用）
    - `generateCheckMacValue(params, hashKey, hashIV, algorithm: 'SHA256' | 'MD5')`
    - `verifyCheckMacValue(params, hashKey, hashIV, algorithm)`
    - `urlEncodeEcpay(str)` → 綠界專用 URL Encode（RFC 1866）
  - `src/lib/ecpay.ts` → 金流專用
    - `buildAioCheckOutParams(order)` → 組裝 AioCheckOut/V5 必填+選填參數
  - 環境切換：`ECPAY_ENV=test|production`
- [x] **[P3-10]** 付款發起 API → P3-09, P3-07
  - `src/app/api/payment/create/route.ts`
  - 接收 orderId → 查詢 Order → 組裝綠界參數
  - 回傳 form HTML（hidden inputs）供前台 auto-submit POST 跳轉
- [x] **[P3-11]** 付款結果回調 → P3-09
  - `src/app/api/webhooks/ecpay/payment/route.ts`
  - POST handler：解析 form-urlencoded body
  - 驗簽 CheckMacValue → `RtnCode === '1'` → 更新 Order：
    - `paymentStatus = PAID`
    - `paymentRef = TradeNo`
    - `paidAt = PaymentDate`
  - 回傳 plain text `1|OK`
  - 驗簽失敗 → log error + 回傳 `0|ErrorMessage`
- [x] **[P3-12]** 付款完成頁面 → P3-10
  - `src/app/(storefront)/checkout/result/page.tsx`
  - 綠界 redirect 至 `OrderResultURL`
  - 顯示：訂單編號、付款狀態、下一步說明
  - 未登入者顯示註冊帳號提示
- [x] **[P3-13]** ATM、CVS 待繳款頁面 → P3-11
  - ATM：付款通知含 `BankCode` + `vAccount` + `ExpireDate` → 顯示繳費資訊
  - CVS：付款通知含 `PaymentNo` + `ExpireDate` → 顯示超商繳費步驟
  - 儲存至 Order 備註或新增 PaymentInfo 欄位

#### 3E — 訂單通知

- [x] **[P3-14]** Email 發送模組 → P1-02
  - `src/lib/email.ts` → Resend SDK 封裝
  - `sendOrderConfirmation(order)` → 訂單確認信
  - `sendPaymentReceived(order)` → 付款成功通知
  - `sendShippingNotification(order)` → 出貨通知
  - React Email 模板（`src/emails/*.tsx`）
- [x] **[P3-15]** 訂單確認通知 → P3-14, P3-07
  - 訂單建立後 → 寄送訂單確認信（訂單明細 + 付款說明）
  - 付款成功後（webhook）→ 寄送付款成功通知

---

### Phase 4：出貨管理 + 退款 + 會員

#### 4A — 後台訂單管理

- [x] **[P4-01]** 訂單列表 → P1-12
  - `src/app/admin/orders/page.tsx`
  - TanStack Table：訂單編號、客戶、金額、付款狀態、出貨狀態、日期
  - Tab 篩選：全部、待付款、待出貨、已出貨、已完成、已取消
  - 搜尋：訂單編號、客戶 Email
- [x] **[P4-02]** 訂單詳情頁 → P4-01
  - `src/app/admin/orders/[id]/page.tsx`
  - 各區塊：訂單摘要、商品明細、客戶資料、收件資料、付款資料、物流資料
  - 操作按鈕：確認訂單、出貨、取消、退款
  - 備註輸入框
  - 訂單狀態軸（時間軸視覺化）
- [x] **[P4-03]** 訂單狀態機 → P4-02
  - `src/lib/order-status.ts`
  - 合法狀態轉換規則：
    - PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    - PENDING → CANCELLED
    - DELIVERED → REFUNDED
  - Server Action：`updateOrderStatus(orderId, newStatus)` 含驗證

#### 4B — 綠界物流串接

- [x] **[P4-04]** ECPay 物流工具模組 → P1-04, P3-09
  - `src/lib/ecpay-logistics.ts` → 引入 `ecpay-common.ts` 共用函式
  - `buildCreateShippingOrderParams(order)` → 組裝 CreateShippingOrder 參數（使用 MD5）
  - 環境切換（production/stage URL）
- [x] **[P4-05]** 建立物流訂單 API → P4-04, P4-02
  - `src/app/api/logistics/create/route.ts`
  - 接收 orderId → 判斷 shippingMethod → 組裝參數
  - 超商：帶入 cvsStoreId, ReceiverStoreID
  - 宅配：帶入收件地址 + 溫層 + 規格
  - POST 至綠界 `/Express/Create` → 取得 `AllPayLogisticsID`
  - 更新 Order：`logisticsId`、`shippingStatus = FULFILLED`
- [x] **[P4-06]** 物流狀態更新 Webhook → P4-04
  - `src/app/api/webhooks/ecpay/logistics/route.ts`
  - 綠界 POST 物流狀態更新 → 驗簽 CheckMacValue（MD5）
  - 狀態碼對照表 → 更新 Order shippingStatus
  - 狀態為「已取件」→ 寄出貨通知 Email
  - 狀態為「已簽收」→ 更新 `deliveredAt`
- [x] **[P4-07]** 列印出貨標籤 → P4-05
  - `src/app/admin/orders/[id]/print/page.tsx`
  - 呼叫綠界 `printTradeDocument` API
  - 開啟新頁面渲染出貨一段標
- [-] **[P4-08]** 出貨管理 UI → P4-05, P4-02
  - 訂單詳情頁新增「出貨」操作按鈕
  - 點擊 → 呼叫 P4-05 API → 顯示物流編號 + 列印標籤
  - 分次出貨：勾選商品列表 → 分批建立物流訂單

#### 4C — 退款 + 逆物流

- [-] **[P4-09]** 退款處理 → P4-03
  - `src/lib/ecpay-refund.ts` → 呼叫綠界退款 API
  - 後台操作：選擇退款方式（全額、部分）→ 發起退款
  - 更新 Order：`paymentStatus = REFUNDED`、`status = REFUNDED`
  - 釋放庫存（`variant.inventory += quantity`）
  - 寄送退款通知 Email
- [-] **[P4-10]** 逆物流處理 → P4-04
  - 後台操作：選擇逆物流方式（宅配退貨、超商退貨）
  - 呼叫對應逆物流 API（ReturnHome、ReturnCVS、ReturnUniMartCVS、ReturnHiLifeCVS）
  - 更新 Order：`shippingStatus = RETURNED`

#### 4D — 客戶管理

- [x] **[P4-11]** 客戶列表 → P1-12
  - `src/app/admin/customers/page.tsx`
  - 欄位：姓名、Email、電話、訂單數、累計消費、註冊日期
  - 搜尋：Email、姓名
- [x] **[P4-12]** 客戶詳情 → P4-11
  - `src/app/admin/customers/[id]/page.tsx`
  - 個人資料 + 地址列表 + 歷史訂單列表
  - 備註欄

#### 4E — 前台會員系統

- [x] **[P4-13]** 會員註冊、登入 → P1-08
  - `src/app/(storefront)/account/login/page.tsx` → 登入
  - `src/app/(storefront)/account/register/page.tsx` → 註冊
  - Zod 驗證 + bcrypt 雜湊
  - 註冊成功 → 自動登入 → redirect 會員中心
- [x] **[P4-14]** 忘記密碼 → P4-13, P3-14
  - `src/app/(storefront)/account/forgot-password/page.tsx`
  - 輸入 Email → 寄送重設密碼連結（JWT token, 1hr 有效期）
  - `src/app/(storefront)/account/reset-password/page.tsx` → 重設密碼頁
- [x] **[P4-15]** 會員中心 → P4-13
  - `src/app/(storefront)/account/page.tsx` → 個人資料編輯
  - `src/app/(storefront)/account/addresses/page.tsx` → 收件地址管理（多組 CRUD）
  - `src/app/(storefront)/account/orders/page.tsx` → 訂單列表
  - `src/app/(storefront)/account/orders/[id]/page.tsx` → 訂單詳情 + 物流追蹤

---

### Phase 5：進階功能

#### 5A — 促銷系統

- [x] **[P5-01]** 促銷管理 CRUD → P1-12
  - `src/app/admin/promotions/page.tsx` → 列表
  - `src/app/admin/promotions/[id]/page.tsx` → 編輯
  - 類型：COUPON_CODE / AUTOMATIC / BUY_X_GET_Y
  - 設定：折扣值、最低消費、使用次數上限、有效期限
- [x] **[P5-02]** 折扣碼結帳折抵 → P5-01, P3-04
  - 結帳頁新增折扣碼輸入框
  - `src/app/api/promotion/validate/route.ts` → 驗證折扣碼（有效、過期、已達上限）
  - 計算折扣金額 → 更新訂單 discountAmount
- [-] **[P5-03]** 自動折扣 + BOGO → P5-01
  - 購物車更新時 → 檢查並套用自動促銷
  - 滿額免運 / 滿額折扣 → 顯示標示
  - BUY_X_GET_Y → 自動加入贈品至 Cart

#### 5B — 運費規則

- [x] **[P5-04]** 運費規則管理 → P1-12
  - `src/app/admin/shipping/page.tsx`
  - 設定各物流方式費率：
    - 黑貓宅配：常溫、冷藏、冷凍；本縣市、外縣市費率
    - 超商取貨：全家、統一、萊爾富費率
  - 免運門檻設定（滿 N 元免運）
  - 代收貨款費率

#### 5C — 聯絡表單

- [-] **[P5-05]** 前台聯絡表單 → P2-20
  - `src/components/storefront/contact-form.tsx`
  - 欄位：姓名、Email、電話、訊息
  - Zod 驗證 + reCAPTCHA（防機器人）
  - Server Action → 儲存 ContactSubmission + 寄通知 Email 給管理員
- [x] **[P5-06]** 後台聯絡表單管理 → P1-12
  - `src/app/admin/contact/page.tsx` → 表單列表（未讀、已讀、已回覆 tab）
  - `src/app/admin/contact/[id]/page.tsx` → 表單詳情 + 回覆（寄 Email 給訪客）

#### 5D — 搜尋 + 分析 + 追蹤

- [-] **[P5-07]** 站內搜尋優化 → P2-22
  - PostgreSQL full-text search（中文用 `pg_trgm` 或 `pgroonga`）
  - 搜尋範圍：商品名稱、描述、文章標題、內容、標籤
  - 搜尋建議（debounce + 即時查詢）
- [-] **[P5-08]** Analytics 儀表板 → P1-13
  - Dashboard 接入實際查詢（移除 mock data）
  - 訂單、營收統計
  - 營收趨勢、訂單趨勢、商品趨勢
  - 客戶統計、流量來源（整合 GA 資料）
- [x] **[P5-09]** Facebook Pixel + GA 事件 → P2-16
  - `src/components/storefront/analytics-scripts.tsx`
  - 從 SiteSetting 讀取 Pixel ID / GA ID → 注入 `<Script>`
  - 事件追蹤：PageView, ViewContent, AddToCart, InitiateCheckout, Purchase
  - `src/lib/analytics.ts` → 封裝 `fbq()` + `gtag()` 呼叫

---

### Phase 6：優化 + 上線

#### 6A — 效能優化

- [-] **[P6-01]** ISR + 快取策略
  - 商品頁、集合頁、首頁：`revalidate: 60`（ISR 60 秒）
  - 靜態頁面、文章：`revalidate: 3600`（1 小時）
  - API 路由加 `Cache-Control` header
- [-] **[P6-02]** 圖片優化
  - `next/image` 統一取代 `<img>`，加入 WebP + responsive sizes
  - 上傳時自動壓縮（sharp）
  - Cloudflare Image CDN（選配）
- [-] **[P6-03]** Bundle 優化 + Code Splitting
  - `@next/bundle-analyzer` 檢查 bundle size
  - Dynamic import 懶載入（TipTap, Recharts, dnd-kit）
  - 確保 Server Component 比例較大

#### 6B — SEO

- [x] **[P6-04]** Sitemap + Robots.txt
  - `src/app/sitemap.ts` → 動態產生 sitemap.xml（商品、頁面、文章）
  - `src/app/robots.ts` → 允許爬蟲
- [x] **[P6-05]** Structured Data（JSON-LD）
  - 商品頁：`Product` schema（name, price, availability, image, review）
  - 文章頁：`Article` schema
  - FAQ 頁：`FAQPage` schema
  - 首頁：`Organization` + `WebSite` schema
- [-] **[P6-06]** Meta Tags 完整化
  - 每個頁面設定 `<title>`、`<meta description>`、`og:*`、`twitter:*`
  - 動態頁面從 DB 讀取 seoTitle / seoDescription
  - 預設 fallback 從 SiteSetting

#### 6C — 資安

- [x] **[P6-07]** CSRF 保護
  - Next.js Server Actions 內建 CSRF token
  - API Routes 額外驗證 Origin header
- [x] **[P6-08]** Rate Limiting
  - `src/lib/rate-limit.ts` → 基於 IP 速率限制
  - 登入 API：5 次/分鐘
  - 結帳 API：10 次/分鐘
  - 聯絡表單：3 次/分鐘
- [x] **[P6-09]** 資安檢查清單
  - 密碼用 bcrypt（cost ≥ 12）✓
  - Prisma 參數化查詢（非 raw SQL）✓
  - 富文字 sanitize-html ✓
  - 綠界 CheckMacValue 驗簽 ✓
  - HTTPS 強制（Vercel / Cloudflare 預設）
  - HttpOnly + Secure cookies（NextAuth）
  - 環境變數不外洩（client 端不含 ECPAY_HASHKEY）

#### 6D — 部署

- [ ] **[P6-10]** Vercel 部署設定
  - 連結 GitHub repo
  - 環境變數設定（production + preview）
  - Custom domain：`hanben.com.tw`
  - 預覽部署：PR 自動產生 preview URL
- [ ] **[P6-11]** PostgreSQL 部署
  - Neon / Supabase / Railway（managed PostgreSQL）
  - 設定 `DATABASE_URL` 連線字串
  - `npx prisma migrate deploy` 執行 migration
- [ ] **[P6-12]** DNS 設定
  - Cloudflare DNS：`hanben.com.tw` A/CNAME → Vercel
  - SSL 自動設置
  - 若 Shopify 有設定 301 redirect（如有路由變更）
- [ ] **[P6-13]** 上線驗證
  - 完整結帳流程測試（信用卡、ATM、超商）
  - 物流測試（B2C 測試）
  - RWD 測試（Desktop、Tablet、Mobile）
  - Lighthouse 分數 > 90（Performance、SEO、Accessibility）
  - 綠界正式商家資料（MerchantID + HashKey/IV）
- [ ] **[P6-14]** 監控 + 告警
  - Vercel Analytics（Web Vitals）
  - Sentry 錯誤追蹤（選配）
  - Uptime monitor（Cloudflare / UptimeRobot）

---

## 九、網站設定初始值

以下為根據前端復刻中確認的設定值，建立後台時需寫入初始設定：

```json
{
  "site_name": "漢本三代",
  "site_description": "漢本三代以傳承發揚漢方智慧守護為己任，遵循養護之道",
  "logo_url": "https://www.hanben.com.tw/cdn/shop/files/LOGO_f4b71859-d7d6-46b3-b87d-1a23e2cb2d6a.png?v=1767855876",
  "favicon_url": "/cdn/shop/files/han.png",
  "font_family": "Noto Serif TC",
  "primary_color": "#B72020",
  "gradient_start": "#0a0e88",
  "gradient_end": "#00b1ce",
  "contact_phone": "0800-000-848",
  "contact_address": "",
  "service_hours": "週一至週五 09:00 ~ 17:30",
  "facebook_pixel_id": "863478774420303",
  "google_analytics_id": "GT-KVN7BBKM",
  "og_image": "/cdn/shop/files/social.jpg"
}
```

---

## 十、安全性考量

- CSRF Token 保護所有表單、API
- Rate Limiting（登入 API、結帳）
- 密碼 bcrypt 雜湊（cost factor ≥ 12）
- SQL Injection 保護（Prisma 參數化查詢）
- XSS 保護（富文字使用 sanitize-html）
- 綠界 CheckMacValue 驗簽
- 管理員操作 Audit Log
- 環境設定環境變數管理（.env）
- HTTPS 強制

---

## 十一、預估技術套件

```json
{
  "dependencies": {
    "next": "^15.0",
    "react": "^19.0",
    "prisma": "^7.0",
    "@prisma/client": "^7.0",
    "@prisma/adapter-pg": "^7.0",
    "next-auth": "^5.0",
    "bcryptjs": "^3.0",
    "@tiptap/react": "^2.0",
    "tailwindcss": "^4.0",
    "@radix-ui/react-*": "latest",
    "zod": "^3.0",
    "react-hook-form": "^7.0",
    "uploadthing": "^7.0",
    "@tanstack/react-table": "^8.0",
    "@tanstack/react-query": "^5.0",
    "recharts": "^2.0",
    "resend": "^4.0",
    "date-fns": "^4.0",
    "sharp": "^0.33",
    "sanitize-html": "^2.0",
    "zustand": "^5.0",
    "@dnd-kit/core": "^6.0",
    "@dnd-kit/sortable": "^8.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^3.0",
    "@next/bundle-analyzer": "^15.0",
    "@sentry/nextjs": "^8.0"
  }
}
```

---

## 附記：重要技術細節

### DB 客戶端
- 永遠使用 `db`（來自 `src/lib/db.ts`），不要直接用 `prisma`
- Prisma 類型引入：`import { type Prisma } from "@/generated/prisma/client"`

### 計畫文件寫入
- 永遠使用 `[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)`
- 不使用 PowerShell `Set-Content`（預設 ANSI，會破壞中文）

### 環境資訊
- PostgreSQL：Docker 容器，port 5433
- 管理員帳號：`admin@hanben.com.tw` / `Hanben@2025!`
- 開發伺服器：`http://localhost:3000/admin`
- Prisma 輸出路徑：`src/generated/prisma`
