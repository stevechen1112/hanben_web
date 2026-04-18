import Link from "next/link";
import { Plus, FolderOpen } from "lucide-react";
import { db } from "@/lib/db";

export const metadata = { title: "集合管理" };

export default async function CollectionsPage() {
  const collections = await db.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* 標題列 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">集合管理</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            共 {collections.length} 個集合
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增集合
        </Link>
      </div>

      {/* 集合列表 */}
      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white py-20 text-stone-400">
          <FolderOpen className="mb-3 h-10 w-10 opacity-40" />
          <p className="text-sm">尚無集合，立即建立第一個</p>
          <Link
            href="/admin/collections/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            新增集合
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-left text-xs font-medium uppercase tracking-wide text-stone-500">
                <th className="px-6 py-3">集合</th>
                <th className="px-4 py-3 text-center">商品數</th>
                <th className="px-4 py-3 text-center">排序</th>
                <th className="px-4 py-3 text-center">狀態</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {collections.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.title}
                          className="h-9 w-9 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                          <FolderOpen className="h-4 w-4 text-stone-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-stone-800">{c.title}</p>
                        <p className="text-xs text-stone-400 font-mono">{c.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center text-stone-600">
                    {c._count.products}
                  </td>
                  <td className="px-4 py-3.5 text-center text-stone-500">
                    {c.sortOrder}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${
                        c.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {c.isActive ? "啟用" : "停用"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/admin/collections/${c.id}`}
                      className="rounded-md border border-stone-200 px-3 py-1 text-xs text-stone-600 hover:bg-stone-50 transition-colors"
                    >
                      編輯
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
