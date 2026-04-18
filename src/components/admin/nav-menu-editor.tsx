"use client";

import { useState, useTransition } from "react";
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
import { GripVertical, Plus, Trash2, ExternalLink, ChevronRight } from "lucide-react";
import { saveNavigationMenu } from "@/lib/actions/navigation";

interface NavItem {
  id: string;
  title: string;
  url: string;
  isExternal: boolean;
  sortOrder: number;
  parentId: string | null;
}

interface NavMenuEditorProps {
  location: string;
  label: string;
  initialItems: NavItem[];
}

let _uid = 0;
function uid() {
  return `new-${++_uid}`;
}

function SortableItem({
  item,
  onUpdate,
  onDelete,
  isChild,
}: {
  item: NavItem;
  onUpdate: (id: string, field: keyof NavItem, value: string | boolean) => void;
  onDelete: (id: string) => void;
  isChild?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ${isChild ? "ml-8" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-stone-300 hover:text-stone-400 shrink-0"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {isChild && <ChevronRight className="h-3.5 w-3.5 text-stone-300 shrink-0" />}

      <input
        value={item.title}
        onChange={(e) => onUpdate(item.id, "title", e.target.value)}
        placeholder="選單文字"
        className="w-32 rounded border border-stone-200 px-2 py-1 text-xs outline-none focus:border-stone-400"
      />
      <input
        value={item.url}
        onChange={(e) => onUpdate(item.id, "url", e.target.value)}
        placeholder="/path 或 https://…"
        className="flex-1 rounded border border-stone-200 px-2 py-1 text-xs font-mono outline-none focus:border-stone-400"
      />
      <label className="flex items-center gap-1 text-xs text-stone-500 shrink-0">
        <input
          type="checkbox"
          checked={item.isExternal}
          onChange={(e) => onUpdate(item.id, "isExternal", e.target.checked)}
          className="h-3 w-3"
        />
        <ExternalLink className="h-3 w-3" />
      </label>
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="shrink-0 text-stone-300 hover:text-red-500 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function NavMenuEditor({ location, label, initialItems }: NavMenuEditorProps) {
  const [items, setItems] = useState<NavItem[]>(
    initialItems.map((i) => ({ ...i })),
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // 頂層和子層分開排序
  const topItems = items.filter((i) => !i.parentId).sort((a, b) => a.sortOrder - b.sortOrder);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const topIds = topItems.map((i) => i.id);
    const oldIdx = topIds.indexOf(String(active.id));
    const newIdx = topIds.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(topIds, oldIdx, newIdx);
    setItems((prev) => {
      const topReordered = reordered.map((id, idx) => {
        const item = prev.find((i) => i.id === id)!;
        return { ...item, sortOrder: idx };
      });
      const rest = prev.filter((i) => i.parentId);
      return [...topReordered, ...rest];
    });
  }

  function addItem(parentId: string | null = null) {
    const newItem: NavItem = {
      id: uid(),
      title: "",
      url: "/",
      isExternal: false,
      sortOrder: items.filter((i) => i.parentId === parentId).length,
      parentId,
    };
    setItems((prev) => [...prev, newItem]);
  }

  function updateItem(id: string, field: keyof NavItem, value: string | boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  function deleteItem(id: string) {
    // 刪除本身和其子項目
    setItems((prev) => prev.filter((i) => i.id !== id && i.parentId !== id));
  }

  function handleSave() {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await saveNavigationMenu(location, items);
      if ("error" in result) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-700">{label}</h2>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-stone-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "儲存中…" : "儲存"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 rounded bg-red-50 border border-red-200 px-3 py-2">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-xs text-green-600 rounded bg-green-50 border border-green-200 px-3 py-2">
          已儲存
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={topItems.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5">
            {topItems.map((item) => {
              const children = items
                .filter((i) => i.parentId === item.id)
                .sort((a, b) => a.sortOrder - b.sortOrder);
              return (
                <div key={item.id}>
                  <SortableItem
                    item={item}
                    onUpdate={updateItem}
                    onDelete={deleteItem}
                  />
                  {children.map((child) => (
                    <div key={child.id} className="mt-1">
                      <SortableItem
                        item={child}
                        onUpdate={updateItem}
                        onDelete={deleteItem}
                        isChild
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addItem(item.id)}
                    className="ml-8 mt-1 flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <Plus className="h-3 w-3" /> 加入子項目
                  </button>
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={() => addItem(null)}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
      >
        <Plus className="h-4 w-4" /> 新增選單項目
      </button>
    </div>
  );
}
