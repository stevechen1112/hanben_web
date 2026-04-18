import Link from "next/link";
import { db } from "@/lib/db";
import { Plus, FileText } from "lucide-react";

export default async function PagesPage() {
  const pages = await db.page.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">共 {pages.length} 個頁面</p>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-1.5 rounded-lg bg-[#B72020] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#9e1c1c] transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增頁面
        </Link>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-3 h-10 w-10 text-stone-300" />
            <p className="text-sm text-stone-500">尚無靜態頁面</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">頁面標題</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">Slug</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">範本</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">狀態</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">最後更新</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr
                  key={page.id}
                  className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="font-medium text-stone-800 hover:text-[#B72020] transition-colors"
                    >
                      {page.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-stone-400">/{page.slug}</td>
                  <td className="px-5 py-3 text-xs text-stone-500">{page.template}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${page.isPublished ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {page.isPublished ? "已發布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-stone-400">
                    {new Date(page.updatedAt).toLocaleDateString("zh-TW")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
