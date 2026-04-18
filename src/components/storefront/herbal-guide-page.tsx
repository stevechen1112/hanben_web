import { getManagedLegacyOfficialUrl } from "@/lib/legacy-official-media";

type HerbalItem = {
  title?: string;
  subtitle?: string;
  imageUrl?: string | null;
  description?: string;
};

const herbalItems: HerbalItem[] = [
  {
    title: "台灣天仙果",
    subtitle: "打通行動根本",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-01-taiwan-fig.jpg"),
    description:
      "台灣天仙果（俗稱羊奶頭、牛奶埔），因其多原生於深山溪澗旁的濕潤峭壁，環境險惡導致採集難度極高，在自然界中產量有限。其生長週期緩慢，種植後須經 3 至 4 年的精心培育方可收成，其特殊香氣兼具保健作用，促進深層新陳代謝。台灣天仙果低產量與高時間成本的特性，使其成為漢方草本植物中的珍品。",
  },
  {
    title: "牛膝頭",
    subtitle: "基礎行動力",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-02-niuxitou.jpg"),
    description:
      "牛膝頭被譽為滋補強身的天然瑰寶，內涵豐富的牛溪多肽與牛膝皂甘等關鍵活性化合物，這些生物成分是維持身體靈活度的核心，由內而外提供穩固支撐，延續行動彈性，是維持靈活的最強後盾。",
  },
  {
    title: "細本山葡萄",
    subtitle: "來自深山的淬鍊",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-03-mountain-grape.jpg"),
    description:
      "細本山葡萄其生長極為緩慢，因此特別珍貴，植物的每一寸都凝聚了白藜蘆醇（Resveratrol）衍生物，能深層調節生理機能，來強化身體的基石，是延續行動力的頂級天然漢方植物。",
  },
  {
    title: "刺五加",
    subtitle: "打通行動根本",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-04-eleuthero.jpg"),
    description:
      "生長於高緯度寒冷地帶，是當地長久以來被重視的草本植物之一。在近代草本研究中，刺五加用於支持身體在壓力與高負荷狀態下，維持穩定與平衡。其所含的刺五加苷（Eleutherosides）與多酚類營養成分，被廣泛研究於日常活力維持與體能調節層面，特別適合長期處於高壓狀態的現代族群。",
  },
  {
    title: "白鶴靈芝",
    subtitle: "大自然的草本仙鶴",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-05-white-crane.jpg"),
    description:
      "白鶴靈芝草，因其花形如白鶴翩翩起舞，更有「仙鶴草」的美譽。它隱身於山坡叢林的幽靜濕潤處，是大自然賦予的草本精華。其養生價值足以媲美靈芝，對於生活步調緊湊、燥熱體質的人來說，是很好的降火應援。",
  },
  {
    title: "薑黃",
    subtitle: "打通行動根本",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-06-turmeric.jpg"),
    description:
      "薑黃為印度傳統草本智慧中備受重視的植物，它與一般生薑不同，其核心成分在於薑黃素。經現代科學實證，薑黃具備超強防護力，是滋補強身、調節生理機能的頂級食材，展現出溫和而穩定的特性，為身體建立強韌屏障。",
  },
  {
    title: "番紅花",
    subtitle: "紅色鑽石",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-07-saffron.jpg"),
    description:
      "番紅花又稱為藏紅花，僅能在特定氣候與嚴格栽培條件下生長，每一朵花只能孕育出三根纖細而珍貴的火紅柱頭，需要耗時耗力人工採收，造就了番紅花無可取代的尊榮價值。現代植萃研究發現番紅花含許多天然活性成分，能夠促進新陳代謝、幫助入睡。",
  },
  {
    title: "紅田烏",
    subtitle: "濕地孕育的食養之葉",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-08-hongtianwu.jpg"),
    description:
      "紅田烏，又稱紅花蜜菜，是一種對生長環境極為講究的植物，僅能在純淨濕潤的自然條件中茂盛生長。其生長條件嚴苛、產量有限，因此更顯珍貴。營養分析顯示，紅田烏富含多酚類與類黃酮等植化成分，能支持身體正常代謝機能。",
  },
  {
    title: "甘草",
    subtitle: "行動節奏的溫和支撐",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-09-licorice.jpg"),
    description:
      "在東方傳統草本中，長久以來扮演著不可或缺的角色，常被運用在複方之中，用其溫潤的特性，協調各種植萃成分，使舒活飲更加順和、更加耐飲。甘草中所含的天然成分，也適合長期日常補充。",
  },
  {
    title: "桂花",
    subtitle: "清香保養",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-10-osmanthus.jpg"),
    description:
      "唯有在良好土壤與適宜環境中，才能夠孕育出清雅細緻的芬芳。自古以來，桂花便是受珍視的花材之一，其所含的天然植化素成分，為整體配方增添層次，讓舒活飲的風味更加圓潤順口。",
  },
  {
    title: "雞屎藤",
    subtitle: "日曬是關鍵",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-11-paederia.jpg"),
    description:
      "雞屎藤，又稱雞矢藤，新鮮採收時帶有其特有氣味，經日曬乾燥後，氣味轉為溫和而富有草本香韻。其性質溫潤，富含單萜苷類、熊果素等天然植化因子，也因此被加入舒活飲，成為行動力的重要草本之一。",
  },
  {
    title: "橄欖",
    subtitle: "溫和基底",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-12-olive.jpg"),
    description:
      "橄欖是地中海文明的長青聖品，不僅是健康飲食的核心，更是深層平衡與守護的象徵。蘊含橄欖苦苷與多酚，這些天然植化素為身體構築一道穩定的防禦基底，且性質溫和、純淨不刺激。",
  },
  {
    title: "紅棗",
    subtitle: "溫潤調和",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-13-red-date.jpg"),
    description:
      "紅棗是流傳千年的滋補果實，其含有多種天然活性化合物，補氣生津、養顏美容，為身體導入源源不絕的元氣。舒活飲內添加了紅棗，增加自然甘潤風味，也讓每天的保養過程更溫潤和順。",
  },
  {
    title: "黃耆",
    subtitle: "補氣之長",
    imageUrl: getManagedLegacyOfficialUrl("/official/herbal-guide/herb-14-astragalus.jpg"),
    description:
      "在東方被視為重要的滋養型植物，其富含多種黃酮類、胺基酸等微量元素，具有益氣固表的作用，告別虛散狀態，重拾穩固的健康根基。黃耆更有助於調理生理機能，提供穩定、踏實的支持。",
  },
];

