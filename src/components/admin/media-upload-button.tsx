"use client";

import { useState, useCallback, useTransition } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";

export function MediaUploadButton() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { startUpload, isUploading } = useUploadThing("mediaUpload", {
    onClientUploadComplete: () => {
      startTransition(() => { router.refresh(); });
    },
  });

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) startUpload(files);
    },
    [startUpload],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) startUpload(files);
    e.target.value = "";
  };

  const busy = isUploading || isPending;

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-colors ${
        isDragging
          ? "border-stone-500 bg-stone-50"
          : "border-stone-300 bg-white hover:border-stone-400"
      } ${busy ? "pointer-events-none opacity-60" : ""}`}
    >
      {busy ? (
        <Loader2 className="h-7 w-7 animate-spin text-stone-400" />
      ) : (
        <Upload className="h-7 w-7 text-stone-400" />
      )}
      <p className="text-sm text-stone-500">
        {busy ? "上傳中…" : "點擊或拖曳上傳圖片 / PDF"}
      </p>
      <p className="text-xs text-stone-400">圖片最大 8 MB・PDF 最大 16 MB・每次最多 20 個</p>
      <input
        type="file"
        className="sr-only"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileInput}
        disabled={busy}
      />
    </label>
  );
}
