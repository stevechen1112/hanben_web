"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "@uploadthing/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUploadThing } from "@/lib/uploadthing";
import { GripVertical, Trash2, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// ── 型別 ──────────────────────────────────────────────────────────────────────
export interface ImageItem {
  id: string; // 本地臨時 ID 或已存 DB 的 ProductImage ID
  url: string;
  altText: string;
  sortOrder: number;
  dbId?: string; // 若已存 DB，這裡是 ProductImage.id
}

interface SortableImageProps {
  item: ImageItem;
  onRemove: (id: string) => void;
  onAltChange: (id: string, alt: string) => void;
}

// ── 單張圖片（可排序） ─────────────────────────────────────────────────────────
function SortableImage({ item, onRemove, onAltChange }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden rounded-lg border border-stone-200 bg-white"
    >
      {/* 圖片 */}
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url}
          alt={item.altText || "商品圖片"}
          className="h-full w-full object-cover"
        />
        {/* 拖拉把手 */}
        <button
          type="button"
          className={cn(
            "absolute left-1.5 top-1.5 cursor-grab rounded bg-white/80 p-1 shadow-sm",
            "opacity-0 transition-opacity group-hover:opacity-100"
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5 text-stone-500" />
        </button>
        {/* 刪除按鈕 */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className={cn(
            "absolute right-1.5 top-1.5 rounded bg-white/80 p-1 shadow-sm",
            "opacity-0 transition-opacity group-hover:opacity-100",
            "hover:bg-red-50 hover:text-red-600"
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* Alt text */}
      <div className="p-2">
        <input
          type="text"
          value={item.altText}
          onChange={(e) => onAltChange(item.id, e.target.value)}
          placeholder="圖片描述 (alt)"
          className="w-full rounded border border-stone-200 px-2 py-1 text-xs focus:border-[#B72020] focus:outline-none focus:ring-1 focus:ring-[#B72020]/20"
        />
      </div>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
interface ImageUploaderProps {
  name: string; // hidden input name，傳遞 JSON 給 Server Action
  endpoint: keyof OurFileRouter;
  defaultImages?: ImageItem[];
  maxFiles?: number;
  className?: string;
}

export function ImageUploader({
  name,
  endpoint,
  defaultImages = [],
  maxFiles = 10,
  className,
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageItem[]>(defaultImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { startUpload } = useUploadThing(endpoint, {
    onUploadError: (err) => {
      setUploadError(err.message);
      setIsUploading(false);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
          ...item,
          sortOrder: idx,
        }));
      });
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxFiles) {
        setUploadError(`最多只能上傳 ${maxFiles} 張圖片`);
        return;
      }
      setUploadError(null);
      setIsUploading(true);

      const uploaded = await startUpload(acceptedFiles);
      if (uploaded) {
        const newImages: ImageItem[] = uploaded.map((f, i) => ({
          id: `new-${Date.now()}-${i}`,
          url: f.ufsUrl ?? (f as unknown as { url: string }).url,
          altText: "",
          sortOrder: images.length + i,
        }));
        setImages((prev) => [...prev, ...newImages]);
      }
      setIsUploading(false);
    },
    [images.length, maxFiles, startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    disabled: isUploading || images.length >= maxFiles,
  });

  const removeImage = (id: string) => {
    setImages((prev) =>
      prev.filter((i) => i.id !== id).map((item, idx) => ({ ...item, sortOrder: idx }))
    );
  };

  const updateAlt = (id: string, altText: string) => {
    setImages((prev) => prev.map((i) => (i.id === id ? { ...i, altText } : i)));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* 上傳區 */}
      {images.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-colors",
            isDragActive
              ? "border-[#B72020] bg-[#B72020]/5"
              : "border-stone-200 hover:border-stone-300 hover:bg-stone-50",
            (isUploading || images.length >= maxFiles) && "cursor-not-allowed opacity-50"
          )}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
              <p className="text-sm text-stone-500">上傳中...</p>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-stone-400" />
              <p className="text-sm text-stone-600">
                {isDragActive ? "放開以上傳" : "拖拉圖片至此，或點擊選擇"}
              </p>
              <p className="text-xs text-stone-400">
                JPG、PNG、WebP，每張最大 4MB，最多 {maxFiles} 張
              </p>
            </>
          )}
        </div>
      )}

      {/* 錯誤提示 */}
      {uploadError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{uploadError}</p>
      )}

      {/* 圖片排序網格 */}
      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {images.map((item) => (
                <SortableImage
                  key={item.id}
                  item={item}
                  onRemove={removeImage}
                  onAltChange={updateAlt}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <p className="text-xs text-stone-400">
        已上傳 {images.length} / {maxFiles} 張，可拖拉調整順序
      </p>

      {/* Hidden input，傳遞 JSON 給 Server Action */}
      <input type="hidden" name={name} value={JSON.stringify(images)} />
    </div>
  );
}
