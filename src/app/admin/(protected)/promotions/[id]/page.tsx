import { notFound } from "next/navigation";
import { deletePromotion, savePromotion } from "@/lib/actions/promotions";
import { db } from "@/lib/db";

export default async function PromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promotion = id === "new" ? null : await db.promotion.findUnique({ where: { id } });
  if (id !== "new" && !promotion) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold text-stone-800">{promotion ? "編輯促銷" : "新增促銷"}</h1>
      <form action={savePromotion} className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs">
        {promotion && <input type="hidden" name="id" value={promotion.id} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="name" defaultValue={promotion?.name || ""} placeholder="促銷名稱" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
          <select name="type" defaultValue={promotion?.type || "AUTOMATIC"} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm">
            <option value="COUPON_CODE">COUPON_CODE</option>
            <option value="AUTOMATIC">AUTOMATIC</option>
            <option value="BUY_X_GET_Y">BUY_X_GET_Y</option>
          </select>
          <input name="code" defaultValue={promotion?.code || ""} placeholder="折扣碼（選填）" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
          <select name="discountType" defaultValue={promotion?.discountType || "FIXED_AMOUNT"} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm">
            <option value="PERCENTAGE">PERCENTAGE</option>
            <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
            <option value="FREE_SHIPPING">FREE_SHIPPING</option>
          </select>
          <input name="discountValue" type="number" step="1" defaultValue={promotion ? Number(promotion.discountValue) : 0} placeholder="折扣值" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
          <input name="minOrderAmount" type="number" step="1" defaultValue={promotion?.minOrderAmount ? Number(promotion.minOrderAmount) : 0} placeholder="最低消費" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
          <input name="maxUses" type="number" step="1" defaultValue={promotion?.maxUses ?? 0} placeholder="使用次數上限" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
          <input name="startAt" type="datetime-local" defaultValue={promotion?.startAt ? new Date(promotion.startAt.getTime() - promotion.startAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
          <input name="endAt" type="datetime-local" defaultValue={promotion?.endAt ? new Date(promotion.endAt.getTime() - promotion.endAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm" />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-stone-600"><input name="isActive" type="checkbox" defaultChecked={promotion?.isActive ?? true} /> 啟用此促銷</label>
        <div className="mt-6 flex items-center gap-3">
          <button type="submit" className="rounded-full bg-[#B72020] px-5 py-3 text-sm font-semibold text-white">儲存促銷</button>
          {promotion && (
            <form action={deletePromotion.bind(null, promotion.id)}>
              <button type="submit" className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-700">刪除</button>
            </form>
          )}
        </div>
      </form>
    </div>
  );
}