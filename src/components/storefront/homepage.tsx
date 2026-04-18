"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import type { HeroSlide, HomepageSection } from "@/generated/prisma/client";
import { useCartStore } from "@/lib/cart-store";
import { getManagedLegacyOfficialUrl } from "@/lib/legacy-official-media";
import type { ProductCard } from "@/lib/storefront";

type HeroMedia = {
  poster: string;
  alt?: string;
  imageDesktop?: string;
  imageMobile?: string;
  videoDesktop?: string;
  videoMobile?: string;
};

type StoryContent = {
  body?: string;
  videoPoster?: string;
  videoUrl?: string;
};

type StatItem = {
  title?: string;
  value?: string;
  description?: string;
  iconUrl?: string;
};

type BrandCommitmentContent = {
  headingLines?: string[];
  bodyLines?: string[];
};

type FeatureMediaContent = HeroMedia;

type BenefitItem = {
  title?: string;
  iconUrl?: string;
};

type AssuranceCard = {
  title?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  accentClassName?: string;
};

type AssuranceContent = {
  heading?: string;
  bodyLines?: string[];
  note?: string;
  cards?: AssuranceCard[];
};

type HeritageItem = {
  title?: string;
  body?: string;
  iconUrl?: string;
};

type HeritageContent = {
  desktopImage?: string;
  mobileImage?: string;
  imageAlt?: string;
  items?: HeritageItem[];
};

type KnowledgeArticle = {
  title?: string;
  excerpt?: string;
  imageUrl?: string;
  imageAlt?: string;
  href?: string;
};

type KnowledgeContent = {
  heading?: string;
  articles?: KnowledgeArticle[];
};

const defaultBrandCommitment: BrandCommitmentContent = {
  headingLines: ["品牌堅持 ─ 天然 ∙ 安心 ∙ 科學", "嚴選14種珍貴漢方，保養有感"],
  bodyLines: ["無須反覆熬煮，常溫即撕即飲，科學且能真正落實於日常的保養", "✓天然純漢方 ✓0農藥 0重金屬 0西藥 ✓100%台灣品牌研發生產"],
};

const defaultFeatureMedia: FeatureMediaContent = {
  poster: getManagedLegacyOfficialUrl("/official/home/feature-video-poster.jpg"),
  videoDesktop: getManagedLegacyOfficialUrl("/official/home/feature-video-desktop.mp4"),
  videoMobile: getManagedLegacyOfficialUrl("/official/home/feature-video-mobile.mp4"),
  alt: "漢本三代品牌形象影片",
};

const defaultBenefits: BenefitItem[] = [
  { title: "釋放「沉」的負擔", iconUrl: getManagedLegacyOfficialUrl("/official/home/benefit-icon-1.png") },
  { title: "享受「鬆」的舒展", iconUrl: getManagedLegacyOfficialUrl("/official/home/benefit-icon-2.png") },
  { title: "鞏固「穩」的自信", iconUrl: getManagedLegacyOfficialUrl("/official/home/benefit-icon-3.png") },
  { title: "體驗「順」的自由", iconUrl: getManagedLegacyOfficialUrl("/official/home/benefit-icon-4.png") },
  { title: "撐起穩健體態", iconUrl: getManagedLegacyOfficialUrl("/official/home/benefit-icon-5.png") },
  { title: "動靜自如不再受限", iconUrl: getManagedLegacyOfficialUrl("/official/home/benefit-icon-6.png") },
  { title: "告別僵硬緊繃", iconUrl: getManagedLegacyOfficialUrl("/official/home/benefit-icon-7.png") },
  { title: "無須繁瑣熬煮", iconUrl: getManagedLegacyOfficialUrl("/official/home/benefit-icon-8.png") },
  { title: "無須忍受行動卡頓", iconUrl: getManagedLegacyOfficialUrl("/official/home/benefit-icon-9.png") },
];

