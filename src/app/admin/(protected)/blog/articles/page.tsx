import Link from "next/link";
import { db } from "@/lib/db";
import { Plus, FileText, Search } from "lucide-react";

interface SearchParams {
  q?: string;
  channel?: string;
  page?: string;
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = 20;
  const query = params.q?.trim() ?? "";
  const channelFilter = params.channel;

  const [channels, articles, total] = await Promise.all([
    db.blogChannel.findMany({ orderBy: { createdAt: "asc" } }),
    db.blogArticle.findMany({
      where: {
        ...(query && { title: { contains: query, mode: "insensitive" } }),
        ...(channelFilter && { channelId: channelFilter }),
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        author: true,
        publishedAt: true,
        updatedAt: true,
        channel: { select: { title: true } },
      },
    }),
    db.blogArticle.count({
      where: {
        ...(query && { title: { contains: query, mode: "insensitive" } }),
        ...(channelFilter && { channelId: channelFilter }),
      },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <form method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input
              name="q"
              defaultValue={query}
              placeholder="搜尋文章標題…"
              className="h-8 w-52 rounded-lg border border-stone-200 bg-white pl-8 pr-3 text-sm placeholder:text-stone-400 focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
            />
            {channelFilter && <input type="hidden" name="channel" value={channelFilter} />}
          </form>

          <div className="flex items-center gap-1">
            <Link
              href="/admin/blog/articles"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${!channelFilter ? "bg-stone-800 text-white" : "text-stone-500 hover:bg-stone-100"}`}
            >
              全部
            </Link>
            {channels.map((ch) => (
              <Link
                key={ch.id}
                href={`/admin/blog/articles?channel=${ch.id}${query ? `&q=${query}` : ""}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${channelFilter === ch.id ? "bg-stone-800 text-white" : "text-stone-500 hover:bg-stone-100"}`}
              >
                {ch.title}
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/admin/blog/articles/new"
          className="flex items-center gap-1.5 rounded-lg bg-[#B72020] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#9e1c1c] transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增文章
        </Link>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-3 h-10 w-10 text-stone-300" />
            <p className="text-sm text-stone-500">
              {query || channelFilter ? "找不到符合條件的文章" : "尚無文章"}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">文章標題</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">頻道</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">作者</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">狀態</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">發布時間</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr
                  key={article.id}
                  className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/blog/articles/${article.id}`}
                      className="font-medium text-stone-800 hover:text-[#B72020] transition-colors"
                    >
                      {article.title}
                    </Link>
                    <p className="text-xs text-stone-400">{article.slug}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-stone-500">{article.channel.title}</td>
                  <td className="px-5 py-3 text-xs text-stone-500">{article.author ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${article.isPublished ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {article.isPublished ? "已發布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-stone-400">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("zh-TW")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3">
            <p className="text-xs text-stone-400">共 {total} 篇</p>
            <div className="flex gap-1">
              {page > 1 && (
                <Link href={`/admin/blog/articles?page=${page - 1}${query ? `&q=${query}` : ""}${channelFilter ? `&channel=${channelFilter}` : ""}`}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs hover:bg-stone-50 transition-colors">上一頁</Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/blog/articles?page=${page + 1}${query ? `&q=${query}` : ""}${channelFilter ? `&channel=${channelFilter}` : ""}`}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs hover:bg-stone-50 transition-colors">下一頁</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
