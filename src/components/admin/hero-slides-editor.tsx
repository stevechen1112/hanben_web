"use client";

import { useState, useTransition, useActionState } from "react";
import Image from "next/image";
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
import { GripVertical, Plus, X, Pencil } from "lucide-react";
import {
  createHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
  updateHeroSlide,
} from "@/lib/actions/homepage";
import { MediaUrlInput } from "@/components/admin/media-url-input";

interface Slide {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageDesktop: string;
  imageMobile: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  sortOrder: number;
  isActive: boolean;
}

function SlideForm({
  slide,
  onClose,
}: {
  slide?: Slide;
  onClose: () => void;
}) {
  const action = slide ? updateHeroSlide.bind(null, slide.id) : createHeroSlide;
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-700">
            {slide ? "編輯 Slide" : "新增 Slide"}
          </h3>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {state && "error" in state && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {state.error}
          </p>
        )}

        <form action={async (fd) => { await formAction(fd); if (!state || !("error" in state)) onClose(); }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">標題</label>
              <input name="title" defaultValue={slide?.title ?? ""} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">副標題</label>
              <input name="subtitle" defaultValue={slide?.subtitle ?? ""} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              桌機圖片網址 <span className="text-red-500">*</span>
            </label>
            <MediaUrlInput name="imageDesktop" defaultValue={slide?.imageDesktop ?? ""} kind="image" placeholder="https://..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">手機圖片網址</label>
            <MediaUrlInput name="imageMobile" defaultValue={slide?.imageMobile ?? ""} kind="image" placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">按鈕文字</label>
              <input name="ctaText" defaultValue={slide?.ctaText ?? ""} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">按鈕連結</label>
              <input name="ctaLink" defaultValue={slide?.ctaLink ?? ""} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">排序</label>
              <input type="number" name="sortOrder" defaultValue={slide?.sortOrder ?? 0} min={0} className="w-20 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="hidden" name="isActive" value="false" />
              <input type="checkbox" id="slideActive" name="isActive" value="true" defaultChecked={slide?.isActive ?? true} className="h-4 w-4 rounded border-stone-300" />
              <label htmlFor="slideActive" className="text-sm text-stone-600">啟用</label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">取消</button>
            <button type="submit" disabled={isPending} className="rounded-lg bg-stone-800 px-5 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50">
              {isPending ? "儲存中…" : "儲存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SortableSlide({
  slide,
  onEdit,
  onDelete,
}: {
  slide: Slide;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slide.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2"
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab text-stone-300 hover:text-stone-400">
        <GripVertical className="h-4 w-4" />
      </button>

      {slide.imageDesktop && (
        <div className="h-10 w-16 shrink-0 overflow-hidden rounded bg-stone-100">
          <img src={slide.imageDesktop} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-700 truncate">
          {slide.title ?? "(無標題)"}
        </p>
        <p className="text-xs text-stone-400 truncate">{slide.subtitle}</p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${slide.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-400"}`}
      >
        {slide.isActive ? "啟用" : "停用"}
      </span>

      <button type="button" onClick={onEdit} className="shrink-0 text-stone-400 hover:text-stone-600 transition-colors">
        <Pencil className="h-4 w-4" />
      </button>
      <button type="button" onClick={onDelete} className="shrink-0 text-stone-300 hover:text-red-500 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function HeroSlidesEditor({ initialSlides }: { initialSlides: Slide[] }) {
  const [slides, setSlides] = useState(
    [...initialSlides].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSlides((prev) => {
      const oldIdx = prev.findIndex((s) => s.id === active.id);
      const newIdx = prev.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(prev, oldIdx, newIdx).map((s, idx) => ({
        ...s,
        sortOrder: idx,
      }));
      startTransition(() => {
        reorderHeroSlides(reordered.map((s) => ({ id: s.id, sortOrder: s.sortOrder })));
      });
      return reordered;
    });
  }

  function handleDelete(id: string) {
    if (!confirm("確定要刪除此 Slide？")) return;
    setSlides((prev) => prev.filter((s) => s.id !== id));
    startTransition(() => {
      deleteHeroSlide(id);
    });
  }

  return (
    <>
      {(showNew || editingSlide) && (
        <SlideForm
          slide={editingSlide ?? undefined}
          onClose={() => {
            setShowNew(false);
            setEditingSlide(null);
          }}
        />
      )}

      <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-700">Hero Slider 管理</h2>
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> 新增 Slide
          </button>
        </div>

        {slides.length === 0 ? (
          <p className="text-sm text-stone-400">尚未建立任何 Slide</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {slides.map((slide) => (
                  <SortableSlide
                    key={slide.id}
                    slide={slide}
                    onEdit={() => setEditingSlide(slide)}
                    onDelete={() => handleDelete(slide.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </>
  );
}