const defaultAssurance: AssuranceContent = {
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
      imageUrl: getManagedLegacyOfficialUrl("/official/home/assurance-card-1.png"),
      imageAlt: "專業團隊推薦",
      accentClassName: "bg-white",
    },
    {
      title: "科學檢驗・安全有憑有據",
      body: "0農藥、0西藥、0重金屬，低磷、鉀、普林",
      imageUrl: getManagedLegacyOfficialUrl("/official/home/assurance-card-2.png"),
      imageAlt: "檢驗報告與安心驗證",
      accentClassName: "bg-[#e7c95c]",
    },
  ],
};

const defaultHeritage: HeritageContent = {
  desktopImage: getManagedLegacyOfficialUrl("/official/home/heritage-desktop.jpg"),
  mobileImage: getManagedLegacyOfficialUrl("/official/home/heritage-mobile.jpg"),
  imageAlt: "漢本三代傳承與製程",
  items: [
    {
      title: "三代傳承・配方與時俱進",
      body: "100%台灣製造 HACCP 與 ISO22000 雙認證食品廠生產",
      iconUrl: getManagedLegacyOfficialUrl("/official/home/heritage-icon-1.png"),
    },
    {
      title: "匠心級原料標準",
      body: "嚴選14種草本漢方 給自家人高規安心的用料",
      iconUrl: getManagedLegacyOfficialUrl("/official/home/heritage-icon-2.png"),
    },
    {
      title: "科學萃取．滴滴精華",
      body: "有效成分穩定 隨時補充，液態吸收優勢",
      iconUrl: getManagedLegacyOfficialUrl("/official/home/heritage-icon-3.png"),
    },
  ],
};

const defaultKnowledge: KnowledgeContent = {
  heading: "養護知識",
  articles: [
    {
      title: "關節炎會好嗎？告別痛到睡不著，4大關節炎的自我檢測與保養筆記！",
      excerpt: "躺著也痛、坐著也痛，痛到睡不著；即便睡著了，半夜也常被關節那股鑽心的僵硬或抽痛給驚醒。",
      imageUrl: getManagedLegacyOfficialUrl("/official/home/knowledge-article-1.png"),
      imageAlt: "關節炎自我檢測與保養",
      href: "/blogs/knowledge/arthritis-self-check-care",
    },
    {
      title: "長骨刺是什麼感覺? 9成骨刺靠這二招，不再擔心骨刺會不會好",
      excerpt: "腰痠背痛是長骨刺嗎? 多數的人感覺到背部或關節痛痛麻麻的，去醫院檢查後醫師告訴你：長骨刺了！",
      imageUrl: getManagedLegacyOfficialUrl("/official/home/knowledge-article-2.jpg"),
      imageAlt: "骨刺症狀與保養方式",
      href: "/blogs/knowledge/bone-spur-symptoms-treatment",
    },
  ],
};

const defaultHomepageProductOrder = [
  "漢本三代-舒活飲-5包口感體驗組",
  "漢本三代-舒活飲",
  "漢本三代-舒活飲-15包-盒-2盒",
  "漢本三代-舒活飲-15包-盒-3盒",
  "漢本三代-舒活飲-15包-盒-4盒",
];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asStringArray(value: unknown, fallback: string[] = []) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : fallback;
}

