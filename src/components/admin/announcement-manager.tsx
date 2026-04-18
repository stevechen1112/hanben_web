"use client";

import { useState, useTransition, useActionState } from "react";
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
import {
  GripVertical,
  Plus,
  X,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  createAnnouncement,
  deleteAnnouncement,
  reorderAnnouncements,
  toggleAnnouncementActive,
  updateAnnouncement,
} from "@/lib/actions/announcement";

interface Bar {
  id: string;
  text: string;
  link: string | null;
  bgColor: string;
  textColor: string;
  isActive: boolean;
  sortOrder: number;
}

function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function AnnouncementForm({
  bar,
  onClose,
}: {
  bar?: Bar;
  onClose: () => void;
}) {
  const action = bar ? updateAnnouncement.bind(null, bar.id) : createAnnouncement;
  const [state, formAction, isPending] = useActionState(action, null);
  const [bgColor, setBgColor] = useState(bar?.bgColor ?? "#C6974A");
  const [textColor, setTextColor] = useState(bar?.textColor ?? "#FFFFFF");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-700">
            {bar ? "編輯公告" : "新增公告"}
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

        <form
          action={async (fd) => {
            await formAction(fd);
            onClose();
          }}
          className="space-y-3"
        >
          <input type="hidden" name="bgColor" value={bgColor} />
          <input type="hidden" name="textColor" value={textColor} />

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              公告文字 <span className="text-red-500">*</span>
            </label>
            <input
              name="text"
              defaultValue={bar?.text ?? ""}
              required
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">連結網址（選填）</label>
            <input
              name="link"
              defaultValue={bar?.link ?? ""}
              placeholder="/products 或 https://…"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono outline-none focus:border-stone-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">背景顏色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={isHexColor(bgColor) ? bgColor : "#c6974a"}
                  onChange={(event) => setBgColor(event.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-stone-300"
                />
                <input
                  value={bgColor}
                  onChange={(event) => setBgColor(event.target.value)}
                  placeholder="#C6974A 或 transparent"
                  className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-xs font-mono outline-none focus:border-stone-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">文字顏色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={isHexColor(textColor) ? textColor : "#ffffff"}
                  onChange={(event) => setTextColor(event.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-stone-300"
                />
                <input
                  value={textColor}
                  onChange={(event) => setTextColor(event.target.value)}
                  placeholder="#FFFFFF"
                  className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-xs font-mono outline-none focus:border-stone-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">排序</label>
              <input
                type="number"
                name="sortOrder"
                defaultValue={bar?.sortOrder ?? 0}
                min={0}
                className="w-20 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="hidden" name="isActive" value="false" />
              <input
                type="checkbox"
                id="barActive"
                name="isActive"
                value="true"
                defaultChecked={bar?.isActive ?? true}
                className="h-4 w-4 rounded border-stone-300"
              />
              <label htmlFor="barActive" className="text-sm text-stone-600">啟用</label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">
              取消
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-stone-800 px-5 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
            >
              {isPending ? "儲存中…" : "儲存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SortableBar({
  bar,
  onEdit,
  onDelete,
  onToggle,
}: {
  bar: Bar;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (val: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: bar.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3"
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab text-stone-300 hover:text-stone-400 shrink-0">
        <GripVertical className="h-4 w-4" />
      </button>

      {/* 預覽色塊 */}
      <div
        className="h-8 min-w-[120px] shrink-0 rounded px-3 flex items-center text-xs font-medium"
        style={{ backgroundColor: bar.bgColor, color: bar.textColor }}
      >
        {bar.text.length > 24 ? bar.text.slice(0, 24) + "…" : bar.text}
      </div>

      <p className="flex-1 min-w-0 truncate text-sm text-stone-600">{bar.text}</p>

      <button
        type="button"
        onClick={() => onToggle(!bar.isActive)}
        className={`shrink-0 transition-colors ${bar.isActive ? "text-green-600" : "text-stone-300"}`}
      >
        {bar.isActive ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
      </button>

      <button type="button" onClick={onEdit} className="shrink-0 text-stone-400 hover:text-stone-600 transition-colors">
        <Pencil className="h-4 w-4" />
      </button>
      <button type="button" onClick={onDelete} className="shrink-0 text-stone-300 hover:text-red-500 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AnnouncementManager({ initialBars }: { initialBars: Bar[] }) {
  const [bars, setBars] = useState(
    [...initialBars].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [editingBar, setEditingBar] = useState<Bar | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBars((prev) => {
      const oldIdx = prev.findIndex((b) => b.id === active.id);
      const newIdx = prev.findIndex((b) => b.id === over.id);
      const reordered = arrayMove(prev, oldIdx, newIdx).map((b, idx) => ({
        ...b,
        sortOrder: idx,
      }));
      startTransition(() => {
        reorderAnnouncements(reordered.map((b) => ({ id: b.id, sortOrder: b.sortOrder })));
      });
      return reordered;
    });
  }

  function handleDelete(id: string) {
    if (!confirm("確定要刪除此公告？")) return;
    setBars((prev) => prev.filter((b) => b.id !== id));
    startTransition(() => {
      deleteAnnouncement(id);
    });
  }

  function handleToggle(id: string, val: boolean) {
    setBars((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: val } : b)));
    startTransition(() => {
      toggleAnnouncementActive(id, val);
    });
  }

  return (
    <>
      {(showNew || editingBar) && (
        <AnnouncementForm
          bar={editingBar ?? undefined}
          onClose={() => {
            setShowNew(false);
            setEditingBar(null);
          }}
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={bars.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {bars.length === 0 && (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white py-12 text-sm text-stone-400">
                尚未建立任何公告
              </div>
            )}
            {bars.map((bar) => (
              <SortableBar
                key={bar.id}
                bar={bar}
                onEdit={() => setEditingBar(bar)}
                onDelete={() => handleDelete(bar.id)}
                onToggle={(val) => handleToggle(bar.id, val)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={() => setShowNew(true)}
        className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
      >
        <Plus className="h-4 w-4" /> 新增公告
      </button>
    </>
  );
}
