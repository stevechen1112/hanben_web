"use client";

import { MediaUploadButton } from "@/components/admin/media-upload-button";
import { MediaUrlInput } from "@/components/admin/media-url-input";
import type { AboutPageContent } from "@/lib/about-page-content";

function linesToTextareaValue(lines?: string[]) {
  return lines?.join("\n") ?? "";
}

export function AboutPageFields({ defaultValue }: { defaultValue?: AboutPageContent }) {
  const firstStory = defaultValue?.storySections?.[0];
  const secondStory = defaultValue?.storySections?.[1];

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-5">
      <div className="space-y-1.5">
        <h2 className="text-sm font-semibold text-stone-700">關於頁內容</h2>
        <p className="text-xs leading-6 text-stone-500">
          關於頁固定版型專用欄位。圖片請優先從媒體庫選取，文字多行欄位會自動按換行拆成段落。
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/80 p-4">
        <MediaUploadButton />
      </div>

      <section className="space-y-4 rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-semibold text-stone-700">品牌精神與堅持</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">背景圖 URL</label>
            <MediaUrlInput name="aboutBackgroundImageUrl" defaultValue={defaultValue?.backgroundImageUrl ?? ""} kind="image" placeholder="品牌精神背景圖" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">背景圖 Alt</label>
            <input name="aboutBackgroundImageAlt" defaultValue={defaultValue?.backgroundImageAlt ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">品牌精神標題</label>
            <input name="aboutBrandSpiritHeading" defaultValue={defaultValue?.brandSpiritHeading ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">品牌精神強調句</label>
            <input name="aboutBrandSpiritHighlight" defaultValue={defaultValue?.brandSpiritHighlight ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-stone-600">品牌精神段落</label>
          <textarea name="aboutBrandSpiritLines" defaultValue={linesToTextareaValue(defaultValue?.brandSpiritLines)} rows={4} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm resize-y focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">品牌核心圖片 URL</label>
            <MediaUrlInput name="aboutBrandCoreImageUrl" defaultValue={defaultValue?.brandCoreImageUrl ?? ""} kind="image" placeholder="品牌核心圖片" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">品牌核心圖片 Alt</label>
            <input name="aboutBrandCoreImageAlt" defaultValue={defaultValue?.brandCoreImageAlt ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">品牌堅持標題</label>
            <input name="aboutBrandCommitmentHeading" defaultValue={defaultValue?.brandCommitmentHeading ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">品牌堅持強調句</label>
            <input name="aboutBrandCommitmentHighlight" defaultValue={defaultValue?.brandCommitmentHighlight ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-stone-600">品牌堅持段落</label>
          <textarea name="aboutBrandCommitmentLines" defaultValue={linesToTextareaValue(defaultValue?.brandCommitmentLines)} rows={4} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm resize-y focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-semibold text-stone-700">品牌故事</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">分隔圖 Desktop URL</label>
            <MediaUrlInput name="aboutStoryDividerDesktopUrl" defaultValue={defaultValue?.storyDividerDesktopUrl ?? ""} kind="image" placeholder="品牌故事桌機分隔圖" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">分隔圖 Mobile URL</label>
            <MediaUrlInput name="aboutStoryDividerMobileUrl" defaultValue={defaultValue?.storyDividerMobileUrl ?? ""} kind="image" placeholder="品牌故事手機分隔圖" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">分隔圖 Alt</label>
            <input name="aboutStoryDividerAlt" defaultValue={defaultValue?.storyDividerAlt ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">品牌故事標題</label>
            <input name="aboutStoryHeading" defaultValue={defaultValue?.storyHeading ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-stone-600">品牌故事副標題</label>
            <input name="aboutStorySubheading" defaultValue={defaultValue?.storySubheading ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-stone-600">品牌故事引言</label>
            <textarea name="aboutStoryIntro" defaultValue={defaultValue?.storyIntro ?? ""} rows={3} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm resize-y focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
        </div>
      </section>

      {[{ index: 1, title: "第一段故事", value: firstStory }, { index: 2, title: "第二段故事", value: secondStory }].map((section) => (
        <section key={section.index} className="space-y-4 rounded-xl border border-stone-200 p-4">
          <h3 className="text-sm font-semibold text-stone-700">{section.title}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">標題</label>
              <input name={`aboutStorySection${section.index}Heading`} defaultValue={section.value?.heading ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">副標題</label>
              <input name={`aboutStorySection${section.index}Subheading`} defaultValue={section.value?.subheading ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">圖片 URL</label>
              <MediaUrlInput name={`aboutStorySection${section.index}ImageUrl`} defaultValue={section.value?.imageUrl ?? ""} kind="image" placeholder="故事圖片" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">圖片 Alt</label>
              <input name={`aboutStorySection${section.index}ImageAlt`} defaultValue={section.value?.imageAlt ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-stone-600">段落</label>
              <textarea name={`aboutStorySection${section.index}Paragraphs`} defaultValue={linesToTextareaValue(section.value?.paragraphs)} rows={6} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm resize-y focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
            </div>
          </div>
        </section>
      ))}

      <section className="space-y-4 rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-semibold text-stone-700">第三代段落</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">標題</label>
            <input name="aboutThirdGenerationHeading" defaultValue={defaultValue?.thirdGenerationHeading ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">副標題</label>
            <input name="aboutThirdGenerationSubheading" defaultValue={defaultValue?.thirdGenerationSubheading ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">圖片 URL</label>
            <MediaUrlInput name="aboutThirdGenerationImageUrl" defaultValue={defaultValue?.thirdGenerationImageUrl ?? ""} kind="image" placeholder="第三代圖片" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">圖片 Alt</label>
            <input name="aboutThirdGenerationImageAlt" defaultValue={defaultValue?.thirdGenerationImageAlt ?? ""} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-stone-600">段落</label>
            <textarea name="aboutThirdGenerationParagraphs" defaultValue={linesToTextareaValue(defaultValue?.thirdGenerationParagraphs)} rows={7} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm resize-y focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
          </div>
        </div>
      </section>
    </div>
  );
}