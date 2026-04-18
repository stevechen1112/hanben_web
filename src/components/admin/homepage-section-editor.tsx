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
import { GripVertical, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from "lucide-react";
import { updateHomepageSection, reorderHomepageSections } from "@/lib/actions/homepage";

interface Section {
  id: string;
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
}

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero 輪播",
  brand_story: "品牌故事",
  stats: "數據統計",
  products: "商品展示",
  brand_values: "品牌價值",
  video: "影片區塊",
  icon_grid: "圖示格",
};

function SectionRow({
  section,
  onToggle,
}: {
  section: Section;
  onToggle: (id: string, val: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [localContent, setLocalContent] = useState(
    JSON.stringify(section.content, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  async function handleSaveContent() {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(localContent);
      setJsonError(null);
    } catch {
      setJsonError("JSON 格式錯誤");
      return;
    }
    setSaving(true);
    setSaved(false);
    const result = await updateHomepageSection(section.id, {
      title: section.title ?? undefined,
      subtitle: section.subtitle ?? undefined,
      content: parsed,
      isActive: section.isActive,
      sortOrder: section.sortOrder,
    });
    setSaving(false);
    if ("error" in result) setJsonError(result.error);
    else setSaved(true);
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="rounded-xl border border-stone-200 bg-white overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" {...attributes} {...listeners} className="cursor-grab text-stone-300 hover:text-stone-400 shrink-0">
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-stone-700">
            {SECTION_LABELS[section.sectionType] ?? section.sectionType}
          </span>
          {section.title && (
            <span className="ml-2 text-xs text-stone-400">{section.title}</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onToggle(section.id, !section.isActive)}
          className={`shrink-0 transition-colors ${section.isActive ? "text-green-600" : "text-stone-300"}`}
          title={section.isActive ? "停用" : "啟用"}
        >
          {section.isActive ? (
            <ToggleRight className="h-6 w-6" />
          ) : (
            <ToggleLeft className="h-6 w-6" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-stone-100 px-4 py-3 space-y-2">
          <p className="text-xs text-stone-400">content JSON</p>
          <textarea
            value={localContent}
            onChange={(e) => {
              setLocalContent(e.target.value);
              setSaved(false);
            }}
            rows={8}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 font-mono text-xs outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100 resize-y"
          />
          {jsonError && <p className="text-xs text-red-600">{jsonError}</p>}
          {saved && <p className="text-xs text-green-600">已儲存</p>}
          <button
            type="button"
            onClick={handleSaveContent}
            disabled={saving}
            className="rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "儲存中…" : "儲存 JSON"}
          </button>
        </div>
      )}
    </div>
  );
}

export function HomepageSectionEditor({ initialSections }: { initialSections: Section[] }) {
  const [sections, setSections] = useState(
    [...initialSections].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const oldIdx = prev.findIndex((s) => s.id === active.id);
      const newIdx = prev.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(prev, oldIdx, newIdx).map((s, idx) => ({
        ...s,
        sortOrder: idx,
      }));
      startTransition(() => {
        reorderHomepageSections(reordered.map((s) => ({ id: s.id, sortOrder: s.sortOrder })));
      });
      return reordered;
    });
  }

  function handleToggle(id: string, val: boolean) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: val } : s)),
    );
    startTransition(() => {
      const section = sections.find((s) => s.id === id)!;
      updateHomepageSection(id, {
        content: section.content,
        isActive: val,
        sortOrder: section.sortOrder,
      });
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sections.map((s) => (
            <SectionRow key={s.id} section={s} onToggle={handleToggle} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
