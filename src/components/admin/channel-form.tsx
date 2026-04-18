"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

interface ChannelFormProps {
  action: (
    prev: { error: string } | { success: true; id: string } | null,
    formData: FormData,
  ) => Promise<{ error: string } | { success: true; id: string }>;
  defaultValues?: {
    title?: string;
    slug?: string;
    description?: string;
  };
}

export function ChannelForm({ action, defaultValues }: ChannelFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const router = useRouter();

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slugInput = document.getElementById("slug") as HTMLInputElement | null;
    if (slugInput && !defaultValues?.slug) {
      slugInput.value = e.target.value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }
  }

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
        <h2 className="text-sm font-semibold text-stone-700">頻道資訊</h2>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            頻道名稱 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            defaultValue={defaultValues?.title ?? ""}
            required
            onChange={handleTitleChange}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            defaultValue={defaultValues?.slug ?? ""}
            required
            placeholder="例如：health-tips"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100"
          />
          <p className="mt-1 text-xs text-stone-400">只能包含小寫英文、數字及連字號</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">說明（選填）</label>
          <textarea
            name="description"
            defaultValue={defaultValues?.description ?? ""}
            rows={3}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100 resize-y"
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
