"use client";

import type { StorefrontTemplateContent } from "@/lib/storefront-template";
import { MediaUploadButton } from "@/components/admin/media-upload-button";
import { MediaUrlInput } from "@/components/admin/media-url-input";

interface StorefrontTemplateFieldsProps {
  defaultValue?: StorefrontTemplateContent;
}

export function StorefrontTemplateFields({ defaultValue }: StorefrontTemplateFieldsProps) {
  const hero = defaultValue?.hero;
  const spotlight = defaultValue?.spotlight;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-5">
      <div className="space-y-1.5">
        <h2 className="text-sm font-semibold text-stone-700">固定版型內容</h2>
        <p className="text-xs leading-6 text-stone-500">
          這些欄位會決定前台固定 layout 的英雄區與內容亮點。媒體可先上傳到媒體庫，再把 URL 貼到對應欄位。
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/80 p-4">
        <MediaUploadButton />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="space-y-3.5 rounded-xl border border-stone-200 p-4">
          <h3 className="text-sm font-semibold text-stone-700">英雄區</h3>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">小標</label>
            <input
              name="heroEyebrow"
              defaultValue={hero?.eyebrow ?? ""}
              className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
              placeholder="例如 ABOUT HANBEN"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">主標題</label>
            <input
              name="heroHeading"
              defaultValue={hero?.heading ?? ""}
              className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
              placeholder="留空時會使用頁面或文章標題"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">引言文字</label>
            <textarea
              name="heroBody"
              defaultValue={hero?.body ?? ""}
              rows={4}
              className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm resize-none focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
              placeholder="出現在標題下方的說明文"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">媒體類型</label>
              <select
                name="heroMediaType"
                defaultValue={hero?.mediaType ?? "image"}
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
              >
                <option value="image">圖片</option>
                <option value="video">影片</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">媒體 URL</label>
              <MediaUrlInput
                name="heroMediaUrl"
                defaultValue={hero?.mediaUrl ?? ""}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">媒體 Alt</label>
              <input
                name="heroMediaAlt"
                defaultValue={hero?.mediaAlt ?? ""}
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                placeholder="圖片替代文字"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">影片 Poster URL</label>
              <MediaUrlInput
                name="heroPosterUrl"
                defaultValue={hero?.posterUrl ?? ""}
                kind="image"
                placeholder="影片封面圖，可留空"
              />
            </div>
          </div>
        </section>

        <section className="space-y-3.5 rounded-xl border border-stone-200 p-4">
          <h3 className="text-sm font-semibold text-stone-700">內容亮點區</h3>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">亮點標題</label>
            <input
              name="spotlightTitle"
              defaultValue={spotlight?.title ?? ""}
              className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
              placeholder="例如 品牌堅持 / 本篇重點"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">亮點說明</label>
            <textarea
              name="spotlightBody"
              defaultValue={spotlight?.body ?? ""}
              rows={5}
              className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm resize-none focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
              placeholder="用來填固定雙欄區塊的文字"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">媒體類型</label>
              <select
                name="spotlightMediaType"
                defaultValue={spotlight?.mediaType ?? "image"}
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
              >
                <option value="image">圖片</option>
                <option value="video">影片</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">媒體 URL</label>
              <MediaUrlInput
                name="spotlightMediaUrl"
                defaultValue={spotlight?.mediaUrl ?? ""}
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">媒體 Alt</label>
            <input
              name="spotlightMediaAlt"
              defaultValue={spotlight?.mediaAlt ?? ""}
              className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
              placeholder="圖片替代文字"
            />
          </div>
        </section>
      </div>
    </div>
  );
}