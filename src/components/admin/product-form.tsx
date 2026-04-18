"use client";

import { useActionState, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, Save, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUploader, type ImageItem } from "@/components/admin/image-uploader";

// ── 型別 ────────────────────────────────────────────────────
type ActionResult = { error: string } | { success: true; id: string };
type ProductAction = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

interface VariantRow {
  id?: string;
  title: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  inventory: string;
  isActive: boolean;
}

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  defaultValues?: {
    title: string;
    slug: string;
    description: string;
    bodyHtml: string;
    vendor: string;
    productType: string;
    status: "ACTIVE" | "DRAFT" | "ARCHIVED";
    seoTitle: string;
    seoDescription: string;
    tags: string;
    variants: VariantRow[];
    images: ImageItem[];
  };
  action: ProductAction;
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "草稿" },
  { value: "ACTIVE", label: "上架中" },
  { value: "ARCHIVED", label: "封存" },
];

// slug 自動產生
function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── 元件 ────────────────────────────────────────────────────
export function ProductForm({
  mode,
  productId,
  defaultValues,
  action,
}: ProductFormProps) {
  const router = useRouter();

  const [state, dispatch, isPending] = useActionState<ActionResult | null, FormData>(action, null);

  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugManual, setSlugManual] = useState(mode === "edit");
  const [status, setStatus] = useState(defaultValues?.status ?? "DRAFT");
  const [variants, setVariants] = useState<VariantRow[]>(
    defaultValues?.variants ?? [
      { title: "預設規格", sku: "", price: "0", compareAtPrice: "", inventory: "0", isActive: true },
    ],
  );
  const [seoOpen, setSeoOpen] = useState(false);

  // 自動填充 slug
  useEffect(() => {
    if (!slugManual && mode === "create") {
      setSlug(toSlug(title));
    }
  }, [title, slugManual, mode]);

  // 導向成功後
  useEffect(() => {
    if (state && "success" in state && (state as { success: true; id: string }).success) {
      router.push(`/admin/products/${(state as { success: true; id: string }).id}`);
    }
  }, [state, router]);

  function addVariant() {
    setVariants((v) => [
      ...v,
      { title: "", sku: "", price: "0", compareAtPrice: "", inventory: "0", isActive: true },
    ]);
  }

  function removeVariant(idx: number) {
    setVariants((v) => v.filter((_, i) => i !== idx));
  }

  function updateVariant(idx: number, field: keyof VariantRow, value: string | boolean) {
    setVariants((v) =>
      v.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    );
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      const form = e.currentTarget;
      const fd = new FormData(form);
      fd.set("variants", JSON.stringify(variants));
      e.preventDefault();
      dispatch(fd);
    },
    [variants, dispatch],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 錯誤訊息 */}
      {state && "error" in state && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {(state as { error: string }).error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* 主要內容區 */}
        <div className="space-y-4 lg:col-span-2">
          {/* 基本資訊 */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-stone-700">基本資訊</h2>
            <div className="space-y-3.5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                  商品名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                  placeholder="漢本三代 舒活飲"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                  Slug (URL 路徑) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    name="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManual(true);
                    }}
                    required
                    pattern="[a-z0-9-]+"
                    className="flex-1 rounded-lg border border-stone-200 px-3.5 py-2.5 font-mono text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                    placeholder="shu-huo-yin"
                  />
                  {mode === "create" && (
                    <button
                      type="button"
                      onClick={() => { setSlug(toSlug(title)); setSlugManual(false); }}
                      className="rounded-lg border border-stone-200 px-3 py-2.5 text-xs text-stone-500 hover:bg-stone-50 transition-colors"
                    >
                      重新生成
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                  摘要描述
                </label>
                <textarea
                  name="description"
                  defaultValue={defaultValues?.description}
                  rows={2}
                  className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm resize-none focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                  placeholder="商品簡短描述（純文字）"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                  商品詳細說明
                </label>
                <RichTextEditor
                  name="bodyHtml"
                  defaultValue={defaultValues?.bodyHtml ?? ""}
                  placeholder="商品詳細說明..."
                />
              </div>
            </div>
          </div>

          {/* 商品圖片 */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-stone-700">商品圖片</h2>
            <ImageUploader
              name="images"
              endpoint="productImage"
              defaultImages={defaultValues?.images ?? []}
              maxFiles={10}
            />
          </div>

          {/* 規格管理 */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-700">規格</h2>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                新增規格
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-stone-100 bg-stone-50/50 p-3.5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-stone-300" />
                      <span className="text-xs font-medium text-stone-600">
                        規格 {idx + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-stone-500">
                        <input
                          type="checkbox"
                          checked={v.isActive}
                          onChange={(e) => updateVariant(idx, "isActive", e.target.checked)}
                          className="rounded border-stone-300"
                        />
                        啟用
                      </label>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="rounded-md p-1 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="mb-1 block text-[0.7rem] text-stone-500">
                        規格名稱 *
                      </label>
                      <input
                        value={v.title}
                        onChange={(e) => updateVariant(idx, "title", e.target.value)}
                        required
                        className="w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#B72020] focus:outline-none"
                        placeholder="15包/盒"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[0.7rem] text-stone-500">SKU</label>
                      <input
                        value={v.sku}
                        onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                        className="w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#B72020] focus:outline-none"
                        placeholder="HB-001"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[0.7rem] text-stone-500">
                        售價 *
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="1"
                        value={v.price}
                        onChange={(e) => updateVariant(idx, "price", e.target.value)}
                        required
                        className="w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#B72020] focus:outline-none"
                        placeholder="990"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[0.7rem] text-stone-500">
                        原價
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="1"
                        value={v.compareAtPrice}
                        onChange={(e) => updateVariant(idx, "compareAtPrice", e.target.value)}
                        className="w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#B72020] focus:outline-none"
                        placeholder="1200"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[0.7rem] text-stone-500">
                        庫存
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="1"
                        value={v.inventory}
                        onChange={(e) => updateVariant(idx, "inventory", e.target.value)}
                        className="w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#B72020] focus:outline-none"
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO 設定（可收合） */}
          <div className="rounded-xl border border-stone-200 bg-white">
            <button
              type="button"
              onClick={() => setSeoOpen((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-4"
            >
              <h2 className="text-sm font-semibold text-stone-700">SEO 設定</h2>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-stone-400 transition-transform",
                  seoOpen && "rotate-180",
                )}
              />
            </button>
            {seoOpen && (
              <div className="border-t border-stone-100 px-5 pb-5 pt-4 space-y-3.5">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    SEO 標題
                  </label>
                  <input
                    name="seoTitle"
                    defaultValue={defaultValues?.seoTitle}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                    placeholder="漢本三代 舒活飲 — 品牌名稱"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    SEO 描述
                  </label>
                  <textarea
                    name="seoDescription"
                    defaultValue={defaultValues?.seoDescription}
                    rows={3}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm resize-none focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                    placeholder="160 字以內的搜尋結果摘要"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 側欄 */}
        <div className="space-y-4">
          {/* 狀態 */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-3.5 text-sm font-semibold text-stone-700">狀態</h2>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors",
                    status === opt.value
                      ? "border-[#B72020]/30 bg-[#B72020]/5 text-[#B72020]"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50",
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={status === opt.value}
                    onChange={() => setStatus(opt.value as typeof status)}
                    className="accent-[#B72020]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* 商品屬性 */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-3.5 text-sm font-semibold text-stone-700">商品屬性</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">品牌</label>
                <input
                  name="vendor"
                  defaultValue={defaultValues?.vendor}
                  className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                  placeholder="漢本三代"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">商品類型</label>
                <input
                  name="productType"
                  defaultValue={defaultValues?.productType}
                  className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                  placeholder="保健食品"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                  標籤
                </label>
                <input
                  name="tags"
                  defaultValue={defaultValues?.tags}
                  className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                  placeholder="漢方, 舒緩, 保健（逗號分隔）"
                />
              </div>
            </div>
          </div>

          {/* 儲存按鈕 */}
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B72020] py-3 text-sm font-semibold text-white hover:bg-[#9e1c1c] disabled:opacity-60 transition-colors"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isPending ? "儲存中…" : mode === "create" ? "建立商品" : "儲存變更"}
          </button>
        </div>
      </div>
    </form>
  );
}
