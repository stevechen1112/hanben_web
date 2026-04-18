import { db } from "@/lib/db";
import { HomepageSectionEditor } from "@/components/admin/homepage-section-editor";
import { HeroSlidesEditor } from "@/components/admin/hero-slides-editor";

export default async function HomepagePage() {
  const [sections, slides] = await Promise.all([
    db.homepageSection.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    db.heroSlide.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const mappedSections = sections.map((s) => ({
    id: s.id,
    sectionType: s.sectionType,
    title: s.title,
    subtitle: s.subtitle,
    content: s.content as Record<string, unknown>,
    sortOrder: s.sortOrder,
    isActive: s.isActive,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">首頁區塊配置</h1>
        <p className="text-sm text-stone-500 mt-0.5">拖拉排序，展開可編輯 content JSON</p>
      </div>

      <HomepageSectionEditor initialSections={mappedSections} />

      <HeroSlidesEditor initialSlides={slides} />
    </div>
  );
}
