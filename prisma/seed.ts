import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";
import {
  getManagedLegacyOfficialUrl,
  replaceLegacyOfficialUrlsInJson,
} from "../src/lib/legacy-official-media";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

function createSeedTemplateContent({
  eyebrow,
  heading,
  body,
  mediaUrl,
  spotlightTitle,
  spotlightBody,
  spotlightMediaUrl,
}: {
  eyebrow?: string;
  heading: string;
  body?: string;
  mediaUrl?: string;
  spotlightTitle?: string;
  spotlightBody?: string;
  spotlightMediaUrl?: string;
}) {
  return {
    hero: {
      eyebrow,
      heading,
      body,
      mediaType: mediaUrl ? "image" : undefined,
      mediaUrl,
      mediaAlt: mediaUrl ? heading : undefined,
    },
    spotlight: {
      title: spotlightTitle,
      body: spotlightBody,
      mediaType: spotlightMediaUrl ? "image" : undefined,
      mediaUrl: spotlightMediaUrl,
      mediaAlt: spotlightMediaUrl ? spotlightTitle || heading : undefined,
    },
  };
}

function createKnowledgeArticleBody({
  intro,
  sections,
  faqs,
}: {
  intro: string;
  sections: Array<{ title: string; body: string; bullets?: string[] }>;
  faqs?: Array<{ question: string; answer: string }>;
}) {
  const faqMarkup = faqs && faqs.length > 0
    ? `<section><h2>常見問題</h2>${faqs.map((faq) => `<h3>${faq.question}</h3><p>${faq.answer}</p>`).join("")}</section>`
    : "";

  return `<p>${intro}</p>${sections
    .map((section) => `<section><h2>${section.title}</h2><p>${section.body}</p>${section.bullets && section.bullets.length > 0 ? `<ul>${section.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>` : ""}</section>`)
    .join("")}${faqMarkup}<p>免責聲明：本站所提供或刊載之醫學與健康文章，僅作為就醫參考使用，不具醫療、診療、治療之目的或功能。</p>`;
}

function withManagedLegacyUrls<T>(value: T): T {
  return replaceLegacyOfficialUrlsInJson(value);
}

