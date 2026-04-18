"use client";

import { useState, useTransition, useCallback } from "react";
import {
  Search,
  Trash2,
  Copy,
  Check,
  X,
  Pencil,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { deleteMediaBatch, updateMediaAlt, deleteMedia } from "@/lib/actions/media";
import { useRouter } from "next/navigation";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  folder: string;
  createdAt: Date;
}

interface MediaGridProps {
  items: MediaItem[];
  folders: string[];
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

// ── 圖片詳細抽屜 ──────────────────────────────────────────
function MediaDetailPanel({
  item,
  onClose,
  onDeleted,
}: {
  item: MediaItem;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [altText, setAltText] = useState(item.altText ?? "");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [altSaved, setAltSaved] = useState(false);

  function copyUrl() {
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function saveAlt() {
    startTransition(async () => {
      const result = await updateMediaAlt(item.id, altText);
      if ("success" in result) {
        setAltSaved(true);
        setTimeout(() => setAltSaved(false), 2000);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`確定要刪除「${item.filename}」嗎？`)) return;
    startTransition(async () => {
      const result = await deleteMedia(item.id);
      if ("success" in result) {
        onDeleted(item.id);
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 md:items-stretch md:justify-end" onClick={onClose}>
      <div
        className="h-[min(85vh,720px)] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-xl md:h-full md:w-80 md:max-w-none md:rounded-none md:border-l md:border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-stone-800 truncate pr-2">{item.filename}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 預覽 */}
          <div className="rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden" style={{ minHeight: 180 }}>
            {isImage(item.mimeType) ? (
              <img
                src={item.url}
                alt={item.altText ?? item.filename}
                className="max-h-56 max-w-full object-contain"
              />
            ) : (
              <FileText className="h-16 w-16 text-stone-300" />
            )}
          </div>

          {/* 複製 URL */}
          <button
            type="button"
            onClick={copyUrl}
            className="flex w-full items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50 transition-colors"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
            ) : (
              <Copy className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="truncate font-mono">{item.url}</span>
          </button>

          {/* 檔案資訊 */}
          <div className="space-y-1.5 text-xs text-stone-500">
            <div className="flex justify-between">
              <span>類型</span><span className="text-stone-700">{item.mimeType}</span>
            </div>
            <div className="flex justify-between">
              <span>大小</span><span className="text-stone-700">{formatBytes(item.size)}</span>
            </div>
            {item.width && item.height && (
              <div className="flex justify-between">
                <span>尺寸</span><span className="text-stone-700">{item.width} × {item.height}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>資料夾</span><span className="text-stone-700 font-mono">{item.folder}</span>
            </div>
            <div className="flex justify-between">
              <span>上傳日期</span>
              <span className="text-stone-700">
                {new Date(item.createdAt).toLocaleDateString("zh-TW")}
              </span>
            </div>
          </div>

          {/* altText 編輯 */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              替代文字 (alt)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100"
                placeholder="描述此圖片…"
              />
              <button
                type="button"
                onClick={saveAlt}
                disabled={isPending}
                className="rounded-lg bg-stone-800 px-3 py-1.5 text-xs text-white hover:bg-stone-700 disabled:opacity-50 transition-colors"
              >
                {altSaved ? <Check className="h-3.5 w-3.5" /> : "儲存"}
              </button>
            </div>
          </div>

          {/* 刪除 */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            刪除此檔案
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────
export function MediaGrid({ items: initialItems, folders }: MediaGridProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [isPending, startTransition] = useTransition();

  // 篩選
  const filtered = items.filter((item) => {
    const matchFolder = folder === "all" || item.folder === folder;
    const matchQuery =
      !query ||
      item.filename.toLowerCase().includes(query.toLowerCase()) ||
      (item.altText ?? "").toLowerCase().includes(query.toLowerCase());
    return matchFolder && matchQuery;
  });

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleBatchDelete() {
    const ids = Array.from(selected);
    if (!confirm(`確定要刪除 ${ids.length} 個檔案嗎？此操作無法復原。`)) return;
    startTransition(async () => {
      const result = await deleteMediaBatch(ids);
      if ("success" in result) {
        setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
        setSelected(new Set());
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* 工具列 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* 搜尋 */}
        <div className="flex w-full items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 focus-within:border-stone-500 focus-within:ring-2 focus-within:ring-stone-100 sm:min-w-48 sm:flex-1">
          <Search className="h-4 w-4 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="搜尋檔名或描述…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>

        {/* 資料夾篩選 */}
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100 bg-white sm:w-auto"
        >
          <option value="all">所有資料夾</option>
          {folders.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        {/* 批次操作 */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <span className="text-sm text-stone-500">已選 {selected.size} 個</span>
            <button
              type="button"
              onClick={handleBatchDelete}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              批次刪除
            </button>
          </div>
        )}

        {selected.size === 0 ? (
          <span className="text-xs text-stone-400 sm:ml-auto">
            {filtered.length} 個檔案
          </span>
        ) : null}
      </div>

      {/* 全選列 */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="selectAll"
            checked={selected.size === filtered.length && filtered.length > 0}
            onChange={selectAll}
            className="h-4 w-4 rounded border-stone-300"
          />
          <label htmlFor="selectAll" className="text-xs text-stone-500 cursor-pointer">
            全選
          </label>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white py-20 text-stone-400">
          <ImageIcon className="mb-3 h-10 w-10 opacity-40" />
          <p className="text-sm">
            {items.length === 0 ? "尚未上傳任何媒體檔案" : "無符合篩選條件的檔案"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`group relative cursor-pointer rounded-xl border bg-white overflow-hidden transition-all ${
                selected.has(item.id)
                  ? "border-stone-800 ring-2 ring-stone-800/20"
                  : "border-stone-200 hover:border-stone-400"
              }`}
            >
              {/* 選取 checkbox */}
              <div
                className="absolute left-2 top-2 z-10"
                onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded border-stone-300"
                />
              </div>

              {/* 縮圖 */}
              <div
                className="aspect-square bg-stone-100 flex items-center justify-center overflow-hidden"
                onClick={() => setActiveItem(item)}
              >
                {isImage(item.mimeType) ? (
                  <img
                    src={item.url}
                    alt={item.altText ?? item.filename}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <FileText className="h-10 w-10 text-stone-300" />
                )}
              </div>

              {/* 檔名 */}
              <div
                className="px-2 py-1.5"
                onClick={() => setActiveItem(item)}
              >
                <p className="truncate text-[0.7rem] text-stone-600">{item.filename}</p>
                <p className="text-[0.65rem] text-stone-400">{formatBytes(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 詳細側欄 */}
      {activeItem && (
        <MediaDetailPanel
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
