"use client";

import { useState } from "react";

type ProductGalleryImage = {
  id: string;
  url: string;
  altText: string | null;
};

export function ProductGallery({ title, images }: { title: string; images: ProductGalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0] ?? null;

  if (!activeImage) {
    return (
      <div className="flex min-h-[420px] items-center justify-center border border-[#ece7de] bg-white text-sm tracking-[0.12em] text-[#8f1212]">
        商品圖片待補
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto w-full max-w-[620px] overflow-hidden bg-white">
        <img src={activeImage.url} alt={activeImage.altText ?? title} className="h-full w-full object-contain" />
      </div>

      {images.length > 1 ? (
        <div className="flex items-center justify-center gap-3">
          {images.slice(0, 6).map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`第 ${index + 1} 張商品圖`}
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition",
                  isActive
                    ? "border-[#232323] bg-[#232323] text-white"
                    : "border-[#ddd3c5] bg-white text-stone-500 hover:border-[#232323] hover:text-[#232323]",
                ].join(" ")}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}