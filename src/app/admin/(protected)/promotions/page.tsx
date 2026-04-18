import Link from "next/link";
import { db } from "@/lib/db";

export default async function PromotionsPage() {
  const promotions = await db.promotion.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">促銷管理</h1>
          <p className="mt-1 text-sm text-stone-500">管理折扣碼、自動促銷與 BOGO 規則。</p>
        </div>
        <Link href="/admin/promotions/new" className="rounded-full bg-[#B72020] px-4 py-2 text-sm font-semibold text-white">新增促銷</Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
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
            {promotions.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-stone-400">尚無促銷活動</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}