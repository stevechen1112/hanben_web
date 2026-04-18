import { parseAboutPageContent } from "@/lib/about-page-content";
import { getManagedLegacyOfficialUrl } from "@/lib/legacy-official-media";

const brandSpiritLines = [
  "與時俱進的古老漢方智慧，為解決每一代都在傳承的痛點─下背的沉重，三代都在背負",
  "漢本三代希望透過更可行的方式，持續的支撐著每一代都能「挺直」、「昂首」、「闊步」",
  "自在的行動，動靜自如的生活，漢方即時補給，補氣強本，動靜自如。",
];

const brandCommitmentLines = [
  "傳承三代，堅持「天然草本」的本心，不給身體額外負擔，",
  "只給您最精準、最便利的漢方滋補。",
];

const storySections = [
  {
    heading: "從內經與古法中淬鍊出的第一代",
    subheading: "汗水下的韌性",
    imageUrl: getManagedLegacyOfficialUrl("/official/about/about-generation-1.jpg"),
    imageAlt: "第一代漢方傳承",
    paragraphs: [
      "在那個還在中藥行抓藥的年代，生活是靠勞力撐起來的——第一代創辦人看著街坊鄰里為了生計四處奔波，長期的負重與苦力，讓大家的背影漸漸沉重。那時的智慧，是深入研究古法、漢方草本，細心抓配每一帖漢方，為那些被生活壓彎的腰，注入一股溫熱的支撐力！",
      "祖父，是對漢方草本有著過人直覺的隱藏專家。在勞動力密集的年代，不只自己，連家人因為長年負重、脊椎疲態而日漸消沉，本來對草本就有深厚理解的他，投入鑽研黃帝內經中關於氣血運行與筋骨強健的邏輯。",
      "祖父對古法醫學有獨鍾，數年研究古方草本記述，在草木性味中尋找答案。其中，他特別執著於洗髓、易筋的筋骨養護智慧——不只是止痛，更要讓失去彈性的身體重新找回支撐感。",
      "他的執著找到了讓自己跟家人在繁重日常中，能維持行動自如的漢方配方，後來私藏照護配方傳遍鄰里，祖父也成為了大家眼中的漢方達人。",
    ],
  },
  {
    heading: "五千名顧客用身體見證的第二代",
    subheading: "久坐間的積累",
    imageUrl: getManagedLegacyOfficialUrl("/official/about/about-generation-2.jpg"),
    imageAlt: "第二代漢方傳承",
    paragraphs: [
      "時代在變，汗水變成了久坐的疲憊——在辦公室，勞動轉為長時間的伏案工作，看著人們因久坐而生的凝滯與沉重，漢本二代開始鑽研熬製技術，將古法化為更深層的調理。",
      "父親，承接這份配方走進藥房。他對配方改良有著近乎苛求的執著。堅持親自燉煮、細火慢熬，將爺爺的智慧轉化為一包包充滿溫度的漢方藥包。",
      "在沒有網路行銷，只有口耳相傳的世代。十年來，超過五千名顧客用體感見證。顧客多半是為家庭操勞一輩子的人，他們信任父親，不只是因為喝了有感，更是因為這份配方背後，是一個看得見的家族信譽。",
    ],
  },
];

const thirdGenerationParagraphs = [
  "到了現在，螢幕成為了生活的中心，人人成了低頭族——緊繃，不再是局部的問題，而是現代人的常態，身為第三代，深知傳統與便利必須並行，運用科學配方與高倍濃縮技術，讓漢方智慧化為隨撕隨飲的精華。不變的，是漢方的智慧，無論是苦力、久坐或低頭的世代，時代的困擾在變，但漢本三代守護的心未曾改變。",
  "身為第三代的我。在中、西融合的教育背景，歷經為傳統產業創新與新創產業，再次深切感受到這個跨越時代的身體難題，沒有因為科技更便利而被解決，反而成為日常。",
  "「如何讓這份傳承三代守護更符合現代人的標準與生活型態」",
  "我決定帶領這份家傳守護走出地方，走進實驗室。兩年前開始進行配方調整，更科學的比重、認證、檢驗。漢方科學──承襲祖父、父親推崇的古方智慧，以現代科學進行定性、定量分析。",
  "確認每一味草本的來源、品質、安全性，通過 400 多項無農藥、無西藥、無重金屬的高標檢驗。利用高溫濃縮萃取技術，將原本需熬煮數小時的精華，濃縮萃取成一包隨手撕開、3 秒即飲的舒活飲。",
  "這個過程並不容易，就像當初爺爺在摸索配方、父親對燉煮時的執著從未妥協。每一代人都在為生活、為事業負重前行，卻往往忘了好好照顧自己。我們用三代的時間，去驗證一個人生能動靜自如的承諾──我們深信：「腰直了，氣順了，生活就有品質。」這個理想歷經了三代，現在，我們想把這份安心，交到你與你的家人手中。",
];

function asStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : fallback;
}

export function AboutPage({ title, content }: { title: string; content?: Record<string, unknown> }) {
  const aboutContent = parseAboutPageContent(content);
  const configuredStorySections = aboutContent.storySections ?? [];
  const mergedStorySections = storySections.map((section, index) => ({
    ...section,
    ...(configuredStorySections[index] ?? {}),
    paragraphs: asStringArray(configuredStorySections[index]?.paragraphs, section.paragraphs),
  }));
  const backgroundImageUrl = aboutContent.backgroundImageUrl ?? getManagedLegacyOfficialUrl("/official/about/about-brand-spirit-bg.jpg");
  const backgroundImageAlt = aboutContent.backgroundImageAlt ?? "";
  const brandSpiritHeading = aboutContent.brandSpiritHeading ?? "品牌精神";
  const brandSpiritHighlight = aboutContent.brandSpiritHighlight ?? "腰直了，氣順了，生活就有品質了";
  const brandCoreImageUrl = aboutContent.brandCoreImageUrl ?? getManagedLegacyOfficialUrl("/official/about/about-brand-core.jpg");
  const brandCoreImageAlt = aboutContent.brandCoreImageAlt ?? "品牌精神";
  const brandCommitmentHeading = aboutContent.brandCommitmentHeading ?? "品牌堅持";
  const brandCommitmentHighlight = aboutContent.brandCommitmentHighlight ?? "漢本三代，為體貼每一代負重前行的你而存在";
  const storyDividerDesktopUrl = aboutContent.storyDividerDesktopUrl ?? getManagedLegacyOfficialUrl("/official/about/about-story-divider-desktop.png");
  const storyDividerMobileUrl = aboutContent.storyDividerMobileUrl ?? getManagedLegacyOfficialUrl("/official/about/about-story-divider-mobile.png");
  const storyDividerAlt = aboutContent.storyDividerAlt ?? "品牌故事分隔圖";
  const storyHeading = aboutContent.storyHeading ?? "品牌故事";
  const storySubheading = aboutContent.storySubheading ?? "傳承三代的智慧 跨越世代的守護";
  const storyIntro = aboutContent.storyIntro ?? "有些事情的開始，並非為了創業，而是為了守護；有些事情的傳承，不僅是事業，更是為了解決跨越時代的身體難題。";
  const thirdGenerationHeading = aboutContent.thirdGenerationHeading ?? "從古法智慧進化到現代科學檢驗的漢方三代";
  const thirdGenerationSubheading = aboutContent.thirdGenerationSubheading ?? "低頭時的靈活";
  const thirdGenerationImageUrl = aboutContent.thirdGenerationImageUrl ?? getManagedLegacyOfficialUrl("/official/about/about-generation-3.png");
  const thirdGenerationImageAlt = aboutContent.thirdGenerationImageAlt ?? "第三代漢方傳承";

  return (
    <div className="bg-white pb-20 pt-20 sm:pt-24">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-0">
        <h1 className="text-center text-[2.45rem] font-semibold tracking-[-0.04em] text-[#232323] sm:text-[2.95rem]">{title}</h1>

        <section className="relative mt-12 overflow-hidden bg-[#fcfaf5] px-8 py-10 sm:px-12 sm:py-14">
          <div className="absolute inset-0 opacity-[0.12]">
            <img src={backgroundImageUrl} alt={backgroundImageAlt} className="h-full w-full object-cover" />
          </div>
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_300px] lg:gap-16">
            <div>
              <h2 className="text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2117]">{brandSpiritHeading}</h2>
              <div className="mt-8 space-y-5 text-[1.08rem] leading-[2.05] text-[#615346]">
                {asStringArray(aboutContent.brandSpiritLines, brandSpiritLines).map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p className="font-semibold text-[#47362b]">{brandSpiritHighlight}</p>
              </div>
            </div>
            <img src={brandCoreImageUrl} alt={brandCoreImageAlt} className="mx-auto w-full max-w-[300px] object-cover shadow-[0_12px_30px_rgba(70,43,18,0.14)]" />
          </div>
        </section>

        <section className="bg-[#c59a4f] px-8 py-14 text-center text-white sm:px-12 sm:py-16">
          <h2 className="text-[2rem] font-semibold tracking-[-0.03em]">{brandCommitmentHeading}</h2>
          <div className="mx-auto mt-8 max-w-[760px] space-y-5 text-[1.08rem] leading-[2.05]">
            {asStringArray(aboutContent.brandCommitmentLines, brandCommitmentLines).map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="font-semibold">{brandCommitmentHighlight}</p>
          </div>
        </section>

        <section className="py-14 text-center sm:py-16">
          <div className="mx-auto max-w-[860px]">
            <img src={storyDividerDesktopUrl} alt={storyDividerAlt} className="mx-auto hidden w-full max-w-[833px] md:block" />
            <img src={storyDividerMobileUrl} alt={storyDividerAlt} className="mx-auto w-full max-w-[470px] md:hidden" />
            <h2 className="mt-7 text-[1.95rem] font-semibold tracking-[-0.03em] text-[#2c2218]">{storyHeading}</h2>
            <p className="mt-3 text-[1.25rem] font-semibold tracking-[0.02em] text-[#4a392b]">{storySubheading}</p>
            <p className="mx-auto mt-6 max-w-[760px] text-[1.04rem] leading-[2] text-[#615346]">
              {storyIntro}
            </p>
          </div>
        </section>

        <div className="space-y-8">
          {mergedStorySections.map((section) => (
            <section key={section.heading} className="relative overflow-hidden bg-[#fcfaf5] px-8 py-10 sm:px-12 sm:py-12">
              <div className="absolute inset-0 opacity-[0.13]">
                <img src={backgroundImageUrl} alt={backgroundImageAlt} className="h-full w-full object-cover" />
              </div>
              <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_630px] lg:items-center">
                <div>
                  <h3 className="text-[1.62rem] font-semibold tracking-[-0.03em] text-[#2b2117]">{section.heading}</h3>
                  <p className="mt-3 text-[1.18rem] font-semibold text-[#8b2c24]">{section.subheading}</p>
                  <div className="mt-6 space-y-4 text-[1rem] leading-[1.95] text-[#5b5047]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
                <img src={section.imageUrl} alt={section.imageAlt} className="w-full object-cover shadow-[0_14px_34px_rgba(70,43,18,0.12)]" />
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 bg-[#fcfaf5] px-8 py-10 sm:px-12 sm:py-14">
          <div className="mx-auto max-w-[900px] text-center">
            <h3 className="text-[1.62rem] font-semibold tracking-[-0.03em] text-[#2b2117]">{thirdGenerationHeading}</h3>
            <p className="mt-3 text-[1.18rem] font-semibold text-[#8b2c24]">{thirdGenerationSubheading}</p>
            <div className="mt-6 space-y-4 text-left text-[1rem] leading-[1.95] text-[#5b5047]">
              {asStringArray(aboutContent.thirdGenerationParagraphs, thirdGenerationParagraphs).map((paragraph) => (
                <p key={paragraph} className={paragraph.includes("如何讓這份傳承三代守護") ? "text-center text-[1.1rem] font-semibold text-[#3c2d21]" : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>
            <img src={thirdGenerationImageUrl} alt={thirdGenerationImageAlt} className="mx-auto mt-10 w-full max-w-[832px] object-contain" />
          </div>
        </section>
      </div>
    </div>
  );
}