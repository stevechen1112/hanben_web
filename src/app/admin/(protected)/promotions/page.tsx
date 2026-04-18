import Link from "next/link";
import { db } from "@/lib/db";

export default async function PromotionsPage() {
  const promotions = await db.promotion.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">促銷管理</h1>
          <p className="mt-1 text-sm text-stone-500">管理折扣碼、自動促銷與 BOGO 規則。</p>
        </div>
        <Link href="/admin/promotions/new" className="inline-flex items-center justify-center rounded-full bg-[#B72020] px-4 py-2 text-sm font-semibold text-white">新增促銷</Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
        {promotions.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-stone-400">尚無促銷活動</div>
        ) : (
          <>
            <div className="divide-y divide-stone-100 lg:hidden">
              {promotions.map((promotion) => (
                <Link
                  key={promotion.id}
                  href={`/admin/promotions/${promotion.id}`}
                  className="block px-4 py-4 transition-colors hover:bg-stone-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-800">{promotion.name}</p>
                      <p className="mt-1 text-xs text-stone-400">{promotion.type}</p>
                    </div>
                    <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${promotion.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {promotion.isActive ? "啟用" : "停用"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                    <span>{promotion.discountType} / {Number(promotion.discountValue)}</span>
                    <span>{promotion.startAt.toLocaleDateString("zh-TW")}</span>
                    {promotion.code ? <span>代碼：{promotion.code}</span> : null}
                  </div>
                </Link>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">名稱</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">類型</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">折扣</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">期間</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promotion) => (
                    <tr key={promotion.id} className="border-b border-stone-50 last:border-0">
                      <td className="px-5 py-3 text-xs font-medium text-stone-700">{promotion.name}</td>
                      <td className="px-5 py-3 text-xs text-stone-500">{promotion.type}</td>
                      <td className="px-5 py-3 text-xs text-stone-500">{promotion.discountType} / {Number(promotion.discountValue)}</td>
                      <td className="px-5 py-3 text-xs text-stone-500">{promotion.startAt.toLocaleDateString("zh-TW")}</td>
                      <td className="px-5 py-3 text-right text-xs"><Link href={`/admin/promotions/${promotion.id}`} className="text-[#B72020]">編輯</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}