"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  GripVertical,
  Plus,
  ChevronDown,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── 類型 ──────────────────────────────────────────────────
export interface CollectionProductItem {
  id: string;         // CollectionProduct 關聯 id（新增時留空）
  productId: string;
  title: string;
  imageUrl?: string;
  sortOrder: number;
}

interface CollectionFormProps {
  action: (
    prev: { error: string } | { success: true; id: string } | null,
    formData: FormData,
  ) => Promise<{ error: string } | { success: true; id: string }>;
  defaultValues?: {
    title?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
    products?: CollectionProductItem[];
  };
  allProducts: { id: string; title: string; imageUrl?: string }[];
}

// ── 可拖拉的商品列 ─────────────────────────────────────────
function SortableProductRow({
  item,
  onRemove,
}: {
  item: CollectionProductItem;
  onRemove: (productId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.productId });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-2.5 text-sm"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-stone-400 hover:text-stone-600"
        aria-label="拖拉排序"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-8 w-8 rounded object-cover"
        />
      )}
      <span className="flex-1 truncate text-stone-700">{item.title}</span>
      <button
        type="button"
        onClick={() => onRemove(item.productId)}
        className="text-stone-400 hover:text-red-500 transition-colors"
        aria-label="移除"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────
export function CollectionForm({
  action,
  defaultValues,
  allProducts,
}: CollectionFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const router = useRouter();

  // 已加入的商品列表
  const [products, setProducts] = useState<CollectionProductItem[]>(
    defaultValues?.products ?? [],
  );

  // 搜尋狀態
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 自動產生 slug
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const isEditMode = Boolean(defaultValues?.slug);

  function toSlug(str: string) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!isEditMode) setSlug(toSlug(v));
  }

  // 已加入商品的 id Set
  const addedIds = new Set(products.map((p) => p.productId));

  // 篩選出搜尋結果（未加入）
  const searchResults = allProducts.filter(
    (p) =>
      !addedIds.has(p.id) &&
      p.title.toLowerCase().includes(query.toLowerCase()),
  );

  function addProduct(p: { id: string; title: string; imageUrl?: string }) {
    setProducts((prev) => [
      ...prev,
      {
        id: "",
        productId: p.id,
        title: p.title,
        imageUrl: p.imageUrl,
        sortOrder: prev.length,
      },
    ]);
    setQuery("");
    setShowDropdown(false);
  }

  function removeProduct(productId: string) {
    setProducts((prev) => prev.filter((p) => p.productId !== productId));
  }

  // dnd-kit
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setProducts((items) => {
      const oldIndex = items.findIndex((i) => i.productId === active.id);
      const newIndex = items.findIndex((i) => i.productId === over.id);
      return arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        sortOrder: idx,
      }));
    });
  }

  // 點擊外部關閉下拉
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 成功後跳轉（防止 redirect() server-side 失效時的 fallback）
  useEffect(() => {
    if (state && "success" in state) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* 狀態訊息 */}
      {state && "error" in state && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state && "success" in state && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          儲存成功
        </div>
      )}

      {/* 基本資料 */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-stone-700">基本資料</h2>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            名稱 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            pattern="[a-z0-9-]+"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100"
          />
          <p className="mt-1 text-[0.7rem] text-stone-400">只能包含小寫英文、數字、連字符</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">描述</label>
          <textarea
            name="description"
            defaultValue={defaultValues?.description ?? ""}
            rows={3}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100 resize-y"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">圖片 URL</label>
          <input
            type="url"
            name="imageUrl"
            defaultValue={defaultValues?.imageUrl ?? ""}
            placeholder="https://..."
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100"
          />
        </div>
      </div>

      {/* 顯示設定 */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-stone-700">顯示設定</h2>

        <div className="flex items-center gap-3">
          <input
            type="hidden" name="isActive" value="false" />
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            value="true"
            defaultChecked={defaultValues?.isActive ?? true}
            className="h-4 w-4 rounded border-stone-300 text-stone-800 focus:ring-stone-400"
          />
          <label htmlFor="isActive" className="text-sm text-stone-700">
            啟用此集合（在前台顯示）
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">排序順序</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={defaultValues?.sortOrder ?? 0}
            min={0}
            className="w-28 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100"
          />
        </div>
      </div>

      {/* 商品關聯 */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-stone-700">
          商品關聯
          <span className="ml-2 text-xs font-normal text-stone-400">
            {products.length} 件商品
          </span>
        </h2>

        {/* 搜尋加入商品 */}
        <div ref={searchRef} className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 focus-within:border-stone-500 focus-within:ring-2 focus-within:ring-stone-100">
            <Search className="h-4 w-4 text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="搜尋並加入商品..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="flex-1 text-sm outline-none"
            />
          </div>

          {showDropdown && query.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-stone-200 bg-white shadow-lg max-h-52 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="px-4 py-3 text-sm text-stone-400">
                  {addedIds.size === allProducts.length
                    ? "所有商品已加入"
                    : "無符合結果"}
                </p>
              ) : (
                searchResults.slice(0, 20).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-stone-50 transition-colors"
                  >
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="h-7 w-7 rounded object-cover shrink-0"
                      />
                    )}
                    <span className="truncate text-stone-700">{p.title}</span>
                    <Plus className="ml-auto h-3.5 w-3.5 text-stone-400 shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* 已加入商品列表（可拖拉排序） */}
        {products.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={products.map((p) => p.productId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {products.map((item) => (
                  <SortableProductRow
                    key={item.productId}
                    item={item}
                    onRemove={removeProduct}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <p className="rounded-lg border border-dashed border-stone-200 py-8 text-center text-sm text-stone-400">
            尚未加入任何商品
          </p>
        )}

        {/* 隱藏欄位傳遞商品排序資料 */}
        <input
          type="hidden"
          name="products"
          value={JSON.stringify(
            products.map((p, i) => ({ productId: p.productId, sortOrder: i })),
          )}
        />
      </div>

      {/* 提交 */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-stone-800 px-5 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "儲存中…" : "儲存"}
        </button>
      </div>
    </form>
  );
}
