"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

interface FaqFormProps {
  action: (
    prev: { error: string } | { success: true; id: string } | null,
    formData: FormData,
  ) => Promise<{ error: string } | { success: true; id: string }>;
  defaultValues?: {
    question?: string;
    answer?: string;
    category?: string;
    sortOrder?: number;
    isActive?: boolean;
  };
}

export function FaqForm({ action, defaultValues }: FaqFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const router = useRouter();

  return (
    <form action={formAction} className="space-y-6">
      {state && "error" in state && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state && "success" in state && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          儲存成功
        </div>
      )}

      <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-stone-700">問答內容</h2>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            問題 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="question"
            defaultValue={defaultValues?.question ?? ""}
            required
            rows={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100 resize-y"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            答案 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="answer"
            defaultValue={defaultValues?.answer ?? ""}
            required
            rows={5}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100 resize-y"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">分類（選填）</label>
          <input
            type="text"
            name="category"
            defaultValue={defaultValues?.category ?? ""}
            placeholder="例如：使用方式、成分說明…"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100"
          />
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-stone-700">顯示設定</h2>

        <div className="flex items-center gap-3">
          <input type="hidden" name="isActive" value="false" />
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            value="true"
            defaultChecked={defaultValues?.isActive ?? true}
            className="h-4 w-4 rounded border-stone-300"
          />
          <label htmlFor="isActive" className="text-sm text-stone-700">啟用此問答</label>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">排序順序</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={defaultValues?.sortOrder ?? 0}
            min={0}
            className="w-28 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-stone-800 px-5 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "儲存中…" : "儲存"}
        </button>
      </div>
    </form>
  );
}
