import Link from "next/link";
import { Plus, Rss } from "lucide-react";
import { db } from "@/lib/db";

export default async function ChannelsPage() {
  const channels = await db.blogChannel.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">部落格頻道</h1>
          <p className="text-sm text-stone-500 mt-0.5">{channels.length} 個頻道</p>
        </div>
        <Link
          href="/admin/blog/channels/new"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增頻道
        </Link>
      </div>

      {channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white py-16 text-stone-400">
          <Rss className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm">尚未建立任何頻道</p>
        </div>
      ) : (
        <div className="space-y-2">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-5"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-700 truncate">{ch.title}</p>
                <p className="text-xs text-stone-400 font-mono mt-0.5">{ch.slug}</p>
                {ch.description && (
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">{ch.description}</p>
                )}
              </div>
              <div className="text-xs text-stone-400 shrink-0">
                {ch._count.articles} 篇文章
              </div>
              <Link
                href={`/admin/blog/channels/${ch.id}`}
                className="shrink-0 rounded-lg border border-stone-200 px-3 py-2 text-center text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                編輯
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