async function main() {
  console.log("🌱 開始植入初始資料...");

  // ── 1. SUPER_ADMIN ────────────────────────────────────
  const adminEmail = "admin@hanben.com.tw";
  const existing = await db.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash("Hanben@2025!", 12);
    await db.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash: hash,
        name: "超級管理員",
        role: "SUPER_ADMIN",
      },
    });
    console.log(`✅ AdminUser 建立：${adminEmail} (密碼: Hanben@2025!)`);
  } else {
    console.log(`⏭️  AdminUser 已存在：${adminEmail}`);
  }

  // ── 2. 部落格分類 ──────────────────────────────────────
  const channels = [
    { title: "最新消息", slug: "news", description: "品牌公告、活動資訊與最新上架消息。" },
    { title: "痠痛日常", slug: "sore-daily-life", description: "" },
    { title: "養護知識", slug: "knowledge", description: "把官方養護主題整合進站內，集中整理久坐、姿勢、關節與熟齡保養文章。" },
  ];
  for (const ch of channels) {
    await db.blogChannel.upsert({
      where: { slug: ch.slug },
      update: { title: ch.title, description: ch.description },
      create: ch,
    });
  }
  console.log("✅ BlogChannel 建立：最新消息 / 痠痛日常 / 養護知識");

  // ── 3. 導覽選單 ────────────────────────────────────────
  const header = await db.navigationMenu.upsert({
    where: { location: "header" },
    update: {},
    create: { location: "header" },
  });
  const footer = await db.navigationMenu.upsert({
    where: { location: "footer" },
    update: {},
    create: { location: "footer" },
  });

  // 清空舊 items（避免重複執行產生重複資料）
  await db.navigationItem.deleteMany({ where: { menuId: header.id } });
  await db.navigationItem.deleteMany({ where: { menuId: footer.id } });

  const headerItems: Array<{ title: string; url: string; sortOrder: number; isExternal?: boolean }> = [
    { title: "購買舒活飲", url: "/collections/all", sortOrder: 0 },
    { title: "安心保證", url: "/pages/certification", sortOrder: 1 },
    { title: "養護知識", url: "/blogs/knowledge", sortOrder: 2 },
    { title: "漢方小百科", url: "/pages/chinese-herbal-guide", sortOrder: 3 },
    { title: "痠痛日常", url: "/pages/sore-daily-life", sortOrder: 4 },
    { title: "常見QA", url: "/pages/qa", sortOrder: 5 },
    { title: "聯絡我們", url: "/pages/contact", sortOrder: 6 },
    { title: "關於", url: "/pages/about", sortOrder: 7 },
  ];
  await db.navigationItem.createMany({
    data: headerItems.map((i) => ({ ...i, isExternal: i.isExternal ?? false, menuId: header.id })),
  });

  const footerItems = [
    { title: "退換貨政策", url: "/pages/return-policy", sortOrder: 0 },
    { title: "隱私權政策", url: "/pages/privacy", sortOrder: 1 },
    { title: "常見QA", url: "/pages/qa", sortOrder: 2 },
    { title: "安心保證", url: "/pages/certification", sortOrder: 3 },
    { title: "關於", url: "/pages/about", sortOrder: 4 },
    { title: "聯絡我們", url: "/pages/contact", sortOrder: 5 },
  ];
  await db.navigationItem.createMany({
    data: footerItems.map((i) => ({ ...i, menuId: footer.id })),
  });
  console.log("✅ NavigationMenu 建立：header / footer");

  // ── 4. 網站設定 ────────────────────────────────────────
  const settings = [
    { key: "site_name", value: "漢本三代", type: "text", group: "general", label: "網站名稱" },
    { key: "site_tagline", value: "傳承三代的漢方智慧", type: "text", group: "general", label: "網站副標語" },
    { key: "site_logo_url", value: getManagedLegacyOfficialUrl("/official/shared/header-logo.png"), type: "text", group: "general", label: "網站 Logo" },
    { key: "contact_phone", value: "0800-000-848", type: "text", group: "contact", label: "客服電話" },
    { key: "contact_email", value: "service@hanben.com.tw", type: "text", group: "contact", label: "客服 Email" },
    { key: "contact_address", value: "243新北市泰山區仁義路222號1樓", type: "text", group: "contact", label: "公司地址" },
    { key: "service_hours", value: "周一至週五(09:00 ~ 17:30)", type: "text", group: "contact", label: "服務時間" },
    { key: "brand_statement", value: "用承襲三代的漢方智慧 - 守護三代的行動關鍵", type: "text", group: "general", label: "品牌宣言" },
    { key: "brand_summary", value: "漢本三代 ─ 全天然漢方，科學精萃，穩固強健，維持行動關鍵", type: "text", group: "general", label: "品牌摘要" },
    { key: "facebook_url", value: "https://www.facebook.com/hanben3rd", type: "text", group: "social", label: "Facebook" },
    { key: "instagram_url", value: "https://www.instagram.com/hanben3rd/", type: "text", group: "social", label: "Instagram" },
    { key: "line_url", value: "https://line.me/R/ti/p/@hanben", type: "text", group: "social", label: "LINE 官方帳號" },
    { key: "facebook_pixel_id", value: "863478774420303", type: "text", group: "social", label: "Facebook Pixel ID" },
    { key: "ga_id", value: "GT-KVN7BBKM", type: "text", group: "social", label: "Google Analytics ID" },
    { key: "google_search_console_verification", value: "", type: "text", group: "seo", label: "Google Search Console 驗證碼" },
    { key: "google_tag_manager_id", value: "", type: "text", group: "social", label: "Google Tag Manager 容器 ID" },
    { key: "google_ads_id", value: "", type: "text", group: "social", label: "Google Ads ID" },
    { key: "google_ads_conversion_label", value: "", type: "text", group: "social", label: "Google Ads Conversion Label" },
    { key: "tracking_home_featured_list_id", value: "homepage:featured-products", type: "text", group: "analytics", label: "首頁商品清單 List ID" },
    { key: "tracking_home_featured_list_name", value: "", type: "text", group: "analytics", label: "首頁商品清單 List Name 覆寫" },
    { key: "tracking_collection_list_id_prefix", value: "collection:", type: "text", group: "analytics", label: "分類頁 List ID 前綴" },
    { key: "tracking_search_list_id_prefix", value: "search:", type: "text", group: "analytics", label: "搜尋頁 List ID 前綴" },
    { key: "tracking_search_list_name_prefix", value: "搜尋結果：", type: "text", group: "analytics", label: "搜尋頁 List Name 前綴" },
    { key: "meta_capi_access_token", value: "", type: "password", group: "social", label: "Meta CAPI Access Token" },
    { key: "meta_capi_test_event_code", value: "", type: "text", group: "social", label: "Meta CAPI Test Event Code" },
    { key: "meta_graph_api_version", value: "v22.0", type: "text", group: "social", label: "Meta Graph API Version" },
    { key: "seo_title", value: "漢本三代 — 傳承三代的漢方智慧", type: "text", group: "seo", label: "全域 SEO 標題" },
    { key: "seo_description", value: "漢本三代提供高品質漢方養生產品，傳承三代製藥工藝，讓您感受來自大自然的養護力量。", type: "text", group: "seo", label: "全域 SEO 描述" },
    { key: "free_shipping_threshold", value: "1500", type: "text", group: "general", label: "滿額免運門檻 (元)" },
  ];
  for (const s of settings) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`✅ SiteSetting 建立：${settings.length} 筆設定`);

  // ── 5. 公告列 ──────────────────────────────────────────
  const announcement = await db.announcementBar.findFirst({ orderBy: { sortOrder: "asc" } });
  if (announcement) {
    await db.announcementBar.update({
      where: { id: announcement.id },
      data: {
        text: "全新靈活關鍵配方，優惠67折起！ 買1盒送5包，買2盒以上再享免運🚚",
        bgColor: "#C6974A",
        textColor: "#FFFFFF",
        isActive: true,
        sortOrder: 0,
      },
    });
  } else {
    await db.announcementBar.create({
      data: {
        text: "全新靈活關鍵配方，優惠67折起！ 買1盒送5包，買2盒以上再享免運🚚",
        bgColor: "#C6974A",
        textColor: "#FFFFFF",
        isActive: true,
        sortOrder: 0,
      },
    });
  }
  console.log("✅ AnnouncementBar 更新完成");

  // ── 6. 運費規則 ────────────────────────────────────────
  const ruleCount = await db.shippingRule.count();
  if (ruleCount === 0) {
    await db.shippingRule.createMany({
      data: [
        {
          name: "黑貓宅配 — 常溫",
          shippingMethod: "home_tcat",
          logisticsType: "Home",
          logisticsSubType: "TCAT",
          temperature: "0001",
          baseFee: 150,
          freeShippingMin: 1500,
          isActive: true,
          sortOrder: 0,
        },
        {
          name: "全家超商取貨",
          shippingMethod: "cvs_fami",
          logisticsType: "CVS",
          logisticsSubType: "FAMI",
          baseFee: 65,
          freeShippingMin: 1500,
          isActive: true,
          sortOrder: 1,
        },
        {
          name: "7-ELEVEN 取貨",
          shippingMethod: "cvs_unimart",
          logisticsType: "CVS",
          logisticsSubType: "UNIMART",
          baseFee: 65,
          freeShippingMin: 1500,
          isActive: true,
          sortOrder: 2,
        },
        {
          name: "萊爾富取貨",
          shippingMethod: "cvs_hilife",
          logisticsType: "CVS",
          logisticsSubType: "HILIFE",
          baseFee: 65,
          freeShippingMin: 1500,
          isActive: true,
          sortOrder: 3,
        },
      ],
    });
    console.log("✅ ShippingRule 建立：4 種物流");
  }

  // ── 7. 商品 / 集合 / 文章 ──────────────────────────────
  const productSeeds = withManagedLegacyUrls([
    {
      title: "【漢本三代】舒活飲 15包/盒",
      slug: "漢本三代-舒活飲",
      description: "從久坐、負重到日常緊繃，為現代人準備的高倍濃縮草本日常補給。",
      price: 2299,
      compareAtPrice: 2599,
      sku: "HB-SHY-001",
      inventory: 120,
      tags: ["舒活飲", "久坐", "草本保養"],
      imageUrl: "/official/home/product-1.jpg",
      imageUrls: [
        "/official/home/product-1.jpg",
        "/official/product/product-gallery-02.jpg",
        "/official/product/product-gallery-03.jpg",
      ],
      bodyHtml: `<div class="product-long-visuals"><img src="/official/product/product-long-01.jpg" alt="舒活飲產品介紹長圖 1" /><img src="/official/product/product-long-02.jpg" alt="舒活飲產品介紹長圖 2" /><img src="/official/product/product-long-03.jpg" alt="舒活飲產品介紹長圖 3" /><img src="/official/product/product-long-04.jpg" alt="舒活飲產品介紹長圖 4" /><img src="/official/product/product-long-05.jpg" alt="舒活飲產品介紹長圖 5" /><img src="/official/product/product-long-06.jpg" alt="舒活飲產品介紹長圖 6" /></div>`,
    },
    {
      title: "【漢本三代】舒活飲 15包/盒*2盒",
      slug: "漢本三代-舒活飲-15包-盒-2盒",
      description: "雙盒組適合建立至少一個月的循養節奏，是回購與初次體驗後升級的熱門組合。",
      price: 3899,
      compareAtPrice: 5198,
      sku: "HB-SHY-002",
      inventory: 80,
      tags: ["舒活飲", "雙盒組", "熱銷"],
      imageUrl: "/official/home/product-2.jpg",
      imageUrls: [
        "/official/home/product-2.jpg",
        "/official/product/product-gallery-02.jpg",
        "/official/product/product-gallery-03.jpg",
      ],
      bodyHtml: `<div class="product-long-visuals"><img src="/official/product/product-long-01.jpg" alt="舒活飲產品介紹長圖 1" /><img src="/official/product/product-long-02.jpg" alt="舒活飲產品介紹長圖 2" /><img src="/official/product/product-long-03.jpg" alt="舒活飲產品介紹長圖 3" /><img src="/official/product/product-long-04.jpg" alt="舒活飲產品介紹長圖 4" /><img src="/official/product/product-long-05.jpg" alt="舒活飲產品介紹長圖 5" /><img src="/official/product/product-long-06.jpg" alt="舒活飲產品介紹長圖 6" /></div>`,
    },
    {
      title: "【漢本三代】舒活飲 15包/盒*3盒",
      slug: "漢本三代-舒活飲-15包-盒-3盒",
      description: "品牌主推的三盒進階方案，適合希望完整建立長週期保養節奏的客群。",
      price: 5666,
      compareAtPrice: 7797,
      sku: "HB-SHY-003",
      inventory: 60,
      tags: ["舒活飲", "三盒組", "品牌主推"],
      imageUrl: "/official/home/product-3.jpg",
      imageUrls: [
        "/official/home/product-3.jpg",
        "/official/product/product-gallery-02.jpg",
        "/official/home/product-1.jpg",
      ],
      bodyHtml: `<div class="product-long-visuals"><img src="/official/product/product-long-01.jpg" alt="舒活飲產品介紹長圖 1" /><img src="/official/product/product-long-02.jpg" alt="舒活飲產品介紹長圖 2" /><img src="/official/product/product-long-03.jpg" alt="舒活飲產品介紹長圖 3" /><img src="/official/product/product-long-04.jpg" alt="舒活飲產品介紹長圖 4" /><img src="/official/product/product-long-05.jpg" alt="舒活飲產品介紹長圖 5" /><img src="/official/product/product-long-06.jpg" alt="舒活飲產品介紹長圖 6" /></div>`,
    },
    {
      title: "【漢本三代】舒活飲 15包/盒*4盒",
      slug: "漢本三代-舒活飲-15包-盒-4盒",
      description: "為家庭共享、長期自用與高頻回購設計的多盒方案。",
      price: 6999,
      compareAtPrice: 10396,
      sku: "HB-SHY-004",
      inventory: 40,
      tags: ["舒活飲", "家庭組", "多盒優惠"],
      imageUrl: "/official/home/product-4.jpg",
      imageUrls: [
        "/official/home/product-4.jpg",
        "/official/product/product-gallery-02.jpg",
        "/official/product/product-gallery-03.jpg",
      ],
      bodyHtml: `<div class="product-long-visuals"><img src="/official/product/product-long-01.jpg" alt="舒活飲產品介紹長圖 1" /><img src="/official/product/product-long-02.jpg" alt="舒活飲產品介紹長圖 2" /><img src="/official/product/product-long-03.jpg" alt="舒活飲產品介紹長圖 3" /><img src="/official/product/product-long-04.jpg" alt="舒活飲產品介紹長圖 4" /><img src="/official/product/product-long-05.jpg" alt="舒活飲產品介紹長圖 5" /><img src="/official/product/product-long-06.jpg" alt="舒活飲產品介紹長圖 6" /></div>`,
    },
    {
      title: "【漢本三代】舒活飲 5包口感體驗組",
      slug: "漢本三代-舒活飲-5包口感體驗組",
      description: "想先確認口感與飲用節奏，可從體驗組開始，快速認識舒活飲。",
      price: 550,
      compareAtPrice: 864,
      sku: "HB-SHY-005",
      inventory: 150,
      tags: ["舒活飲", "體驗組", "新客入門"],
      imageUrl: "/official/home/product-trial.jpg",
      imageUrls: [
        "/official/home/product-trial.jpg",
        "/official/product/product-gallery-02.jpg",
      ],
      bodyHtml: `<div class="product-long-visuals"><img src="/official/product/product-long-01.jpg" alt="舒活飲產品介紹長圖 1" /><img src="/official/product/product-long-02.jpg" alt="舒活飲產品介紹長圖 2" /><img src="/official/product/product-long-03.jpg" alt="舒活飲產品介紹長圖 3" /><img src="/official/product/product-long-04.jpg" alt="舒活飲產品介紹長圖 4" /><img src="/official/product/product-long-05.jpg" alt="舒活飲產品介紹長圖 5" /><img src="/official/product/product-long-06.jpg" alt="舒活飲產品介紹長圖 6" /></div>`,
    },
  ]);

  const seededProducts: Array<{ id: string; slug: string }> = [];

  for (const product of productSeeds) {
    const upsertedProduct = await db.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        description: product.description,
        bodyHtml: product.bodyHtml,
        vendor: "漢本三代",
        productType: "舒活飲",
        status: "ACTIVE",
        seoTitle: product.title,
        seoDescription: product.description,
        tags: product.tags,
      },
      create: {
        title: product.title,
        slug: product.slug,
        description: product.description,
        bodyHtml: product.bodyHtml,
        vendor: "漢本三代",
        productType: "舒活飲",
        status: "ACTIVE",
        seoTitle: product.title,
        seoDescription: product.description,
        tags: product.tags,
      },
    });

    const existingVariants = await db.variant.findMany({
      where: { productId: upsertedProduct.id },
      orderBy: { sortOrder: "asc" },
    });

    if (existingVariants[0]) {
      await db.variant.update({
        where: { id: existingVariants[0].id },
        data: {
          title: product.title.replace("【漢本三代】", "").trim(),
          sku: product.sku,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          inventory: product.inventory,
          isActive: true,
          sortOrder: 0,
        },
      });
    } else {
      await db.variant.create({
        data: {
          productId: upsertedProduct.id,
          title: product.title.replace("【漢本三代】", "").trim(),
          sku: product.sku,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          inventory: product.inventory,
          isActive: true,
          sortOrder: 0,
        },
      });
    }

    if (existingVariants.length > 1) {
      await db.variant.updateMany({
        where: {
          productId: upsertedProduct.id,
          id: { not: existingVariants[0].id },
        },
        data: { isActive: false },
      });
    }

    await db.productImage.deleteMany({ where: { productId: upsertedProduct.id } });
    await db.productImage.createMany({
      data: (product.imageUrls ?? [product.imageUrl]).map((url, index) => ({
        productId: upsertedProduct.id,
        url,
        altText: product.title,
        sortOrder: index,
      })),
    });

    seededProducts.push({ id: upsertedProduct.id, slug: upsertedProduct.slug });
  }
  console.log(`✅ 商品初始化：${productSeeds.length} 項`);

  const collectionSeeds = withManagedLegacyUrls([
    {
      title: "首頁",
      slug: "frontpage",
      description: "集中呈現目前主打的舒活飲系列與促銷方案。",
      imageUrl: "/official/home/product-trial.jpg",
      productSlugs: [
        "漢本三代-舒活飲-5包口感體驗組",
        "漢本三代-舒活飲",
        "漢本三代-舒活飲-15包-盒-2盒",
        "漢本三代-舒活飲-15包-盒-3盒",
        "漢本三代-舒活飲-15包-盒-4盒",
      ],
    },
    {
      title: "所有商品",
      slug: "all",
      description: "站內全部已上架商品。",
      imageUrl: "/official/home/product-trial.jpg",
      productSlugs: [
        "漢本三代-舒活飲-5包口感體驗組",
        "漢本三代-舒活飲",
        "漢本三代-舒活飲-15包-盒-2盒",
        "漢本三代-舒活飲-15包-盒-3盒",
        "漢本三代-舒活飲-15包-盒-4盒",
      ],
    },
  ]);

  for (const collection of collectionSeeds) {
    const savedCollection = await db.collection.upsert({
      where: { slug: collection.slug },
      update: {
        title: collection.title,
        description: collection.description,
        imageUrl: collection.imageUrl,
        isActive: true,
      },
      create: {
        title: collection.title,
        slug: collection.slug,
        description: collection.description,
        imageUrl: collection.imageUrl,
        isActive: true,
      },
    });

    await db.collectionProduct.deleteMany({ where: { collectionId: savedCollection.id } });
    await db.collectionProduct.createMany({
      data: collection.productSlugs.map((slug, index) => ({
        collectionId: savedCollection.id,
        productId: seededProducts.find((product) => product.slug === slug)!.id,
        sortOrder: index,
      })),
    });
  }
  console.log(`✅ 集合初始化：${collectionSeeds.length} 組`);

  const newsChannel = await db.blogChannel.findUnique({ where: { slug: "news" } });
  const soreChannel = await db.blogChannel.findUnique({ where: { slug: "sore-daily-life" } });
  const knowledgeChannel = await db.blogChannel.findUnique({ where: { slug: "knowledge" } });

  if (newsChannel && soreChannel && knowledgeChannel) {
    const articleSeeds = withManagedLegacyUrls([
      {
        channelId: newsChannel.id,
        title: "歡慶測試歡慶測試歡慶測試",
        slug: "歡慶測試歡慶測試歡慶測試",
        excerpt: "三代傳承、14 種成分公開與科學檢驗重點，整理成最新消息文章頁的主內容。",
        featureImage: "/official/news/news-test-hero.png",
        tags: ["最新消息", "活動", "測試文章"],
        bodyHtml: `<ul>
  <li>三代傳承・配方依據現代人體質持續精進，製作安全絕不妥協</li>
</ul>
<p>100%台灣製造，HACCP 與 ISO22000 雙認證食品廠生產</p>
<ul>
  <li>14種成分大公開・溫和看得見</li>
</ul>
<p>牛膝頭、刺五加、天仙果、白鶴靈芝、細本山葡萄、番紅花、</p>
<p>紅田烏、薑黃、黃耆、甘草、紅棗、桂花、雞屎藤、橄欖</p>
<ul>
  <li>科學檢驗・安全有憑有據</li>
</ul>
<p>嚴格檢驗410項農藥無殘留、400項西藥未檢出、4大項重金屬檢驗合格</p>
<ul>
  <li>專業團隊・層層把關</li>
</ul>
<p>中醫師 × 營養師 強強聯手監製，專業守護您的健康</p>
<ul>
  <li>匠心級原料標準</li>
</ul>
<p>三代嚴選14種草本漢方，給自家人高規安心的用料</p>`,
        content: createSeedTemplateContent({
          eyebrow: "LATEST NEWS",
          heading: "歡慶測試歡慶測試歡慶測試",
          body: "三代傳承、14 種成分公開與科學檢驗重點，整理成最新消息文章頁的主內容。",
          mediaUrl: "/official/news/news-test-hero.png",
          spotlightTitle: "活動資訊整理",
          spotlightBody: "這個區塊固定承接最新消息重點，可替換為活動主視覺、品牌公告圖或短影片。",
          spotlightMediaUrl: "/official/news/news-test-hero.png",
        }),
        publishedAt: new Date("2026-02-06T08:00:00+08:00"),
      },
      {
        channelId: soreChannel.id,
        title: "我什麼都沒做，我只是坐著",
        slug: "我什麼都沒做我只是坐著",
        excerpt: "工程師長時間久坐後，下背從緊繃變成突然無法站直，這是許多人再熟悉不過的痠痛日常。",
        featureImage: "/official/sore-daily-life/story-person-1.png",
        tags: ["痠痛日常", "久坐", "工程師"],
        bodyHtml: `<p>我每天坐在電腦前的時間很長，8 小時是基本，專案進度一忙，連起身喝水都忘記。原本只覺得下背有點緊，直到某次開完長會站起來，腰像突然被電到一樣，整個人站不直。</p><p>從那天開始，早上起床要扶著床沿，晚上翻身會被拉扯感痛醒。這種感受不是單純痠，而是每天都在提醒你：身體已經撐很久了。</p>`,
        content: createSeedTemplateContent({
          eyebrow: "SORE DAILY LIFE",
          heading: "我什麼都沒做，我只是坐著",
          body: "把使用者真實經驗拉到頁面第一屏，讓文章列表與內頁都維持一致的敘事結構。",
          mediaUrl: "/official/sore-daily-life/story-person-1.png",
          spotlightTitle: "久坐不是沒在消耗",
          spotlightBody: "這塊固定版位可用來放故事切面、診間觀察、或與文章主題呼應的品牌視覺。",
          spotlightMediaUrl: "/official/sore-daily-life/story-person-1.png",
        }),
        publishedAt: new Date("2026-03-12T08:00:00+08:00"),
      },
      {
        channelId: knowledgeChannel.id,
        title: "關節炎會好嗎？告別痛到睡不著，4大關節炎的自我檢測與保養筆記！",
        slug: "arthritis-self-check-care",
        excerpt: "從退化性、類風濕、痛風到僵直性關節炎，先辨認自己的疼痛類型，再找到後續保養方向。",
        featureImage: "/official/home/knowledge-article-1.png",
        tags: ["銀髮族 & 陳年舊傷", "長期姿勢不良", "駕駛 & 辦公室久坐"],
        bodyHtml: createKnowledgeArticleBody({
          intro: "躺著也痛、坐著也痛，甚至痛到睡不著，這類關節炎的不適不只影響行動，也會拖累日常情緒與睡眠品質。",
          sections: [
            {
              title: "你是哪一種關節炎？",
              body: "雖然都是關節痛，但成因並不相同，先辨識自己的疼痛樣態，後續的處理才不會偏掉。",
              bullets: [
                "膝蓋卡卡、久坐站起來緊繃，常見於退化性關節炎前兆。",
                "早晨手指對稱腫痛、僵住，需留意類風濕性關節炎。",
                "半夜大腳趾紅腫劇痛，多半與痛風性關節炎有關。",
                "清晨下背僵硬到難以彎腰，則要提高對僵直性關節炎的警覺。",
              ],
            },
            {
              title: "決定會不會好的關鍵保養術",
              body: "關節保養不是追求立刻不痛，而是把未來十年、二十年的活動能力穩住。治療與保養要一起進行。",
              bullets: [
                "退化性關節炎重點是控制體重、維持肌力與適度活動。",
                "類風濕性關節炎要依醫師建議控制自體免疫反應。",
                "痛風性關節炎需留意高普林飲食與水分補充。",
                "僵直性關節炎要把伸展、復健與抗發炎管理放進日常。",
              ],
            },
          ],
          faqs: [
            { question: "關節炎可以搭配針灸或復健嗎？", answer: "可以，但前提是先確定類型與病程，再由醫療專業評估合適的節奏。" },
            { question: "關節痛是不是多吃葡萄糖胺就好？", answer: "不是。不同關節炎的成因不同，補充方向也不同，先診斷再補充才不會走錯路。" },
          ],
        }),
        content: createSeedTemplateContent({
          eyebrow: "KNOWLEDGE",
          heading: "關節炎會好嗎？告別痛到睡不著，4大關節炎的自我檢測與保養筆記！",
          body: "先用生活感受辨識關節炎類型，再把治療、營養與活動節奏排回日常。",
          mediaUrl: "/official/home/knowledge-article-1.png",
          spotlightTitle: "4 類常見關節炎整理",
          spotlightBody: "把退化性、類風濕、痛風與僵直性關節炎的典型特徵整理在同一篇，降低自我判斷門檻。",
          spotlightMediaUrl: "/official/home/knowledge-article-1.png",
        }),
        publishedAt: new Date("2026-01-05T08:00:00+08:00"),
      },
      {
        channelId: knowledgeChannel.id,
        title: "長骨刺是什麼感覺? 9成骨刺靠這二招，不再擔心骨刺會不會好",
        slug: "bone-spur-symptoms-treatment",
        excerpt: "多數骨刺不需要開刀，重點在於是否壓迫神經，以及你有沒有把日常活動與營養保養做對。",
        featureImage: "/official/home/knowledge-article-2.jpg",
        tags: ["搬重物勞損", "銀髮族 & 陳年舊傷", "長期姿勢不良"],
        bodyHtml: createKnowledgeArticleBody({
          intro: "一聽到骨刺，很多人第一個反應就是會不會要開刀。其實大部分骨刺只是老化與受力累積後的正常變化。",
          sections: [
            {
              title: "骨刺和一般腰背痛差在哪裡？",
              body: "骨刺是骨頭邊緣增生，多半在影像檢查才看得到；一般腰背痛則常來自肌肉、韌帶、姿勢或椎間盤負擔。",
              bullets: [
                "骨刺多半無感，除非真的壓到神經才會麻、痛、無力。",
                "一般腰背痛更常見於久坐久站、姿勢不良與過度使用。",
              ],
            },
            {
              title: "真正要擔心的是什麼？",
              body: "只有當骨刺增生到擠壓神經、而且復健與保守治療效果有限時，才會進一步討論手術。",
              bullets: [
                "平時要避免久坐久躺，維持穩定活動習慣。",
                "保養成分可留意牛膝頭、天仙果與日常蛋白質補充。",
              ],
            },
          ],
          faqs: [
            { question: "骨刺有可能靠保養縮回去嗎？", answer: "不會，但只要不壓迫神經，多數人可以透過保養與活動習慣和平共處。" },
            { question: "躺著反而腰更緊，是不是代表缺乏運動？", answer: "常常是。肌群長期僵硬時，躺下後反而更明顯，適度伸展與活動會比完全不動更有幫助。" },
          ],
        }),
        content: createSeedTemplateContent({
          eyebrow: "KNOWLEDGE",
          heading: "長骨刺是什麼感覺? 9成骨刺靠這二招，不再擔心骨刺會不會好",
          body: "先拆開骨刺的恐懼，再把真正該注意的壓迫警訊與保養重點說清楚。",
          mediaUrl: "/official/home/knowledge-article-2.jpg",
          spotlightTitle: "骨刺不是立刻等於開刀",
          spotlightBody: "多數骨刺不需要手術，真正重要的是神經壓迫警訊與穩定的日常管理。",
          spotlightMediaUrl: "/official/home/knowledge-article-2.jpg",
        }),
        publishedAt: new Date("2026-01-24T08:00:00+08:00"),
      },
      {
        channelId: knowledgeChannel.id,
        title: "走春行動力怎麼準備？熟齡族必懂的運動x營養補給重點",
        slug: "senior-mobility-exercise-nutrition",
        excerpt: "熟齡族要能走得久、蹲得下、抱得動，重點不是硬撐，而是把伸展、蛋白質與草本代謝支持一起準備好。",
        featureImage: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/159-1024x717.avif",
        tags: ["銀髮族 & 陳年舊傷", "駕駛 & 辦公室久坐"],
        bodyHtml: createKnowledgeArticleBody({
          intro: "新年、出遊或長時間與家人活動時，熟齡族最在意的其實不是行程，而是身體能不能跟上。",
          sections: [
            {
              title: "每天 10 分鐘把身體喚醒",
              body: "先用簡單伸展把肩頸、側腰與下背活動開，不必追求高強度，重點是讓循環與活動度回來。",
              bullets: [
                "肩頸放鬆運動降低早晨僵硬感。",
                "側腰伸展幫助站姿與步態更穩。",
                "站姿前彎則是喚醒後側肌群與下背。",
              ],
            },
            {
              title: "營養是行動力的基礎",
              body: "活動力不只靠走路，還要有足夠蛋白質、水分與穩定代謝支持。",
              bullets: [
                "每餐吃足蛋白質，像雞蛋、豆腐、魚肉與雞胸肉都可以。",
                "若飲食有落差，可留意刺五加、天仙果、牛膝頭與紅田烏等草本方向。",
              ],
            },
          ],
          faqs: [
            { question: "年紀大了還要勉強多走嗎？", answer: "不需要勉強，先把身體暖開、走得舒服，再慢慢增加時間才是正確節奏。" },
            { question: "不愛吃肉怎麼補蛋白質？", answer: "豆腐、豆漿、豆包與蛋都可以是穩定來源，重點是每餐都要有。" },
          ],
        }),
        content: createSeedTemplateContent({
          eyebrow: "KNOWLEDGE",
          heading: "走春行動力怎麼準備？熟齡族必懂的運動x營養補給重點",
          body: "把動、吃、補三件事一起安排，熟齡族的行動力才不會只靠意志力硬撐。",
          mediaUrl: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/159-1024x717.avif",
          spotlightTitle: "熟齡行動力的日常節奏",
          spotlightBody: "先把僵硬喚醒，再把蛋白質與代謝支持補回來，讓走春、久坐與照顧家人時都更從容。",
          spotlightMediaUrl: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/159-1024x717.avif",
        }),
        publishedAt: new Date("2026-02-12T08:00:00+08:00"),
      },
      {
        channelId: knowledgeChannel.id,
        title: "搬重物腰痛怎麼辦? 舒緩腰背痛的 3 組超有效核心肌群運動推薦",
        slug: "lower-back-pain-core-exercise",
        excerpt: "搬重物時最先撐不住的往往不是手，而是核心。把鳥狗式、收腹屈曲與橋式排進日常，比硬休息更有效。",
        featureImage: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/lower-back-pain-core-exercise-1024x768.avif",
        tags: ["搬重物勞損", "長期姿勢不良", "駕駛 & 辦公室久坐"],
        bodyHtml: createKnowledgeArticleBody({
          intro: "突然搬重物時腰像被電到，多半代表核心支撐早就不夠，只是在那一刻被放大了。",
          sections: [
            {
              title: "核心肌群為什麼是關鍵？",
              body: "核心不只腹部，還包括背部與臀部。這些肌群穩不住時，腰背就會代償吃力。",
              bullets: [
                "核心不夠強壯時，搬重物與彎腰都更容易受傷。",
                "年紀增長、疲勞累積與長期硬撐都會讓風險上升。",
              ],
            },
            {
              title: "每天 10 分鐘的 3 招訓練",
              body: "鳥狗式、收腹屈曲與橋式能同時兼顧穩定、控制與臀腿支撐，是最適合日常化的起點。",
              bullets: [
                "鳥狗式強化下背穩定與身體平衡。",
                "收腹屈曲幫助重新找回腹部出力。",
                "橋式則補上腿臀支撐，降低腰背代償。",
              ],
            },
          ],
          faqs: [
            { question: "休息就會自己好嗎？", answer: "不一定。若只是不動，僵硬感常常會更重，適度活動與漸進強化反而更重要。" },
            { question: "除了運動還要注意什麼？", answer: "蛋白質攝取、伸展與日常姿勢都要一起調整，才能真的改善腰背負擔。" },
          ],
        }),
        content: createSeedTemplateContent({
          eyebrow: "KNOWLEDGE",
          heading: "搬重物腰痛怎麼辦? 舒緩腰背痛的 3 組超有效核心肌群運動推薦",
          body: "把最常見的搬重物腰背痛，拆成核心不足、活動不足與保養不足三個面向處理。",
          mediaUrl: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/lower-back-pain-core-exercise-1024x768.avif",
          spotlightTitle: "核心訓練比硬撐更實際",
          spotlightBody: "用三個可反覆執行的動作補足支撐，讓腰背不再成為第一個垮掉的地方。",
          spotlightMediaUrl: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/lower-back-pain-core-exercise-1024x768.avif",
        }),
        publishedAt: new Date("2026-02-13T08:00:00+08:00"),
      },
      {
        channelId: knowledgeChannel.id,
        title: "長骨刺避免吃這三樣！椎間盤突出是骨刺嗎？40歲後腰痠背痛別硬扛",
        slug: "bone-spur-diet-disc-herniation-back-pain",
        excerpt: "骨刺與椎間盤突出不是同一件事，但兩者都與長期發炎、姿勢與生活習慣密切相關。",
        featureImage: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/kidney-pain-sick-back-woman-from-sedentary-work-1024x683.avif",
        tags: ["搬重物勞損", "銀髮族 & 陳年舊傷", "長時間站立", "長期姿勢不良", "駕駛 & 辦公室久坐"],
        bodyHtml: createKnowledgeArticleBody({
          intro: "很多人把椎間盤突出和骨刺混著說，但兩者的結構、機制與處理重點都不相同。",
          sections: [
            {
              title: "椎間盤突出和骨刺的差異",
              body: "骨刺是骨頭邊緣的增生，椎間盤突出則是椎間盤結構位移或破裂後壓迫神經。",
              bullets: [
                "骨刺多與退化、磨損與慢性發炎有關。",
                "椎間盤突出更常和姿勢不良、長期受壓與活動方式有關。",
              ],
            },
            {
              title: "飲食怎麼介入？",
              body: "40 歲後若已經出現腰痠背痛，抗發炎與抗氧化飲食要盡早放進日常。",
              bullets: [
                "可優先補充維生素 C、多酚、Omega-3、維生素 E 與穀胱甘肽來源。",
                "神經相關不適時，也要留意 B 群補充與整體飲食規律。",
              ],
            },
          ],
          faqs: [
            { question: "骨刺一定要開刀嗎？", answer: "大多數不需要，是否手術仍取決於神經壓迫程度與保守治療反應。" },
            { question: "素食者怎麼補 Omega-3？", answer: "可以考慮藻油與其他植物來源，重點是穩定補充。" },
          ],
        }),
        content: createSeedTemplateContent({
          eyebrow: "KNOWLEDGE",
          heading: "長骨刺避免吃這三樣！椎間盤突出是骨刺嗎？40歲後腰痠背痛別硬扛",
          body: "把最常被混淆的兩種腰背問題拆開，再把能立即開始的飲食與保養方向整理進來。",
          mediaUrl: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/kidney-pain-sick-back-woman-from-sedentary-work-1024x683.avif",
          spotlightTitle: "骨刺不是椎間盤突出",
          spotlightBody: "先搞懂差異，再決定後續到底要放重心在姿勢、復健還是抗發炎飲食。",
          spotlightMediaUrl: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/kidney-pain-sick-back-woman-from-sedentary-work-1024x683.avif",
        }),
        publishedAt: new Date("2026-02-24T08:00:00+08:00"),
      },
      {
        channelId: knowledgeChannel.id,
        title: "打麻將、追劇坐太久？簡單的5個椅子髖關節伸展運動，鬆開緊繃的下半身",
        slug: "hip-flexor-stretch-chair-exercise",
        excerpt: "不必站起來大幅度拉筋，坐在椅子上也能把髖關節、臀部與大腿後側慢慢喚醒。",
        featureImage: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/woman-doing-yoga-home-1024x684.avif",
        tags: ["長期姿勢不良", "駕駛 & 辦公室久坐"],
        bodyHtml: createKnowledgeArticleBody({
          intro: "過年打麻將、在家追劇或長時間坐車後，下半身緊到站起來像被鎖住，是很多人共同的經驗。",
          sections: [
            {
              title: "為什麼一坐久就會腰痠腳麻？",
              body: "久坐會壓迫血管與神經，讓循環與氧氣供應下降，腰、大腿與小腿很快就會出現沉重與麻感。",
            },
            {
              title: "5 個椅子上就能完成的伸展",
              body: "重點不是做得多激烈，而是用安全、可持續的方式讓髖關節與臀腿慢慢打開。",
              bullets: [
                "抱膝運動放鬆下半身並喚醒腹部出力。",
                "雙腳伸展法增加大腿與循環活性。",
                "坐姿翹腳拉伸可針對梨狀肌與臀部卡卡感。",
                "坐姿拉髖與坐姿前行則幫助整體恢復活動度。",
              ],
            },
          ],
          faqs: [
            { question: "久坐多久算太久？", answer: "連續六小時以上就有明顯健康風險，最好每 40 到 60 分鐘就起身活動。" },
            { question: "起身後如何安全拉筋？", answer: "先做舒緩動作讓關節活起來，再做拉筋會比一開始就硬拉安全得多。" },
          ],
        }),
        content: createSeedTemplateContent({
          eyebrow: "KNOWLEDGE",
          heading: "打麻將、追劇坐太久？簡單的5個椅子髖關節伸展運動，鬆開緊繃的下半身",
          body: "把最容易在家執行的椅子伸展收成一篇，適合久坐族與熟齡族直接照著做。",
          mediaUrl: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/woman-doing-yoga-home-1024x684.avif",
          spotlightTitle: "椅子上也能完成的髖關節伸展",
          spotlightBody: "用低門檻動作改善下半身緊繃，不必等到痛了才想到要活動。",
          spotlightMediaUrl: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/woman-doing-yoga-home-1024x684.avif",
        }),
        publishedAt: new Date("2026-03-04T08:00:00+08:00"),
      },
      {
        channelId: knowledgeChannel.id,
        title: "久坐屁股痛怎麼辦？圖解屁股痛位置與常見原因，助你找回久坐舒適感",
        slug: "buttock-pain-sitting-causes",
        excerpt: "屁股痛不只是坐太久而已，從梨狀肌、坐骨神經到椎間盤與腰椎結構，都可能是痛感來源。",
        featureImage: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/852-1024x796.avif",
        tags: ["長期姿勢不良", "駕駛 & 辦公室久坐"],
        bodyHtml: createKnowledgeArticleBody({
          intro: "屁股痛的位置不同，背後代表的原因也不同。如果只把它當作坐太久，常常會錯過真正該處理的問題。",
          sections: [
            {
              title: "先分辨你是哪一種屁股痛",
              body: "臨床上常見的類型包含梨狀肌症候群、坐骨神經痛、椎間盤突出、腰椎滑脫，以及腿後肌群過度緊繃。",
              bullets: [
                "大腿與小腿一起痠痛，常見於梨狀肌問題。",
                "一路從下背放射到腳底，多半要留意坐骨神經。",
                "有灼燒、刺痛或電到感時，常要排除椎間盤突出。",
              ],
            },
            {
              title: "日常怎麼改善？",
              body: "正確坐姿、腰椎支撐、定時起身與營養補給，是最基本也最有效的四件事。",
              bullets: [
                "每 90 分鐘至少起身活動 30 秒。",
                "久坐時可加靠背墊，降低腰椎壓力。",
                "若疼痛持續超過 2 到 4 週，請儘早安排就醫。",
              ],
            },
          ],
          faqs: [
            { question: "椅子太硬或沒有靠背會影響嗎？", answer: "會，這會增加臀部與下背壓力，也讓梨狀肌與腰椎更容易代償。" },
            { question: "屁股有燒灼感是不是很嚴重？", answer: "常見於神經性疼痛，未必等於一定要手術，但需要專業評估。" },
          ],
        }),
        content: createSeedTemplateContent({
          eyebrow: "KNOWLEDGE",
          heading: "久坐屁股痛怎麼辦？圖解屁股痛位置與常見原因，助你找回久坐舒適感",
          body: "先把痛感位置拆開理解，再安排正確的就醫與改善順序，避免一直誤判。",
          mediaUrl: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/852-1024x796.avif",
          spotlightTitle: "屁股痛位置對照整理",
          spotlightBody: "從梨狀肌到坐骨神經，讓不同痛點背後的結構差異更容易被看懂。",
          spotlightMediaUrl: "https://blog.hanben.com.tw/wp-content/uploads/2026/02/852-1024x796.avif",
        }),
        publishedAt: new Date("2026-03-13T08:00:00+08:00"),
      },
      {
        channelId: knowledgeChannel.id,
        title: "還在煩惱久坐腰痛怎麼辦？這 3 個辦公室久坐運動，午休時間就能輕鬆練",
        slug: "office-sitting-back-pain-exercise",
        excerpt: "久坐腰痛很多時候不是大傷，而是肌肉緊繃、臀腿失憶與缺乏活動造成的連鎖反應。",
        featureImage: "/official/home/knowledge-article-1.png",
        tags: ["長期姿勢不良", "駕駛 & 辦公室久坐"],
        bodyHtml: createKnowledgeArticleBody({
          intro: "每天坐滿八小時，下班時像拖著一整塊石頭回家，這種久坐腰痛很多人都很熟悉。",
          sections: [
            {
              title: "常見兩大元凶",
              body: "久坐後的放射痛與麻感，常跟坐骨神經受壓或梨狀肌發炎有關，兩者也可能互相影響。",
            },
            {
              title: "午休就能做的 3 個辦公室動作",
              body: "與其等下班再硬撐去運動，不如先在工作空檔用小動作把壓力釋放掉。",
              bullets: [
                "坐姿抬腿喚醒大腿前側與腹部支撐。",
                "站姿後抬腿找回臀部發力，減少腰部代償。",
                "跨腿伸展打開臀部與大腿外側，降低下腰緊繃。",
              ],
            },
          ],
          faqs: [
            { question: "每天做這 3 招真的有用嗎？", answer: "多數人連續 1 到 2 週就會有感，重點在規律而不是一次做很久。" },
            { question: "除了運動還能怎麼預防？", answer: "每坐 40 到 60 分鐘起身活動、補強核心與注意循環代謝，會比只靠椅子有效。" },
          ],
        }),
        content: createSeedTemplateContent({
          eyebrow: "KNOWLEDGE",
          heading: "還在煩惱久坐腰痛怎麼辦？這 3 個辦公室久坐運動，午休時間就能輕鬆練",
          body: "把午休前後都能完成的三個微復健動作整理起來，讓久坐族有立即可做的站內版本。",
          mediaUrl: "/official/home/knowledge-article-1.png",
          spotlightTitle: "午休就能完成的微復健",
          spotlightBody: "從久坐腰痛到下半身沉重感，先從最容易執行的三招開始，才有機會變成習慣。",
          spotlightMediaUrl: "/official/home/knowledge-article-1.png",
        }),
        publishedAt: new Date("2026-03-18T08:00:00+08:00"),
      },
      {
        channelId: knowledgeChannel.id,
        title: "久坐尾椎痛真相！換了適合久坐的椅子腰還是痛? 小心別讓長期發炎演變成骨刺危機",
        slug: "prolonged-sitting-tailbone-pain-bone-spur",
        excerpt: "真正讓尾椎痛越坐越明顯的，往往不是椅子本身，而是長時間不動、姿勢錯誤與持續發炎。",
        featureImage: "/official/home/knowledge-article-2.jpg",
        tags: ["長期姿勢不良", "駕駛 & 辦公室久坐"],
        bodyHtml: createKnowledgeArticleBody({
          intro: "很多人以為換了人體工學椅就能解決腰痠背痛，但若坐姿與久坐時間不改，尾椎與腰椎壓力還是會累積。",
          sections: [
            {
              title: "尾椎痛的早期警訊",
              body: "如果已經出現下背痛、坐一下就腳麻，甚至偶爾突然無力，代表脊椎與周邊神經可能正在承受慢性發炎壓力。",
            },
            {
              title: "久坐族一定要知道的 5 個小撇步",
              body: "先把坐姿與工作站條件調對，比一直尋找更貴的椅子更重要。",
              bullets: [
                "臀部坐滿椅面、背部貼靠椅背、腰部自然前凸。",
                "手肘維持約 90 到 95 度，手腕與前臂盡量成一直線。",
                "雙腳踩地、不翹腳，螢幕則落在視線略下方。",
              ],
            },
          ],
          faqs: [
            { question: "為什麼換了適合久坐的椅子還是痛？", answer: "因為關鍵常常不是椅子，而是你坐多久、怎麼坐，以及有沒有起身活動。" },
            { question: "除了調整坐姿，還能做什麼？", answer: "每 30 到 60 分鐘起身、適度伸展與補足營養，都是降低尾椎壓力的重要基礎。" },
          ],
        }),
        content: createSeedTemplateContent({
          eyebrow: "KNOWLEDGE",
          heading: "久坐尾椎痛真相！換了適合久坐的椅子腰還是痛? 小心別讓長期發炎演變成骨刺危機",
          body: "把尾椎痛、久坐與慢性發炎的關係說清楚，避免使用者把重點誤放在椅子價格上。",
          mediaUrl: "/official/home/knowledge-article-2.jpg",
          spotlightTitle: "椅子不是唯一答案",
          spotlightBody: "真正有效的是坐姿、活動節奏與日常保養一起調整，而不是只換設備。",
          spotlightMediaUrl: "/official/home/knowledge-article-2.jpg",
        }),
        publishedAt: new Date("2026-03-27T08:00:00+08:00"),
      },
      {
        channelId: knowledgeChannel.id,
        title: "久坐腳麻，甚至腰痠背痛行動硬梆梆？挑選保健品注意這抗發炎4大成分",
        slug: "sitting-numbness-back-pain-anti-inflammatory",
        excerpt: "當久坐、久站與外食習慣把身體推進慢性發炎節奏，單純休息往往不夠，還要從飲食與成分把火降下來。",
        featureImage: "/official/home/knowledge-article-1.png",
        tags: ["長時間站立", "駕駛 & 辦公室久坐"],
        bodyHtml: createKnowledgeArticleBody({
          intro: "很多人以為久坐腳麻只是累了，但如果腰痠、背痛與僵硬感反覆出現，常常代表慢性發炎早就在累積。",
          sections: [
            {
              title: "為什麼腰痠背痛常和慢性發炎有關？",
              body: "高糖、高油、壓力與久坐久站會讓身體處在不容易修復的狀態，關節與肌肉滑順度自然下降。",
            },
            {
              title: "4 個常見抗發炎成分",
              body: "面對保健品成分表，先抓住方向比背誦所有學名更重要。",
              bullets: [
                "薑黃有助於調節發炎反應與保護神經。",
                "天仙果與牛膝頭常被用於代謝與關節保養方向。",
                "刺五加則常見於體力與發炎支持。",
              ],
            },
          ],
          faqs: [
            { question: "只靠吃保健品就夠了嗎？", answer: "不夠，喝水、減少高油高糖與維持運動伸展，仍是改善循環與發炎的核心。" },
            { question: "外食族應該怎麼開始？", answer: "先從減少含糖飲與油炸開始，再補回足夠蔬果與蛋白質，會比一次追很多成分更穩。" },
          ],
        }),
        content: createSeedTemplateContent({
          eyebrow: "KNOWLEDGE",
          heading: "久坐腳麻，甚至腰痠背痛行動硬梆梆？挑選保健品注意這抗發炎4大成分",
          body: "把成分選擇與生活習慣放在一起講，避免知識頁只剩下保健品名詞堆疊。",
          mediaUrl: "/official/home/knowledge-article-1.png",
          spotlightTitle: "抗發炎不能只靠單一成分",
          spotlightBody: "先把生活節奏調整回來，再用成分輔助，久坐族的身體才有機會真正鬆開。",
          spotlightMediaUrl: "/official/home/knowledge-article-1.png",
        }),
        publishedAt: new Date("2026-04-08T08:00:00+08:00"),
      },
      {
        channelId: knowledgeChannel.id,
        title: "久坐膝蓋痛、大腿後側也痠？專業教你內外兼修的關節保養術",
        slug: "sitting-knee-pain-joint-care",
        excerpt: "久坐後的膝蓋卡卡與大腿後側痠痛，常常不是單純姿勢差，而是腰椎、肌肉鏈與營養狀態一起出了問題。",
        featureImage: "/official/home/knowledge-article-2.jpg",
        tags: ["長期姿勢不良", "駕駛 & 辦公室久坐"],
        bodyHtml: createKnowledgeArticleBody({
          intro: "久坐到站起來時膝蓋酸軟、大腿後側緊繃，很多人第一反應是貼布或擦藥，但真正的問題常常不只在表面。",
          sections: [
            {
              title: "為什麼會膝蓋痛？",
              body: "腰椎壓迫、梨狀肌與腿後肌群過緊，加上姿勢不良，都可能把痛感投射到膝蓋與大腿後側。",
              bullets: [
                "腰椎問題可能一路把痛感帶到膝蓋。",
                "久坐讓腿後肌群縮短、拉扯感更明顯。",
                "長期翹腳與駝背會讓關節受力越來越不平均。",
              ],
            },
            {
              title: "內外兼修的關節保養術",
              body: "真正有效的做法，是把營養與伸展一起做，不要只做其中一邊。",
              bullets: [
                "營養上可留意鈣質、維生素 D、蛋白質與抗發炎方向。",
                "動作上則可安排直抬腿、坐姿壓膝、抱膝與前後站姿伸展。",
              ],
            },
          ],
          faqs: [
            { question: "每天做伸展多久會有效？", answer: "多數人 3 到 7 天會先覺得比較鬆，2 到 4 週則能更明顯改善卡卡與痠痛。" },
            { question: "哪些警訊代表不只是久坐問題？", answer: "若休息後仍不改善、伴隨刺麻無力，或關節紅腫熱痛，應及早就醫確認。" },
          ],
        }),
        content: createSeedTemplateContent({
          eyebrow: "KNOWLEDGE",
          heading: "久坐膝蓋痛、大腿後側也痠？專業教你內外兼修的關節保養術",
          body: "從久坐膝蓋卡卡切入，把營養、肌肉鏈與辦公室可做的伸展一次整理完整。",
          mediaUrl: "/official/home/knowledge-article-2.jpg",
          spotlightTitle: "關節保養要內外一起做",
          spotlightBody: "只補營養或只拉筋都不夠，真正的關鍵是把兩邊一起納入日常。",
          spotlightMediaUrl: "/official/home/knowledge-article-2.jpg",
        }),
        publishedAt: new Date("2026-04-16T08:00:00+08:00"),
      },
    ]);

    for (const article of articleSeeds) {
      await db.blogArticle.upsert({
        where: {
          channelId_slug: {
            channelId: article.channelId,
            slug: article.slug,
          },
        },
        update: {
          title: article.title,
          excerpt: article.excerpt,
          bodyHtml: article.bodyHtml,
          content: article.content,
          featureImage: article.featureImage,
          author: "漢本三代",
          tags: article.tags,
          isPublished: true,
          publishedAt: article.publishedAt,
          seoTitle: article.title,
          seoDescription: article.excerpt,
        },
        create: {
          channelId: article.channelId,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          bodyHtml: article.bodyHtml,
          content: article.content,
          featureImage: article.featureImage,
          author: "漢本三代",
          tags: article.tags,
          isPublished: true,
          publishedAt: article.publishedAt,
          seoTitle: article.title,
          seoDescription: article.excerpt,
        },
      });
    }
    console.log(`✅ 文章初始化：${articleSeeds.length} 篇`);
  }

  // ── 8. 靜態頁面（含真實內容） ──────────────────────────
  const pagesData = withManagedLegacyUrls([
    {
      title: "關於我們",
      slug: "about",
      template: "default",
      isPublished: true,
      content: createSeedTemplateContent({
        eyebrow: "ABOUT HANBEN",
        heading: "關於漢本三代",
        body: "從祖父到第三代，品牌不是把漢方做成懷舊故事，而是把它做成現代人每天真的能用的節奏。",
        mediaUrl: "https://www.hanben.com.tw/cdn/shop/files/1_c888bc02-64ec-44f9-a64a-474ff658575c.jpg?v=1773392030",
        spotlightTitle: "三代傳承的核心",
        spotlightBody: "固定雙欄區塊用來放品牌主張、精神摘要與主視覺，讓『關於我們』頁不再只有一整篇富文本。",
        spotlightMediaUrl: "https://www.hanben.com.tw/cdn/shop/files/1_c888bc02-64ec-44f9-a64a-474ff658575c.jpg?v=1773392030",
      }),
      bodyHtml: `<h1>關於我們</h1>
<h2>品牌精神</h2>
<p>與時俱進的古老漢方智慧，為解決每一代都在傳承的痛點──下背的沉重，三代都在背負。漢本三代希望透過更可行的方式，持續的支撐著每一代都能「挺直」、「昂首」、「闊步」，自在的行動，動靜自如的生活，漢方即時補給，補氣強本，動靜自如。</p>
<p><strong>腰直了，氣順了，生活就有品質了</strong></p>
<h2>品牌堅持</h2>
<p>傳承三代，堅持「天然草本」的本心，不給身體額外負擔，只給您最精準、最便利的漢方滋補。漢本三代，為體貼每一代負重前行的你而存在。</p>
<h2>品牌故事</h2>
<h3>傳承三代的智慧 — 跨越世代的守護</h3>
<p>有些事情的開始，並非為了創業，而是為了守護；有些事情的傳承，不僅是事業，更是為了解決跨越時代的身體難題。</p>
<h3>從內經與古法中淬鍊出的第一代 — 汗水下的韌性</h3>
<p>在那個還在中藥行抓藥的年代，生活是靠勞力撐起來的。第一代創辦人看著街坊鄰里為了生計四處奔波，長期的負重與苦力，讓大家的背影漸漸沉重。那時的智慧，是深入研究古法、漢方草本，細心抓配每一帖漢方，為那些被生活壓彎的腰，注入一股溫熱的支撐力。祖父，是對漢方草本有著過人直覺的隱藏專家，數年研究古方草本記述，在草木性味中尋找答案。其中，他特別執著於洗髓、易筋的筋骨養護智慧──不只是止痛，更要讓失去彈性的身體重新找回支撐感。他的執著找到了讓自己跟家人在繁重日常中，能維持行動自如的漢方配方，後來私藏照護配方傳遍鄰里，祖父也成為了大家眼中的漢方達人。</p>
<h3>五千名顧客用身體見證的第二代 — 久坐間的積累</h3>
<p>時代在變，汗水變成了久坐的疲憊。在辦公室，勞動轉為長時間的伏案工作，看著人們因久坐而生的凝滯與沉重，漢本二代開始鑽研熬製技術，將古法化為更深層的調理。父親承接這份配方走進藥房，堅持親自燉煮、細火慢熬，將爺爺的智慧轉化為一包包充滿溫度的漢方藥包。在沒有網路行銷，只有口耳相傳的世代，十年來，超過五千名顧客用體感見證。</p>
<h3>從古法智慧進化到現代科學檢驗的漢方三代 — 低頭時的靈活</h3>
<p>到了現在，螢幕成為了生活的中心，人人成了低頭族。緊繃，不再是局部的問題，而是現代人的常態。身為第三代，深知傳統與便利必須並行，運用科學配方與高倍濃縮技術，讓漢方智慧化為隨撕隨飲的精華。不變的，是漢方的智慧，無論是苦力、久坐或低頭的世代，時代的困擾在變，但漢本三代守護的心未曾改變。</p>
<p>兩年前開始進行配方調整，更科學的比重、認證、檢驗。漢方科學──承襲祖父、父親推崇的古方智慧，以現代科學進行定性、定量分析，確認每一味草本的來源、品質、安全性，通過 400 多項無農藥、無西藥、無重金屬的高標檢驗。利用高溫濃縮萃取技術，將原本需熬煮數小時的精華，濃縮萃取成一包隨手撕開、3 秒即飲的舒活飲。</p>
<blockquote><p>「腰直了，氣順了，生活就有品質。」</p></blockquote>`,
    },
    {
      title: "聯絡我們",
      slug: "contact",
      template: "contact",
      isPublished: true,
      content: createSeedTemplateContent({
        eyebrow: "CONTACT",
        heading: "聯絡我們",
        body: "如果你想詢問產品、訂單、代理合作或使用方式，這裡是固定的聯絡入口與品牌接待頁。",
        mediaUrl: "https://www.hanben.com.tw/cdn/shop/files/1_c888bc02-64ec-44f9-a64a-474ff658575c.jpg?v=1773392030",
        spotlightTitle: "客服回覆節奏",
        spotlightBody: "後台可替換此處媒體與說明，前台則持續使用同一套固定聯絡 layout。",
      }),
      bodyHtml: `<h1>聯絡我們</h1>
<p>如有任何問題或需要協助，歡迎透過以下方式與我們聯繫，我們將盡快回覆您。</p>
<ul>
  <li>客服信箱：service@hanben.com.tw</li>
  <li>服務時間：週一至週五 09:00–18:00</li>
</ul>`,
    },
    {
      title: "常見問題",
      slug: "qa",
      template: "default",
      isPublished: true,
      content: createSeedTemplateContent({
        eyebrow: "FAQ",
        heading: "常見問題",
        body: "把最常見的使用與適用族群問題放在固定首屏，讓 FAQ 不再只是長文清單。",
      }),
      bodyHtml: `<h1>常見 QA</h1>
<h3>孕婦、哺乳婦女、兒童可以喝嗎？</h3>
<p>舒活飲含有番紅花萃取液，懷孕婦女忌食。如特殊疾病、哺乳婦女、12歲以下兒童，請洽醫療專業人員。</p>
<h3>生理期來可以喝嗎？</h3>
<p>先暫停飲用喔，讓身體自然代謝。生理期結束後的第 1~7 天，這時候最需要補充營養，疏通飲有刺五加、紅田烏可以促進新陳代謝，幫助增強體力。</p>
<h3>素食者可以喝嗎？</h3>
<p>舒活飲全漢方萃取，很適合全素者、蛋奶素者。</p>
<h3>有慢性病可以吃嗎？</h3>
<p>舒活飲每包50ml含磷7.4mg、鉀89.65mg，為低磷、低鉀的保健食品，不會造成多餘的負擔。若有特殊體質或慢性病狀況，歡迎先與我們專人諮詢或醫師討論。</p>
<h3>有腎臟問題的人適合喝嗎？</h3>
<p>純天然草本配方，每項食材經過檢驗認證，不傷肝、不傷身、不傷胃，不會有任何副作用，敬請安心使用。</p>
<h3>可以直接喝還是加熱？</h3>
<p>都可以，隨撕隨飲，常溫飲用即可，或是整包舒活飲不拆封泡在熱水裡 3~5 分鐘，隔水加熱後再撕開飲用。</p>
<h3>味道會不會很苦？</h3>
<p>舒活飲特別添加桂花、橄欖、甘草、紅棗，天然草本回甘特性，同時為了維持口感穩定與品質，加入微量的檸檬酸與蔗糖素（甜味劑），需要控糖的朋友也能安心飲用，整體喝起來是香甜的烏梅味。</p>
<h3>有沒有飲食禁忌？</h3>
<p>由於是天然漢方萃取，避免冰冷食物（生魚片、冰品）與啤酒等一起食用。有吃慢性藥、吃中藥、喝茶或喝咖啡，請間隔 1 小時。</p>
<h3>什麼時候吃？一天喝幾包最好？</h3>
<p>建議一天喝 2 包，早晚飯前空腹喝，讓舒活飲的全部營養素能夠好好吸收，搭配 300cc 溫開水吸收更好。</p>
<h3>我喝了兩包還沒感覺，是不是沒用？要喝多久才有用？</h3>
<p>此產品為草本飲品，非速效藥物，需要一定時間調理。輕症者約 1~2 週會感到改善，有些人則需持續飲用調理 1 個月才有效改善。</p>`,
    },
    {
      title: "安心保證",
      slug: "certification",
      template: "default",
      isPublished: true,
      content: createSeedTemplateContent({
        heading: "安心保證",
        mediaUrl: "/official/pages/certification-assurance.jpg",
      }),
      bodyHtml: "",
    },
    {
      title: "漢方小百科",
      slug: "chinese-herbal-guide",
      template: "default",
      isPublished: true,
      content: createSeedTemplateContent({
        eyebrow: "HERBAL GUIDE",
        heading: "漢方小百科",
        body: "把漢方成分先做一段總覽，再進入詳細條目，前台版型會更接近 reference 的閱讀節奏。",
      }),
      bodyHtml: `<h1>漢方小百科</h1>
<h2>台灣天仙果 — 打通行動根本</h2>
<p>台灣天仙果（俗稱羊奶頭、牛奶埔），因其多原生於深山溪澗旁的濕潤峭壁，環境險惡導致採集難度極高。其生長週期緩慢，種植後須經 3 至 4 年的精心培育方可收成，特殊香氣兼具保健作用，促進深層新陳代謝。</p>
<h2>牛膝頭 — 基礎行動力</h2>
<p>牛膝頭被譽為滋補強身的天然瑰寶，內涵豐富的牛溪多肽與牛膝皂甘等關鍵活性化合物，這些生物成分是維持身體靈活度的核心，由內而外提供穩固支撐，延續行動彈性，是維持靈活的最強後盾。</p>
<h2>細本山葡萄 — 來自深山的淬鍊</h2>
<p>細本山葡萄生長極為緩慢，因此特別珍貴。植物的每一寸都凝聚了白藜蘆醇（Resveratrol）衍生物，能深層調節生理機能，強化身體的基石，是延續行動力的頂級天然漢方植物。</p>
<h2>刺五加 — 打通行動根本</h2>
<p>生長於高緯度寒冷地帶，是當地長久以來被重視的草本植物之一。其所含的刺五加苷（Eleutherosides）與多酚類營養成分，被廣泛研究於日常活力維持與體能調節層面，特別適合長期處於高壓狀態的現代族群。</p>
<h2>白鶴靈芝 — 大自然的草本仙鶴</h2>
<p>白鶴靈芝草，因其花形如白鶴翩翩起舞，更有「仙鶴草」的美譽。其養生價值足以媲美靈芝。對於生活步調緊湊、燥熱體質的人來說，白鶴靈芝草是最好的「降火應援」。</p>
<h2>薑黃 — 行動守護</h2>
<p>薑黃為印度傳統草本智慧中備受重視的植物，其核心成分在於「薑黃素」。經現代科學實證，薑黃具備超強防護力，是滋補強身、調節生理機能的頂級食材，對於行動力保養與日常活動支持是不可或缺的成分。</p>
<h2>番紅花 — 紅色鑽石</h2>
<p>番紅花又稱藏紅花，每一朵花只能孕育出三根纖細而珍貴的火紅柱頭，需要耗時耗力人工採收。現代植萃研究發現番紅花含許多天然活性成分，能夠促進新陳代謝、幫助入睡，精準調節現代人的緊繃，找回彈性與韌性。</p>
<h2>紅田烏 — 濕地孕育的食養之葉</h2>
<p>紅田烏，又稱紅花蜜菜，是一種對生長環境極為講究的植物。營養分析顯示，紅田烏富含多酚類與類黃酮等植化成分，能支持身體正常代謝機能，為日常保養提供溫和而穩定的後盾。</p>
<h2>甘草 — 行動節奏的溫和支撐</h2>
<p>在東方傳統草本中，甘草長久以來扮演著不可或缺的角色，常被運用在複方之中，用其溫潤的特性，協調各種植萃成分，使舒活飲更加順和、更加耐飲。</p>
<h2>紅棗 — 溫潤調和</h2>
<p>紅棗是流傳千年的滋補果實，補氣生津、養顏美容，為身體導入源源不絕的元氣。舒活飲內添加了紅棗，增加自然甘潤風味，使口感更溫潤和順。</p>
<h2>黃耆 — 補氣之長</h2>
<p>在東方被視為重要的滋養型植物，其富含多種黃酮類、胺基酸等微量元素，具有益氣固表的作用，告別虛散狀態，重拾穩固的健康根基。</p>`,
    },
    {
      title: "養護知識",
      slug: "knowledge",
      template: "default",
      isPublished: true,
      content: createSeedTemplateContent({
        eyebrow: "KNOWLEDGE",
        heading: "養護知識",
        body: "把關節、骨刺與日常保養整理成站內閱讀入口，讓知識內容與主站導航維持同一條路徑。",
        mediaUrl: "/official/home/knowledge-article-1.png",
        spotlightTitle: "日常保養重點",
        spotlightBody: "先從最常見的關節緊繃、骨刺不適與日常活動卡卡開始理解，建立更穩定的保養節奏。",
        spotlightMediaUrl: "/official/home/knowledge-article-2.jpg",
      }),
      bodyHtml: `<section id="article-arthritis-self-check-care">
<h2>關節炎會好嗎？告別痛到睡不著，4 大關節炎的自我檢測與保養筆記！</h2>
<p>躺著也痛、坐著也痛，甚至半夜被關節僵硬或抽痛驚醒，往往不是單純疲勞，而是身體在提醒你該重新檢視關節負擔。</p>
<p>先從疼痛位置、僵硬時段、活動後是否改善等日常訊號做自我觀察，再配合固定伸展、減少久坐與穩定保養，通常比等到發作再處理更有效。</p>
</section>
<hr />
<section id="article-bone-spur-symptoms-treatment">
<h2>長骨刺是什麼感覺？9 成骨刺靠這二招，不再擔心骨刺會不會好</h2>
<p>不少人檢查後第一次聽到「骨刺」就緊張，但真正需要先釐清的是：不適來自發炎、壓迫、活動模式，還是長期姿勢與使用習慣。</p>
<p>多數情況下，比起反覆猜測，先穩定活動量、降低局部負擔，再搭配規律保養與正確使用身體，才是日常最可持續的方式。</p>
</section>`,
    },
    {
      title: "痠痛日常",
      slug: "sore-daily-life",
      template: "default",
      isPublished: true,
      content: createSeedTemplateContent({
        eyebrow: "SORE DAILY LIFE",
        heading: "痠痛日常",
        body: "這一頁固定承接真實案例、生活情境與讀者共感的入口敘事。",
      }),
      bodyHtml: `<h1>痠痛日常</h1>
<p>每一個人的痠痛，都有自己的故事。我們蒐集了真實使用者的日常，讓你知道——你不是一個人在撐著。</p>`,
    },
    {
      title: "痠痛日常文章",
      slug: "sore-daily-life-articles",
      template: "default",
      isPublished: true,
      content: createSeedTemplateContent({
        eyebrow: "CASE STORIES",
        heading: "痠痛日常文章",
        body: "把案例頁也收進同一套模板，未來就能由後台持續上新內容，不需要改前端結構。",
      }),
      bodyHtml: `<h1>痠痛日常</h1>
<h2>我什麼都沒做，我只是坐著</h2>
<p><em>工程師 / 39 歲</em></p>
<p>我每天坐在電腦前的時間很長，8 小時是基本，常常開始一個專案，就連喝水上廁所都忘記，更別說起來休息走動。本來只是覺得下背有點緊，想說休息一下就好，結果上上個月開完一場馬拉松會議，一站起來的瞬間──腰直接像被電到一樣。當下整個人瞬間當機，彎不下去也站不直，身體完全動不了，跟石頭一樣硬。</p>
<p>看了醫生說：你就是復健去！於是，開始我的復健人生。但從那天開始，我的腰就像被裝了某種奇怪的設定。早上起床，腰硬到要扶著床沿才能站起來。刷牙時也不敢往前彎，超怕那種痛到冒冷汗的感覺。</p>
<p>最難熬的是晚上，躺著也有事，什麼角度都不對。翻身時，下背像有一條被拉到快斷掉的繩子，一動就痛，角度錯一點，痠麻感整條腿直接爆衝下去。有時候被痛醒，只能盯著天花板等天亮，根本不可能睡好。</p>
<p>以前我以為腰痛就是小事，休息幾天就好。這種痛不是痛而已，每天都問自己：「明天會好嗎？」</p>
<hr/>
<h2>連好好抱起孩子，都變成一種奢求</h2>
<p><em>全職媽媽 / 35 歲</em></p>
<p>大家都說，當媽媽是世界上最幸福的事。真沒想到要用這麼大的代價來換。我今年三十五歲，孩子五歲，坐骨神經痛，也跟了我整整五年。從懷孕後期開始，我的腰就已經不是我的腰了，每天都覺得有條筋被拉住，卡卡的非常不舒服。</p>
<p>有一次，孩子哭著討抱，我蹲下去抱──就在那一瞬間，屁股深處突然「炸」開一陣酸麻，像電流一樣直接竄到腳底板。我痛到整個人跪在地上，孩子爆哭，我也沒辦法哄她，我一手扶著牆，冷汗直流，「天啊，我竟然連好好抱起他，都變成一種奢求？」</p>
<p>晚上終於可以躺下來休息，腰背卻開始作怪。不管側睡還是平躺，那種痠麻感就像螞蟻在骨頭裡鑽。常常痛醒看著熟睡的老公和孩子，我卻只能盯著天花板流淚。我才三十五歲，試過貼布、按摩，好沒兩天就又復發。我只想恢復正常生活，好好抱抱我的孩子。</p>`,
    },
    {
      title: "退換貨需知",
      slug: "return-policy",
      template: "default",
      isPublished: true,
      content: createSeedTemplateContent({
        eyebrow: "POLICY",
        heading: "退換貨需知",
        body: "",
      }),
      bodyHtml: `<h1>退換貨需知</h1>
<p>親愛的顧客您好，為保障您的權益，請您在購買前詳閱以下退換貨規則：</p>
<h2>鑑賞期說明</h2>
<p>從商品抵達您手上開始即擁有 7日鑑賞期（含例假日），以宅配單簽收日為憑。</p>
<ul>
  <li>鑑賞期並非試用期，僅供檢查外觀與功能，請勿實際使用。</li>
</ul>
<h2>退換貨須知</h2>
<p>商品必須為全新狀態，並保持完整包裝，包含紙箱、商品主體、配件、說明書、贈品等。</p>
<ul>
  <li>請勿於商品原包裝上黏貼紙張或書寫文字。</li>
  <li>退／換貨僅接受整筆訂單申請，恕不提供部分商品退換。</li>
  <li>參與活動（如任選、免運）之訂單，退貨時亦需整筆退回。</li>
  <li>目前不提供換貨服務，如需更換商品，請先申請退貨後重新下單。</li>
  <li>申請退貨後，該筆訂單所獲得之會員點數將全數扣除。</li>
</ul>
<h2>不受理退貨之情況</h2>
<ul>
  <li>超過七日鑑賞期。</li>
  <li>商品有明顯使用痕跡或非新品狀態。</li>
  <li>訂單中有任一項商品已拆封，在沒有任何瑕疵或損壞的情況下，即使其他商品為全新，也不接受退換貨服務。</li>
  <li>食品一經拆封、食用、保存不當導致變質者。</li>
  <li>商品或其附屬品（說明書、贈品、配件等）不完整。</li>
  <li>因人為因素造成損傷、刮痕、變質或包裝不完整。</li>
  <li>個人主觀口味或飲食習慣差異等非商品本身問題。</li>
  <li>未經客服確認，自行寄回商品者。</li>
  <li>銷售時已註明「不接受退換」者。</li>
</ul>
<h2>退貨流程</h2>
<ul>
  <li>請於收到商品後 7 日內聯絡客服。</li>
  <li>提供：姓名、訂單編號、聯絡電話、退貨商品名稱、退貨原因與照片。</li>
  <li>客服確認後，安排物流回收。</li>
  <li>請妥善包裝商品並維持原狀，以利退貨審核。</li>
</ul>
<h2>額外提醒事項</h2>
<ul>
  <li>本站商品經嚴格品質控管，請於效期內食用完畢。</li>
  <li>為維護食品衛生安全，商品一經拆封，除非品質異常，恕不接受退貨。</li>
  <li>收到商品後請立即檢查是否正確與完整，若有問題請於 7 日內聯繫客服，逾期恕不受理。</li>
  <li>如商品於運送途中有破損、變形或短缺情況，請立即向宅配人員反映，並拍照存證聯繫客服。</li>
  <li>食品為私人消耗性產品，除商品本身有瑕疵可退貨外，一經拆封、食用或消費者造成之外盒變形、失溫或保存不良導致變質，將會影響退貨權限。</li>
</ul>`,
    },
    {
      title: "隱私權政策",
      slug: "privacy",
      template: "default",
      isPublished: true,
      content: createSeedTemplateContent({
        eyebrow: "PRIVACY",
        heading: "隱私權政策",
        body: "",
      }),
      bodyHtml: `<h1>隱私權政策</h1>
<p>漢本（以下稱「本公司」）非常重視您的隱私權，以下說明本公司的個人資料保護政策。</p>
<h2>資料蒐集範圍</h2>
<p>本公司在您使用服務或購物時，可能蒐集您的姓名、聯絡電話、電子郵件、收件地址及訂單資訊。</p>
<h2>資料利用方式</h2>
<p>所蒐集資料僅用於訂單處理、客戶服務及商品資訊通知，不會出售或提供予第三方。</p>
<h2>資料安全</h2>
<p>本公司採用業界標準的安全措施保護您的個人資料，防止未經授權的存取。</p>
<h2>Cookie 政策</h2>
<p>本網站使用 Cookie 以提升瀏覽體驗及分析流量。繼續使用本網站即代表您同意我們的 Cookie 政策。</p>
<h2>聯絡我們</h2>
<p>如對本政策有任何疑問，請來信 service@hanben.com.tw。</p>`,
    },
  ]);

  for (const p of pagesData) {
    await db.page.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        bodyHtml: p.bodyHtml,
        content: p.content,
        template: p.template,
        isPublished: p.isPublished,
      },
      create: {
        title: p.title,
        slug: p.slug,
        bodyHtml: p.bodyHtml,
        content: p.content,
        template: p.template,
        isPublished: p.isPublished,
      },
    });
  }
  console.log(`✅ 靜態頁面初始化：${pagesData.length} 頁`);

  // ── FAQ ──────────────────────────────────────────────────
  const faqData = [
    {
      question: "孕婦可以服用漢本的產品嗎？",
      answer:
        "孕婦屬於特殊體質，建議在服用任何保健食品前先諮詢婦產科醫師。我們的產品為天然草本配方，但懷孕期間仍需謹慎，請依醫師建議使用。",
      category: "適用族群",
      sortOrder: 0,
      isActive: true,
    },
    {
      question: "生理期間可以服用嗎？",
      answer:
        "一般情況下可正常服用，但若您有特殊體質或月經量過多、血瘀等狀況，建議暫停或先諮詢中醫師後再行服用。",
      category: "適用族群",
      sortOrder: 1,
      isActive: true,
    },
    {
      question: "素食者可以食用嗎？",
      answer:
        "漢本的草本系列產品使用植物性原料，適合素食者食用。購買前請確認產品頁面標示的「素食可食」標章。",
      category: "適用族群",
      sortOrder: 2,
      isActive: true,
    },
    {
      question: "有慢性病或長期服藥，可以同時服用嗎？",
      answer:
        "有慢性疾病或正在服用處方藥物者，建議先諮詢您的主治醫師或藥師，確認無交互作用後再行服用。",
      category: "適用族群",
      sortOrder: 3,
      isActive: true,
    },
    {
      question: "有腎臟疾病可以服用嗎？",
      answer:
        "腎臟功能不佳者對於中草本的代謝能力較弱，建議服用前先諮詢腎臟科醫師，依個人狀況調整用量或避免使用。",
      category: "適用族群",
      sortOrder: 4,
      isActive: true,
    },
    {
      question: "產品可以加熱後飲用嗎？",
      answer:
        "可以。建議以 60°C 以下溫熱水沖泡或溫熱後飲用，避免高溫破壞有效成分。不建議直接用沸水或微波爐過度加熱。",
      category: "使用方式",
      sortOrder: 5,
      isActive: true,
    },
    {
      question: "產品為什麼有些苦味？",
      answer:
        "漢本的草本配方含有多種天然苦味植物成分（如黃耆、甘草等），苦味為天然草本特性，代表活性成分豐富。可搭配蜂蜜或溫水調配以改善口感。",
      category: "使用方式",
      sortOrder: 6,
      isActive: true,
    },
    {
      question: "服用時有什麼禁忌或注意事項？",
      answer:
        "請依建議用量服用，勿過量。服用期間建議減少生冷、辛辣食物。如出現任何不適症狀，請立即停用並諮詢醫師。本產品非藥品，不可取代醫療診治。",
      category: "使用方式",
      sortOrder: 7,
      isActive: true,
    },
    {
      question: "什麼時候服用效果最好？",
      answer:
        "一般建議餐前 30 分鐘或飯後 1 小時服用，吸收效果較佳。具體建議請參考各產品說明，或依個人作息調整為固定時間服用，以維持穩定的保養效果。",
      category: "使用方式",
      sortOrder: 8,
      isActive: true,
    },
    {
      question: "需要服用多久才會看到效果？",
      answer:
        "草本保健品講究持續調理，通常建議連續服用 4–8 週後評估效果。每個人體質不同，效果感受也有差異。建議搭配規律作息、均衡飲食，效果更佳。",
      category: "效果與成分",
      sortOrder: 9,
      isActive: true,
    },
  ];

  for (const faq of faqData) {
    await db.faqItem.upsert({
      where: {
        // FaqItem 沒有 unique slug，用 question 做唯一鍵或直接 create
        id: `seed-faq-${faq.sortOrder}`,
      },
      update: {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        sortOrder: faq.sortOrder,
        isActive: faq.isActive,
      },
      create: {
        id: `seed-faq-${faq.sortOrder}`,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        sortOrder: faq.sortOrder,
        isActive: faq.isActive,
      },
    });
  }
  console.log(`✅ FAQ 初始化：${faqData.length} 則`);

  // ── HomepageSection ──────────────────────────────────────
  await db.homepageSection.deleteMany({});
  const sections = withManagedLegacyUrls([
    {
      id: "seed-sec-0",
      sectionType: "hero_slider",
      title: "英雄橫幅",
      sortOrder: 0,
      isActive: true,
      content: {
        badgeLines: ["天然漢方", "0 重金屬", "0 農藥、西藥", "台灣研發生產"],
        autoplayMs: 7000,
        initialIndex: 2,
        slides: [
          {
            poster: "/official/home/hero-slide-1-poster.jpg",
            videoDesktop: "/official/home/hero-slide-1-desktop.mp4",
            videoMobile: "/official/home/hero-slide-1-mobile.mp4",
            alt: "漢本三代首頁輪播 1",
          },
          {
            poster: "/official/home/hero-slide-2-poster.jpg",
            videoDesktop: "/official/home/hero-slide-2-desktop.mp4",
            videoMobile: "/official/home/hero-slide-2-mobile.mp4",
            alt: "漢本三代首頁輪播 2",
          },
          {
            poster: "/official/home/hero-slide-3-poster.jpg",
            videoDesktop: "/official/home/hero-slide-3-desktop.mp4",
            videoMobile: "/official/home/hero-slide-3-mobile.mp4",
            alt: "漢本三代首頁輪播 3",
          },
          {
            poster: "/official/home/hero-slide-4-poster.jpg",
            videoDesktop: "/official/home/hero-slide-4-desktop.mp4",
            videoMobile: "/official/home/hero-slide-4-mobile.mp4",
            alt: "漢本三代首頁輪播 4",
          },
          {
            poster: "/official/home/hero-slide-5-poster.jpg",
            videoDesktop: "/official/home/hero-slide-5-desktop.mp4",
            videoMobile: "/official/home/hero-slide-5-mobile.mp4",
            alt: "漢本三代首頁輪播 5",
          },
          {
            poster: "/official/home/hero-slide-6-poster.jpg",
            videoDesktop: "/official/home/hero-slide-6-desktop.mp4",
            videoMobile: "/official/home/hero-slide-6-mobile.mp4",
            alt: "漢本三代首頁輪播 6",
          },
          {
            poster: "/official/home/hero-slide-7-desktop.jpg",
            imageDesktop: "/official/home/hero-slide-7-desktop.jpg",
            imageMobile: "/official/home/hero-slide-7-mobile.jpg",
            alt: "漢本三代首頁輪播 7",
          },
          {
            poster: "/official/home/hero-slide-8-desktop.jpg",
            imageDesktop: "/official/home/hero-slide-8-desktop.jpg",
            imageMobile: "/official/home/hero-slide-8-mobile.jpg",
            alt: "漢本三代首頁輪播 8",
          },
        ],
      },
    },
    {
      id: "seed-sec-1",
      sectionType: "brand_story",
      title: "首頁敘事",
      sortOrder: 1,
      isActive: true,
      content: {
        body: "<p>與時俱進的古老漢方智慧，為解決每一代都在傳承的痛點。那份難以言喻的沉重，每個世代都在負重前行。</p><p>漢本三代傳承了三代，現在透過更科學的方式，持續支撐著每一代能 —— 挺直、昂首、闊步。自在的行動，擁抱動靜自如的生活。</p><p>腰直了，氣順了，生活就有品質 —— 漢方即時補給，補氣強本，動靜自如。</p>",
        videoPoster: "/official/home/story-video-poster.jpg",
        videoUrl: "/official/home/story-video.mp4",
      },
    },
    {
      id: "seed-sec-2",
      sectionType: "stats_section",
      title: "首頁數據亮點",
      sortOrder: 2,
      isActive: true,
      content: {
        stats: [
          {
            title: "為生計負重",
            value: "90%",
            description: "關鍵負擔長期累積",
            iconUrl: "/official/home/stats-icon-1.png",
          },
          {
            title: "為事業久坐",
            value: "1.5倍",
            description: "坐比站多的腰部重壓",
            iconUrl: "/official/home/stats-icon-2.png",
          },
          {
            title: "為理想低頭",
            value: "27公斤",
            description: "脖子正替你扛著的理想",
            iconUrl: "/official/home/stats-icon-3.png",
          },
        ],
      },
    },
    {
      id: "seed-sec-3",
      sectionType: "product_showcase",
      title: "熱銷商品",
      subtitle: "挑選最接近 reference 首頁的舒活飲組合與價格節奏。",
      sortOrder: 3,
      isActive: true,
      content: {
        heading: "漢本三代舒活飲系列",
        subtitle: "從口感體驗組到長週期方案，首頁直接呈現目前品牌主推品項。",
        limit: 4,
      },
    },
    {
      id: "seed-sec-4",
      sectionType: "brand_commitment",
      title: "品牌堅持",
      sortOrder: 4,
      isActive: true,
      content: {
        headingLines: ["品牌堅持 ─ 天然 ∙ 安心 ∙ 科學", "嚴選14種珍貴漢方，保養有感"],
        bodyLines: [
          "無須反覆熬煮，常溫即撕即飲，科學且能真正落實於日常的保養",
          "✓天然純漢方 ✓0農藥 0重金屬 0西藥 ✓100%台灣品牌研發生產",
        ],
      },
    },
    {
      id: "seed-sec-5",
      sectionType: "feature_media",
      title: "品牌中段影片",
      sortOrder: 5,
      isActive: true,
      content: {
        poster: "/official/home/feature-video-poster.jpg",
        videoDesktop: "/official/home/feature-video-desktop.mp4",
        videoMobile: "/official/home/feature-video-mobile.mp4",
        alt: "漢本三代品牌形象影片",
      },
    },
    {
      id: "seed-sec-6",
      sectionType: "benefits_grid",
      title: "行動利益點",
      sortOrder: 6,
      isActive: true,
      content: {
        items: [
          { title: "釋放「沉」的負擔", iconUrl: "/official/home/benefit-icon-1.png" },
          { title: "享受「鬆」的舒展", iconUrl: "/official/home/benefit-icon-2.png" },
          { title: "鞏固「穩」的自信", iconUrl: "/official/home/benefit-icon-3.png" },
          { title: "體驗「順」的自由", iconUrl: "/official/home/benefit-icon-4.png" },
          { title: "撐起穩健體態", iconUrl: "/official/home/benefit-icon-5.png" },
          { title: "動靜自如不再受限", iconUrl: "/official/home/benefit-icon-6.png" },
          { title: "告別僵硬緊繃", iconUrl: "/official/home/benefit-icon-7.png" },
          { title: "無須繁瑣熬煮", iconUrl: "/official/home/benefit-icon-8.png" },
          { title: "無須忍受行動卡頓", iconUrl: "/official/home/benefit-icon-9.png" },
        ],
      },
    },
    {
      id: "seed-sec-7",
      sectionType: "assurance_section",
      title: "安心原則",
      sortOrder: 7,
      isActive: true,
      content: {
        heading: "漢本三代將「安心」設為第一原則",
        bodyLines: [
          "漢本三代開發的舒活飲適合長期補充、長期保養。",
          "我們提供細水長流的穩定支持，因此把關更嚴格，為身體多留一份餘裕。",
          "從安全標準起跑，讓真正該被重視的檢驗到位。",
        ],
        note: "讓日常保養，多一點安心。嚴格檢驗通過，是對健康最基本的尊重。",
        cards: [
          {
            title: "專業團隊・層層把關",
            body: "中醫師 × 營養師 強強聯手推薦",
            imageUrl: "/official/home/assurance-card-1.png",
            imageAlt: "專業團隊推薦",
            accentClassName: "bg-white",
          },
          {
            title: "科學檢驗・安全有憑有據",
            body: "0農藥、0西藥、0重金屬，低磷、鉀、普林",
            imageUrl: "/official/home/assurance-card-2.png",
            imageAlt: "檢驗報告與安心驗證",
            accentClassName: "bg-[#e7c95c]",
          },
        ],
      },
    },
    {
      id: "seed-sec-8",
      sectionType: "heritage_section",
      title: "三代傳承與製程",
      sortOrder: 8,
      isActive: true,
      content: {
        desktopImage: "/official/home/heritage-desktop.jpg",
        mobileImage: "/official/home/heritage-mobile.jpg",
        imageAlt: "漢本三代傳承與製程",
        items: [
          {
            title: "三代傳承・配方與時俱進",
            body: "100%台灣製造 HACCP 與 ISO22000 雙認證食品廠生產",
            iconUrl: "/official/home/heritage-icon-1.png",
          },
          {
            title: "匠心級原料標準",
            body: "嚴選14種草本漢方 給自家人高規安心的用料",
            iconUrl: "/official/home/heritage-icon-2.png",
          },
          {
            title: "科學萃取．滴滴精華",
            body: "有效成分穩定 隨時補充，液態吸收優勢",
            iconUrl: "/official/home/heritage-icon-3.png",
          },
        ],
      },
    },
    {
      id: "seed-sec-9",
      sectionType: "knowledge_section",
      title: "養護知識",
      sortOrder: 9,
      isActive: true,
      content: {
        heading: "養護知識",
        articles: [
          {
            title: "關節炎會好嗎？告別痛到睡不著，4大關節炎的自我檢測與保養筆記！",
            excerpt: "躺著也痛、坐著也痛，痛到睡不著；即便睡著了，半夜也常被關節那股鑽心的僵硬或抽痛給驚醒。",
            imageUrl: "/official/home/knowledge-article-1.png",
            imageAlt: "關節炎自我檢測與保養",
            href: "/blogs/knowledge/arthritis-self-check-care",
          },
          {
            title: "長骨刺是什麼感覺? 9成骨刺靠這二招，不再擔心骨刺會不會好",
            excerpt: "腰痠背痛是長骨刺嗎? 多數的人感覺到背部或關節痛痛麻麻的，去醫院檢查後醫師告訴你：長骨刺了！",
            imageUrl: "/official/home/knowledge-article-2.jpg",
            imageAlt: "骨刺症狀與保養方式",
            href: "/blogs/knowledge/bone-spur-symptoms-treatment",
          },
        ],
      },
    },
  ]);
  await db.homepageSection.createMany({ data: sections });
  console.log(`✅ HomepageSection 初始化：${sections.length} 個區塊`);

  // ── HeroSlide ────────────────────────────────────────────
  await db.heroSlide.deleteMany({});
  await db.heroSlide.createMany({
    data: withManagedLegacyUrls([
      {
        id: "seed-slide-0",
        title: "傳承三代的漢方智慧",
        subtitle: "嚴選天然草本，喚醒身體自癒力",
        imageDesktop: "/official/home/hero-slide-8-desktop.jpg",
        imageMobile: "/official/home/hero-slide-8-mobile.jpg",
        ctaText: "立即選購",
        ctaLink: "/collections/frontpage",
        sortOrder: 0,
        isActive: true,
      },
      {
        id: "seed-slide-1",
        title: "痠痛日常真實故事",
        subtitle: "把身體正在承受的事說清楚，才能找到適合自己的日常保養方式。",
        imageDesktop: "/official/home/knowledge-article-1.png",
        imageMobile: "/official/home/knowledge-article-1.png",
        ctaText: "閱讀文章",
        ctaLink: "/pages/sore-daily-life",
        sortOrder: 1,
        isActive: true,
      },
    ]),
  });
  console.log(`✅ HeroSlide 初始化：2 張`);

  console.log("\n🎉 Seed 完成！");
  console.log("──────────────────────────────────");
  console.log("管理員帳號：admin@hanben.com.tw");
  console.log("管理員密碼：Hanben@2025!");
  console.log("後台網址：http://localhost:3000/admin");
  console.log("──────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed 失敗：", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
