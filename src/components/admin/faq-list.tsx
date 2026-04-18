"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { GripVertical, ToggleLeft, ToggleRight, Pencil } from "lucide-react";
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
import { reorderFaq, toggleFaqActive } from "@/lib/actions/faq";

interface FaqItem {
  id: string;
  question: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
}

function SortableRow({
  item,
  onToggle,
}: {
  item: FaqItem;
  onToggle: (id: string, val: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-stone-300 hover:text-stone-500"
        aria-label="拖拉排序"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-stone-700">{item.question}</p>
        {item.category && (
          <p className="text-xs text-stone-400 mt-0.5">{item.category}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onToggle(item.id, !item.isActive)}
        className={`shrink-0 transition-colors ${item.isActive ? "text-green-600" : "text-stone-300"}`}
        title={item.isActive ? "停用" : "啟用"}
      >
        {item.isActive ? (
          <ToggleRight className="h-6 w-6" />
        ) : (
          <ToggleLeft className="h-6 w-6" />
        )}
      </button>

      <Link
        href={`/admin/content/faq/${item.id}`}
        className="shrink-0 rounded-md border border-stone-200 p-1.5 text-stone-500 hover:bg-stone-50 transition-colors"
        aria-label="編輯"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export function FaqList({ items: initialItems }: { items: FaqItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        sortOrder: idx,
      }));
      // 更新 DB
      startTransition(() => {
        reorderFaq(reordered.map((i) => ({ id: i.id, sortOrder: i.sortOrder })));
      });
      return reordered;
    });
  }

  function handleToggle(id: string, val: boolean) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isActive: val } : i)),
    );
    startTransition(() => {
      toggleFaqActive(id, val);
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white py-16 text-stone-400">
        <p className="text-sm">尚未建立任何問答</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item) => (
            <SortableRow key={item.id} item={item} onToggle={handleToggle} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
