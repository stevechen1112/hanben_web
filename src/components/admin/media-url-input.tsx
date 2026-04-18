"use client";

import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Search, Video, FileText } from "lucide-react";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  altText: string | null;
  folder: string;
  width: number | null;
  height: number | null;
  createdAt: string;
};

type MediaKind = "all" | "image" | "video" | "document";

function MediaPreview({ item }: { item: MediaItem }) {
  if (item.mimeType.startsWith("image/")) {
    return <img src={item.url} alt={item.altText ?? item.filename} className="h-full w-full object-cover" />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-400">
      {item.mimeType.startsWith("video/") ? <Video className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
    </div>
  );
}

export function MediaUrlInput({
  name,
  defaultValue,
  placeholder,
  kind = "all",
  onValueChange,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  kind?: MediaKind;
  onValueChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const selectedItem = useMemo(() => items.find((item) => item.url === value) ?? null, [items, value]);

  useEffect(() => {
    setValue(defaultValue ?? "");
  }, [defaultValue]);

  function updateValue(nextValue: string) {
    setValue(nextValue);
    onValueChange?.(nextValue);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/admin/media?kind=${kind}&query=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { items?: MediaItem[] };
        setItems(data.items ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [kind, open, query]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          name={name}
          value={value}
          onChange={(event) => updateValue(event.target.value)}
          className="flex-1 rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs text-stone-600 transition-colors hover:bg-stone-50"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          媒體庫
        </button>
      </div>

      {selectedItem ? (
        <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
          <div className="h-12 w-16 overflow-hidden rounded bg-white">
            <MediaPreview item={selectedItem} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-stone-700">{selectedItem.filename}</p>
            <p className="truncate text-[0.7rem] text-stone-400">{selectedItem.folder}</p>
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="flex h-[min(80vh,720px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-800">選擇媒體</h3>
                <p className="text-xs text-stone-500">可直接選取已匯入媒體庫的正式素材</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-500 transition-colors hover:bg-stone-50"
              >
                關閉
              </button>
            </div>

            <div className="border-b border-stone-100 px-5 py-4">
              <label className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 focus-within:border-stone-400">
                <Search className="h-4 w-4 text-stone-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="搜尋檔名、資料夾、描述"
                />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading ? <p className="text-sm text-stone-500">載入中…</p> : null}

              {!loading && items.length === 0 ? (
                <p className="text-sm text-stone-500">找不到符合條件的媒體。</p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                  const isSelected = item.url === value;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        updateValue(item.url);
                        setOpen(false);
                      }}
                      className={`overflow-hidden rounded-xl border text-left transition-colors ${
                        isSelected ? "border-[#B72020] bg-[#B72020]/5" : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-stone-100">
                        <MediaPreview item={item} />
                      </div>
                      <div className="space-y-1 px-3 py-3">
                        <p className="truncate text-xs font-medium text-stone-700">{item.filename}</p>
                        <p className="truncate text-[0.7rem] text-stone-400">{item.folder}</p>
                        <p className="truncate text-[0.7rem] text-stone-400">{item.url}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}