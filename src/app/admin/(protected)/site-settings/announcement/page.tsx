import { db } from "@/lib/db";
import { AnnouncementManager } from "@/components/admin/announcement-manager";

export default async function AnnouncementPage() {
  const bars = await db.announcementBar.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const mapped = bars.map((b) => ({
    id: b.id,
    text: b.text,
    link: b.link,
    bgColor: b.bgColor,
    textColor: b.textColor,
    isActive: b.isActive,
    sortOrder: b.sortOrder,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">公告列管理</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          顯示在網站頂端的跑馬燈公告，可拖拉排序與切換啟用
        </p>
      </div>

      <AnnouncementManager initialBars={mapped} />
    </div>
  );
}
