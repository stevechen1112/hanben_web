import { deleteShippingRule, saveShippingRule } from "@/lib/actions/shipping";
import { db } from "@/lib/db";

export default async function ShippingAdminPage() {
  const rules = await db.shippingRule.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">運費規則管理</h1>
        <p className="mt-1 text-sm text-stone-500">管理宅配與超商取貨費率、免運門檻與代收貨款費率。</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <form action={saveShippingRule} className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-stone-900">新增運費規則</h2>
          <div className="mt-5 grid gap-4">
            <input name="name" placeholder="規則名稱" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
            <input name="shippingMethod" placeholder="shippingMethod，例如 home_tcat" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="logisticsType" placeholder="Home / CVS" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
              <input name="logisticsSubType" placeholder="TCAT / FAMI" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <input name="baseFee" type="number" placeholder="基礎運費" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
              <input name="freeShippingMin" type="number" placeholder="免運門檻" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
              <input name="codFee" type="number" placeholder="代收貨款費" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
            </div>
            <input name="temperature" placeholder="溫層代碼（選填）" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
            <input name="sortOrder" type="number" defaultValue={0} placeholder="排序" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
            <label className="flex items-center gap-2 text-sm text-stone-600"><input name="isActive" type="checkbox" defaultChecked /> 啟用規則</label>
          </div>
          <button type="submit" className="mt-6 rounded-full bg-[#B72020] px-5 py-3 text-sm font-semibold text-white">新增規則</button>
        </form>

        <div className="space-y-4">
          {rules.map((rule) => (
            <form key={rule.id} action={saveShippingRule} className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
              <input type="hidden" name="id" value={rule.id} />
              <div className="grid gap-3">
                <input name="name" defaultValue={rule.name} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="shippingMethod" defaultValue={rule.shippingMethod} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
                  <input name="logisticsType" defaultValue={rule.logisticsType} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="logisticsSubType" defaultValue={rule.logisticsSubType} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
                  <input name="temperature" defaultValue={rule.temperature || ""} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <input name="baseFee" type="number" defaultValue={Number(rule.baseFee)} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
                  <input name="freeShippingMin" type="number" defaultValue={rule.freeShippingMin ? Number(rule.freeShippingMin) : 0} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
                  <input name="codFee" type="number" defaultValue={rule.codFee ? Number(rule.codFee) : 0} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
                  <input name="sortOrder" type="number" defaultValue={rule.sortOrder} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
                </div>
                <label className="flex items-center gap-2 text-sm text-stone-600"><input name="isActive" type="checkbox" defaultChecked={rule.isActive} /> 啟用規則</label>
              </div>
              <div className="mt-4 flex gap-3">
                <button type="submit" className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white">儲存</button>
                <button formAction={deleteShippingRule.bind(null, rule.id)} type="submit" className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700">刪除</button>
              </div>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}