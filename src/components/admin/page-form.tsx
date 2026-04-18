"use client";

import { useActionState, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AboutPageFields } from "@/components/admin/about-page-fields";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { StorefrontTemplateFields } from "@/components/admin/storefront-template-fields";
import type { AboutPageContent } from "@/lib/about-page-content";
import type { StorefrontTemplateContent } from "@/lib/storefront-template";

type ActionResult = { error: string } | { success: true; id: string };
type PageAction = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

const TEMPLATES = [
  { value: "default", label: "預設" },
  { value: "full-width", label: "全寬" },
  { value: "contact", label: "聯絡我們" },
  { value: "about", label: "關於我們" },
];

interface PageFormProps {
  mode: "create" | "edit";
  action: PageAction;
  defaultValues?: {
    title: string;
    slug: string;
    bodyHtml: string;
    isPublished: boolean;
    template: string;
    seoTitle: string;
    seoDescription: string;
    content: StorefrontTemplateContent;
    aboutContent?: AboutPageContent;
    customContentJson?: string;
  };
}

function toSlug(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function PageForm({ mode, action, defaultValues }: PageFormProps) {
  const router = useRouter();
  const [state, dispatch, isPending] = useActionState<ActionResult | null, FormData>(action, null);

  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugManual, setSlugManual] = useState(mode === "edit");
  const [template, setTemplate] = useState(defaultValues?.template ?? "default");
  const [isPublished, setIsPublished] = useState(defaultValues?.isPublished ?? false);
  const [seoOpen, setSeoOpen] = useState(false);
  const isAboutPage = slug === "about" || template === "about";

  useEffect(() => {
    if (!slugManual && mode === "create") setSlug(toSlug(title));
  }, [title, slugManual, mode]);

  useEffect(() => {
    if (state && "success" in state && (state as { success: true; id: string }).success) {
      router.push(`/admin/pages/${(state as { success: true; id: string }).id}`);
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
          <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3.5">
            <h2 className="text-sm font-semibold text-stone-700">頁面資訊</h2>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">
                標題 <span className="text-red-500">*</span>
              </label>
              <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                placeholder="關於漢本三代" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">
                Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input name="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                  required pattern="[a-z0-9-]+"
                  className="flex-1 rounded-lg border border-stone-200 px-3.5 py-2.5 font-mono text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20" />
                {mode === "create" && (
                  <button type="button" onClick={() => { setSlug(toSlug(title)); setSlugManual(false); }}
                    className="rounded-lg border border-stone-200 px-3 py-2.5 text-xs text-stone-500 hover:bg-stone-50 transition-colors">重新生成</button>
                )}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">
                頁面內容 <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                name="bodyHtml"
                defaultValue={defaultValues?.bodyHtml ?? ""}
                placeholder="頁面內容..."
              />
            </div>
          </div>
          {isAboutPage ? <AboutPageFields defaultValue={defaultValues?.aboutContent} /> : <StorefrontTemplateFields defaultValue={defaultValues?.content} />}

          {!isAboutPage ? (
            <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3.5">
              <div className="space-y-1.5">
                <h2 className="text-sm font-semibold text-stone-700">額外內容 JSON</h2>
                <p className="text-xs leading-6 text-stone-500">
                  給特殊版型頁面使用。這裡的內容會和上方固定欄位一起儲存。
                </p>
              </div>
              <textarea
                name="customContentJson"
                defaultValue={defaultValues?.customContentJson ?? "{}"}
                rows={14}
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 font-mono text-xs resize-y focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                placeholder='{"custom": {}}'
              />
            </div>
          ) : (
            <input type="hidden" name="customContentJson" value={defaultValues?.customContentJson ?? "{}"} />
          )}

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

        <div className="space-y-4">
          <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-stone-700">發布設定</h2>
            <div className="space-y-2">
              {([{ value: false, label: "草稿" }, { value: true, label: "已發布" }] as const).map((opt) => (
                <label key={String(opt.value)}
                  className={cn("flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors",
                    isPublished === opt.value ? "border-[#B72020]/30 bg-[#B72020]/5 text-[#B72020]" : "border-stone-200 text-stone-600 hover:bg-stone-50")}>
                  <input type="radio" checked={isPublished === opt.value} onChange={() => setIsPublished(opt.value)} className="accent-[#B72020]" />
                  {opt.label}
                </label>
              ))}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600">頁面範本</label>
              <select name="template" value={template} onChange={(event) => setTemplate(event.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20">
                {TEMPLATES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B72020] py-3 text-sm font-semibold text-white hover:bg-[#9e1c1c] disabled:opacity-60 transition-colors">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isPending ? "儲存中…" : mode === "create" ? "建立頁面" : "儲存變更"}
          </button>
        </div>
      </div>
    </form>
  );
}