function asObjectArray<T>(value: unknown, fallback: T[] = []) {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function formatCurrency(value: number | null) {
  if (value == null) {
    return "即將上架";
  }

  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function sortFeaturedProducts(products: ProductCard[], preferredOrder: string[]) {
  const order = preferredOrder.length > 0 ? preferredOrder : defaultHomepageProductOrder;
  const rankMap = new Map(order.map((slug, index) => [slug, index]));

  return [...products].sort((left, right) => {
    const leftRank = rankMap.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = rankMap.get(right.slug) ?? Number.MAX_SAFE_INTEGER;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return left.title.localeCompare(right.title, "zh-Hant");
  });
}

function normalizeHeroMedia(slides: HeroSlide[], content: Record<string, unknown>): HeroMedia[] {
  const configuredSlides = Array.isArray(content.slides)
    ? (content.slides as HeroMedia[]).filter((item) => item && typeof item.poster === "string")
    : [];

  if (configuredSlides.length > 0) {
    return configuredSlides;
  }

  return slides.map((slide): HeroMedia => ({
    poster: slide.imageDesktop,
    imageDesktop: slide.imageDesktop,
    imageMobile: slide.imageMobile ?? slide.imageDesktop,
    alt: slide.title ?? "漢本三代首頁主視覺",
  }));
}

function HeroSection({ slides, content }: { slides: HeroSlide[]; content: Record<string, unknown> }) {
  const heroSlides = normalizeHeroMedia(slides, content);
  const autoplayMs = typeof content.autoplayMs === "number" ? content.autoplayMs : 7000;
  const configuredInitialIndex = typeof content.initialIndex === "number" ? content.initialIndex : 0;
  const [activeIndex, setActiveIndex] = useState(() => {
    if (heroSlides.length === 0) {
      return 0;
    }

    return Math.min(Math.max(configuredInitialIndex, 0), heroSlides.length - 1);
  });

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length);
    }, autoplayMs);

    return () => window.clearInterval(timer);
  }, [autoplayMs, heroSlides.length]);

  const current = heroSlides[activeIndex] ?? heroSlides[0] ?? null;

  if (!current) {
    return null;
  }

  const goToPrevious = () => setActiveIndex((currentIndex) => (currentIndex - 1 + heroSlides.length) % heroSlides.length);
  const goToNext = () => setActiveIndex((currentIndex) => (currentIndex + 1) % heroSlides.length);

  return (
    <section className="bg-white">
      <div className="relative overflow-hidden bg-white">
        <div className="relative min-h-[25rem] w-full md:min-h-[34rem] lg:min-h-[45rem]">
          {current.videoDesktop || current.videoMobile ? (
            <>
              <div className="absolute inset-0 bg-black/15" />
              <video key={`${activeIndex}-desktop`} autoPlay loop muted playsInline poster={current.poster} className="absolute inset-0 hidden h-full w-full object-cover md:block">
                {current.videoDesktop ? <source src={current.videoDesktop} type="video/mp4" /> : null}
              </video>
              <video key={`${activeIndex}-mobile`} autoPlay loop muted playsInline poster={current.poster} className="absolute inset-0 h-full w-full object-cover md:hidden">
                {current.videoMobile ? <source src={current.videoMobile} type="video/mp4" /> : current.videoDesktop ? <source src={current.videoDesktop} type="video/mp4" /> : null}
              </video>
            </>
          ) : (
            <picture className="absolute inset-0 block h-full w-full">
              {current.imageMobile ? <source media="(max-width: 767px)" srcSet={current.imageMobile} /> : null}
              <img src={current.imageDesktop ?? current.poster} alt={current.alt ?? "漢本三代首頁主視覺"} className="h-full w-full object-cover" />
            </picture>
          )}

          {heroSlides.length > 1 ? (
            <>
              <button type="button" onClick={goToPrevious} className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-white transition hover:text-[#f8e0a2] md:left-5" aria-label="上一張投影片">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={goToNext} className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-white transition hover:text-[#f8e0a2] md:right-5" aria-label="下一張投影片">
                <ArrowRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center">
          <ol className="flex items-center gap-2 rounded-full bg-black/22 px-3 py-1.5 text-white/80 backdrop-blur-sm">
            {heroSlides.map((_, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`第 ${index + 1} 張投影片，共 ${heroSlides.length} 張`}
                  className={index === activeIndex ? "min-w-6 text-sm font-semibold text-white" : "min-w-6 text-sm text-white/65 transition hover:text-white"}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function StorySection({ content }: { content: StoryContent }) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="bg-[#a62525] text-white">
      <div className="storefront-page py-10 lg:py-12">
        <div className="mx-auto max-w-[1210px]">
          <div className="storefront-prose max-w-none text-left text-[1rem] leading-[2.05] text-white lg:text-[1.02rem] [&_p]:text-white [&_strong]:text-white" dangerouslySetInnerHTML={{ __html: content.body || "<p>內容待補。</p>" }} />
          {showVideo && content.videoUrl ? (
            <div className="mt-8 overflow-hidden bg-black/20">
              <video controls autoPlay loop muted playsInline poster={content.videoPoster} className="aspect-[1.775/1] w-full object-cover">
                <source src={content.videoUrl} type="video/mp4" />
              </video>
            </div>
          ) : content.videoPoster ? (
            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  if (content.videoUrl) {
                    setShowVideo(true);
                  }
                }}
                className="group relative block w-full overflow-hidden"
                aria-label="載入影片：播放影片"
              >
                <img src={content.videoPoster} alt="漢本品牌影片" className="aspect-[1.775/1] w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/14 transition group-hover:bg-black/22">
                  <div className="flex flex-col items-center gap-3 text-white">
                    <div className="flex h-[4.4rem] w-[4.4rem] items-center justify-center rounded-full bg-white/92 text-[#161616] shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition group-hover:scale-105">
                      <Play className="ml-1 h-7 w-7" />
                    </div>
                    <span className="text-sm font-medium tracking-[0.06em]">播放影片</span>
                  </div>
                </div>
              </button>
              {content.videoUrl ? <div className="sr-only">載入影片：播放影片</div> : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StatsSection({ stats }: { stats: StatItem[] }) {
  return (
    <section className="bg-white">
      <div className="storefront-page py-7 lg:py-12">
        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {stats.map((item, index) => (
            <article key={`${item.title}-${index}`} className="flex flex-col items-center text-center">
              {item.iconUrl ? <img src={item.iconUrl} alt="" className="h-[84px] w-[84px] object-contain" /> : null}
              <h3 className="mt-4 text-[1.05rem] font-semibold text-[#37312c]">{item.title}</h3>
              <div className="mt-1 flex flex-wrap items-baseline justify-center gap-1 text-center">
                <p className="text-[1.1rem] font-semibold text-[#1d1712]">{item.value}</p>
                <p className="text-[0.96rem] text-[#615851]">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCardView({ product }: { product: ProductCard }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [isPending, setIsPending] = useState(false);
  const isSoldOut = !product.variantId || product.inventory <= 0;

  async function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!product.variantId || isPending || isSoldOut) {
      return;
    }

    setIsPending(true);

    try {
      await addItem(product.variantId, 1);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <article className="group relative">
      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.title} />
      <div className="absolute right-3 top-3 z-20 rounded-full bg-[#111] px-2.5 py-1 text-[0.7rem] font-medium tracking-[0.08em] text-white">特賣</div>
      <div className="overflow-hidden bg-white">
        {product.imageUrl ? (
          <div className="flex aspect-square w-full items-center justify-center bg-white p-3 sm:p-5">
            <img src={product.imageUrl} alt={product.imageAlt ?? product.title} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]" />
          </div>
        ) : (
          <div className="flex aspect-square items-center justify-center px-6 text-center text-sm tracking-[0.12em] text-[#7a1414]">商品圖片待補</div>
        )}
      </div>
      <div className="space-y-2 px-1 pb-1 pt-2 text-left">
        <h3 className="text-[0.94rem] leading-[1.75] text-[#201b17] sm:text-[0.98rem]">{product.title}</h3>
        <div className="space-y-1 text-[0.82rem] text-[#4b4138] sm:text-[0.88rem]">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-stone-500">促銷價</span>
            <p className="font-semibold text-[#1d1712]">{formatCurrency(product.price)}</p>
          </div>
          {product.compareAtPrice ? (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-stone-400">
              <span>定價</span>
              <p className="line-through">{formatCurrency(product.compareAtPrice)}</p>
            </div>
          ) : null}
        </div>
        <div className="relative z-20 pt-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isPending || isSoldOut}
            className="storefront-button w-full px-4 py-3 text-[0.8rem] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSoldOut ? "已售完" : isPending ? "加入中…" : "加入購物車"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductShowcaseSection({ title, products }: { title?: string | null; products: ProductCard[] }) {
  return (
    <section className="bg-white">
      <div className="storefront-page py-12 lg:py-14">
        <div className="text-center">
          <h2 className="text-[1.6rem] font-medium tracking-[0.02em] text-[#231d19] lg:text-[1.85rem]">{title ?? "漢本三代舒活飲系列"}</h2>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-2 lg:gap-y-10">
          {products.length > 0 ? (
            products.map((product) => <ProductCardView key={product.id} product={product} />)
          ) : (
            <div className="border border-dashed border-[#d9bf84] bg-[#fffaf0] p-10 text-sm leading-7 text-stone-600 md:col-span-2 xl:col-span-3">
              目前資料庫尚未建立上架商品，因此這個區塊會在商品資料補齊後自動顯示。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BrandCommitmentSection({ content }: { content: BrandCommitmentContent }) {
  const headingLines = content.headingLines && content.headingLines.length > 0 ? content.headingLines : defaultBrandCommitment.headingLines ?? [];
  const bodyLines = content.bodyLines && content.bodyLines.length > 0 ? content.bodyLines : defaultBrandCommitment.bodyLines ?? [];

  return (
    <section className="bg-white text-[#231d19]">
      <div className="storefront-page py-14 text-left lg:py-16">
        <div className="max-w-[980px] space-y-3">
          <div className="space-y-0.5">
            {headingLines.map((line, index) => (
              <h2 key={`${line}-${index}`} className="text-[1.4rem] font-semibold leading-[1.4] lg:text-[1.55rem]">
                {line}
              </h2>
            ))}
          </div>
          <div className="space-y-2 text-[1rem] leading-[1.8] text-[#4f463f] lg:text-[1rem]">
            {bodyLines.map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureMediaSection({ content }: { content: FeatureMediaContent }) {
  const media = { ...defaultFeatureMedia, ...content };

  return (
    <section className="bg-white">
      <div className="w-full overflow-hidden bg-black">
        {media.videoDesktop || media.videoMobile ? (
          <>
            <video autoPlay loop muted playsInline poster={media.poster} className="hidden aspect-[16/6.4] w-full object-cover md:block">
              {media.videoDesktop ? <source src={media.videoDesktop} type="video/mp4" /> : null}
            </video>
            <video autoPlay loop muted playsInline poster={media.poster} className="aspect-[16/10] w-full object-cover md:hidden">
              {media.videoMobile ? <source src={media.videoMobile} type="video/mp4" /> : media.videoDesktop ? <source src={media.videoDesktop} type="video/mp4" /> : null}
            </video>
          </>
        ) : (
          <picture>
            {media.imageMobile ? <source media="(max-width: 767px)" srcSet={media.imageMobile} /> : null}
            <img src={media.imageDesktop ?? media.poster} alt={media.alt ?? "漢本三代品牌影片"} className="aspect-[16/6.4] w-full object-cover" />
          </picture>
        )}
      </div>
    </section>
  );
}

function BenefitsSection({ items }: { items: BenefitItem[] }) {
  return (
    <section className="bg-white">
      <div className="storefront-page py-16 lg:py-18">
        <div className="grid gap-x-6 gap-y-5 md:grid-cols-3 lg:gap-y-7">
          {items.map((item, index) => (
            <article key={`${item.title}-${index}`} className="flex min-h-[240px] flex-col items-center justify-start px-4 py-3 text-center">
              {item.iconUrl ? <img src={item.iconUrl} alt="" className="h-[180px] w-[180px] rounded-full object-cover" /> : null}
              <h3 className="mt-5 text-[1rem] font-medium tracking-[0.01em] text-[#2d2621]">{item.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AssuranceSection({ content }: { content: AssuranceContent }) {
  const cards = content.cards && content.cards.length > 0 ? content.cards : defaultAssurance.cards ?? [];

  return (
    <section className="bg-[#eef0f0]">
      <div className="storefront-page py-6 lg:py-6">
        <div className="grid gap-3 lg:grid-cols-[1.02fr_0.98fr_0.98fr]">
          <article className="space-y-5 px-4 py-7 lg:px-6 lg:py-8">
            <h2 className="text-[1.9rem] font-semibold leading-[1.38] text-[#a1281e]">{content.heading || defaultAssurance.heading}</h2>
            <div className="space-y-3 text-[0.98rem] leading-8 text-[#5b544d]">
              {(content.bodyLines && content.bodyLines.length > 0 ? content.bodyLines : defaultAssurance.bodyLines ?? []).map((line, index) => (
                <p key={`${line}-${index}`}>{line}</p>
              ))}
            </div>
            <p className="text-[0.98rem] leading-8 text-[#4a433d]">{content.note || defaultAssurance.note}</p>
          </article>

          {cards.map((card, index) => (
            <article key={`${card.title}-${index}`} className="overflow-hidden rounded-[8px] bg-white">
              {card.imageUrl ? <img src={card.imageUrl} alt={card.imageAlt ?? card.title ?? ""} className="aspect-square w-full object-cover" /> : null}
              <div className={`px-6 py-5 text-center ${card.accentClassName ?? "bg-white"}`}>
                <h3 className="text-[1.2rem] font-semibold text-[#231d19]">{card.title}</h3>
                <p className="mt-2 text-[0.96rem] leading-7 text-[#4a413b]">{card.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeritageSection({ content }: { content: HeritageContent }) {
  const items = content.items && content.items.length > 0 ? content.items : defaultHeritage.items ?? [];

  return (
    <section className="bg-[#992928]">
      <div className="storefront-page py-0 lg:py-0">
        <div className="grid min-h-[477px] items-stretch gap-0 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
          <div>
            <picture>
              {content.mobileImage || defaultHeritage.mobileImage ? <source media="(max-width: 767px)" srcSet={content.mobileImage || defaultHeritage.mobileImage} /> : null}
              <img src={content.desktopImage || defaultHeritage.desktopImage} alt={content.imageAlt || defaultHeritage.imageAlt || "漢本三代傳承與製程"} className="h-full w-full object-cover" />
            </picture>
          </div>

          <div className="flex flex-col justify-between bg-[#992928] px-10 py-10 text-white lg:px-14">
            {items.map((item, index) => (
              <article key={`${item.title}-${index}`} className="flex items-center gap-5 py-3 first:pt-0 last:pb-0">
                {item.iconUrl ? <img src={item.iconUrl} alt="" className="h-[84px] w-[84px] shrink-0 object-contain" /> : null}
                <div>
                  <h3 className="text-[1.25rem] font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-[1rem] leading-8 text-white/92">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function KnowledgeSection({ content }: { content: KnowledgeContent }) {
  const articles = content.articles && content.articles.length > 0 ? content.articles : defaultKnowledge.articles ?? [];

  return (
    <section className="bg-white">
      <div className="storefront-page py-14 lg:py-14">
        <div className="grid items-start gap-8 lg:grid-cols-[0.46fr_1fr_1fr]">
          <div className="pt-3">
            <h2 className="text-[1.9rem] font-semibold text-[#231d19]">{content.heading || defaultKnowledge.heading}</h2>
          </div>

          {articles.map((article, index) => {
            const href = article.href || "#";
            const external = isExternalHref(href);

            return (
              <article key={`${article.title}-${index}`} className="space-y-4">
                {article.imageUrl ? <img src={article.imageUrl} alt={article.imageAlt ?? article.title ?? ""} className="aspect-[1.5/1] w-full rounded-[8px] object-cover" /> : null}
                <div className="space-y-3">
                  <h3 className="text-[1.1rem] font-semibold leading-8 text-[#231d19]">{article.title}</h3>
                  <p className="text-[0.95rem] leading-7 text-[#544a44]">{article.excerpt}</p>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="inline-flex h-10 items-center justify-center border border-[#231d19] px-5 text-sm text-[#231d19] transition hover:bg-[#231d19] hover:text-white"
                  >
                    閱讀更多
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function getSectionContent(sections: HomepageSection[], type: string) {
  return asRecord(sections.find((section) => section.sectionType === type)?.content);
}

export function Homepage({ slides, sections, featuredProducts }: { slides: HeroSlide[]; sections: HomepageSection[]; featuredProducts: ProductCard[] }) {
  const heroContent = getSectionContent(sections, "hero_slider");
  const storyContent = getSectionContent(sections, "brand_story") as StoryContent;
  const statsContent = getSectionContent(sections, "stats_section");
  const productContent = getSectionContent(sections, "product_showcase");
  const brandCommitmentContent = getSectionContent(sections, "brand_commitment") as BrandCommitmentContent;
  const featureMediaContent = getSectionContent(sections, "feature_media") as FeatureMediaContent;
  const benefitsContent = getSectionContent(sections, "benefits_grid");
  const assuranceContent = getSectionContent(sections, "assurance_section") as AssuranceContent;
  const heritageContent = getSectionContent(sections, "heritage_section") as HeritageContent;
  const knowledgeContent = getSectionContent(sections, "knowledge_section") as KnowledgeContent;
  const stats = asObjectArray<StatItem>(statsContent.stats, []);
  const benefitItems = asObjectArray<BenefitItem>(benefitsContent.items, defaultBenefits);
  const rawFeaturedLimit = Number(productContent.limit ?? featuredProducts.length);
  const featuredLimit = Number.isFinite(rawFeaturedLimit) && rawFeaturedLimit > 0 ? rawFeaturedLimit : featuredProducts.length;
  const configuredProductOrder = asStringArray(productContent.productSlugs);
  const orderedFeaturedProducts = sortFeaturedProducts(featuredProducts, configuredProductOrder);
  const homepageFeaturedProducts = orderedFeaturedProducts.slice(0, Math.min(orderedFeaturedProducts.length, Math.max(featuredLimit, 5)));

  return (
    <>
      <HeroSection slides={slides} content={heroContent} />
      <StorySection content={storyContent} />
      <StatsSection stats={stats} />
      <ProductShowcaseSection title={(productContent.heading as string) || "漢本三代舒活飲系列"} products={homepageFeaturedProducts} />
      <BrandCommitmentSection content={{ headingLines: asStringArray(brandCommitmentContent.headingLines, defaultBrandCommitment.headingLines), bodyLines: asStringArray(brandCommitmentContent.bodyLines, defaultBrandCommitment.bodyLines) }} />
      <FeatureMediaSection content={featureMediaContent} />
      <BenefitsSection items={benefitItems} />
      <AssuranceSection content={{
        heading: (assuranceContent.heading as string) || defaultAssurance.heading,
        bodyLines: asStringArray(assuranceContent.bodyLines, defaultAssurance.bodyLines),
        note: (assuranceContent.note as string) || defaultAssurance.note,
        cards: asObjectArray<AssuranceCard>(assuranceContent.cards, defaultAssurance.cards),
      }} />
      <HeritageSection content={{
        desktopImage: (heritageContent.desktopImage as string) || defaultHeritage.desktopImage,
        mobileImage: (heritageContent.mobileImage as string) || defaultHeritage.mobileImage,
        imageAlt: (heritageContent.imageAlt as string) || defaultHeritage.imageAlt,
        items: asObjectArray<HeritageItem>(heritageContent.items, defaultHeritage.items),
      }} />
      <KnowledgeSection content={{
        heading: (knowledgeContent.heading as string) || defaultKnowledge.heading,
        articles: asObjectArray<KnowledgeArticle>(knowledgeContent.articles, defaultKnowledge.articles),
      }} />
    </>
  );
}
