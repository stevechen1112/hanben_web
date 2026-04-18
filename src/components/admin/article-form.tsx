"use client";

import { useActionState, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { StorefrontTemplateFields } from "@/components/admin/storefront-template-fields";
import { MediaUrlInput } from "@/components/admin/media-url-input";
import type { StorefrontTemplateContent } from "@/lib/storefront-template";

type ActionResult = { error: string } | { success: true; id: string };
type ArticleAction = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

interface Channel { id: string; title: string }

interface ArticleFormProps {
  mode: "create" | "edit";
  channels: Channel[];
  action: ArticleAction;
  defaultValues?: {
    channelId: string;
    title: string;
    slug: string;
    excerpt: string;
    bodyHtml: string;
    featureImage: string;
    author: string;
    tags: string;
    isPublished: boolean;
    seoTitle: string;
    seoDescription: string;
    content: StorefrontTemplateContent;
  };
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ArticleForm({ mode, channels, action, defaultValues }: ArticleFormProps) {
  const router = useRouter();
  const [state, dispatch, isPending] = useActionState<ActionResult | null, FormData>(action, null);

  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugManual, setSlugManual] = useState(mode === "edit");
  const [isPublished, setIsPublished] = useState(defaultValues?.isPublished ?? false);
  const [seoOpen, setSeoOpen] = useState(false);

  useEffect(() => {
    if (!slugManual && mode === "create") setSlug(toSlug(title));
  }, [title, slugManual, mode]);

  useEffect(() => {
    if (state && "success" in state && (state as { success: true; id: string }).success) {
      router.push(`/admin/blog/articles/${(state as { success: true; id: string }).id}`);
    }
  }, [state, router]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    fd.set("isPublished", String(isPublished));
    e.preventDefault();
    dispatch(fd);
  }, [isPublished, dispatch]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {state && "error" in state && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {(state as { error: string }).error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* 基本資訊 */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3.5">
            <h2 className="text-sm font-semibold text-stone-700">文章資訊</h2>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">
                標題 <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                placeholder="漢方養生的秘密"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">
                Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  name="slug"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                  required
                  pattern="[a-z0-9-]+"
                  className="flex-1 rounded-lg border border-stone-200 px-3.5 py-2.5 font-mono text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                />
                {mode === "create" && (
                  <button type="button" onClick={() => { setSlug(toSlug(title)); setSlugManual(false); }}
                    className="rounded-lg border border-stone-200 px-3 py-2.5 text-xs text-stone-500 hover:bg-stone-50 transition-colors">
                    重新生成
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">摘要</label>
              <textarea
                name="excerpt"
                defaultValue={defaultValues?.excerpt}
                rows={2}
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm resize-none focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                placeholder="文章摘要（純文字）"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">
                文章內容 <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                name="bodyHtml"
                defaultValue={defaultValues?.bodyHtml ?? ""}
                placeholder="文章內容..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">封面圖片 URL</label>
              <MediaUrlInput
                name="featureImage"
                defaultValue={defaultValues?.featureImage}
                kind="image"
                placeholder="https://..."
              />
            </div>
          </div>

          <StorefrontTemplateFields defaultValue={defaultValues?.content} />

          {/* SEO */}
          <div className="rounded-xl border border-stone-200 bg-white">
            <button type="button" onClick={() => setSeoOpen((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-4">
              <h2 className="text-sm font-semibold text-stone-700">SEO 設定</h2>
              <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", seoOpen && "rotate-180")} />
            </button>
            {seoOpen && (
              <div className="border-t border-stone-100 px-5 pb-5 pt-4 space-y-3.5">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-600">SEO 標題</label>
                  <input name="seoTitle" defaultValue={defaultValues?.seoTitle}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-600">SEO 描述</label>
                  <textarea name="seoDescription" defaultValue={defaultValues?.seoDescription} rows={3}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm resize-none focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 側欄 */}
        <div className="space-y-4">
          {/* 發布設定 */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-3.5 text-sm font-semibold text-stone-700">發布設定</h2>
            <div className="space-y-2">
              {([
                { value: false, label: "草稿", desc: "儲存但不公開" },
                { value: true,  label: "已發布", desc: "立即公開顯示" },
              ] as const).map((opt) => (
                <label key={String(opt.value)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors",
                    isPublished === opt.value
                      ? "border-[#B72020]/30 bg-[#B72020]/5 text-[#B72020]"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50",
                  )}>
                  <input type="radio" checked={isPublished === opt.value}
                    onChange={() => setIsPublished(opt.value)} className="accent-[#B72020]" />
                  <div>
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-xs opacity-70">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 頻道 + 作者 */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-stone-700">文章屬性</h2>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">
                頻道 <span className="text-red-500">*</span>
              </label>
              <select
                name="channelId"
                defaultValue={defaultValues?.channelId ?? channels[0]?.id}
                required
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
              >
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>{ch.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">作者</label>
              <input name="author" defaultValue={defaultValues?.author}
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                placeholder="漢本編輯部" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">標籤</label>
              <input name="tags" defaultValue={defaultValues?.tags}
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                placeholder="漢方, 養生（逗號分隔）" />
            </div>
          </div>

          <button type="submit" disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B72020] py-3 text-sm font-semibold text-white hover:bg-[#9e1c1c] disabled:opacity-60 transition-colors">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isPending ? "儲存中…" : mode === "create" ? "建立文章" : "儲存變更"}
          </button>
        </div>
      </div>
    </form>
  );
}