function isHerbalItem(value: unknown): value is HerbalItem {
  return Boolean(
    value
    && typeof value === "object"
    && typeof (value as HerbalItem).title === "string",
  );
}

export function HerbalGuidePage({ title, content }: { title: string; content?: Record<string, unknown> }) {
  const configuredItems = Array.isArray(content?.herbalItems)
    ? content.herbalItems.filter(isHerbalItem)
    : [];
  const items = configuredItems.length > 0
    ? herbalItems.map((fallbackItem, index) => ({ ...fallbackItem, ...(configuredItems[index] ?? {}) }))
    : herbalItems;

  return (
    <div className="bg-white pb-20 pt-20 sm:pt-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <h1 className="text-center text-[2.45rem] font-semibold tracking-[-0.04em] text-[#232323] sm:text-[2.95rem]">{title}</h1>

        <div className="mt-12 grid gap-x-10 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.title} className="mx-auto w-full max-w-[350px]">
              <div className="flex h-[350px] items-center justify-center bg-white">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-full w-full object-contain" /> : null}
              </div>
              <div className="mt-6 space-y-3 text-left">
                <h2 className="text-[1.9rem] font-semibold tracking-[-0.03em] text-[#b0312a]">{item.title}</h2>
                <p className="text-[1.2rem] font-medium text-[#41372f]">{item.subtitle}</p>
                <p className="text-[1rem] leading-[1.95] text-[#5b5047]">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}