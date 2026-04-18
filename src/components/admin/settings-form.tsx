"use client";

import { useActionState } from "react";
import { updateSiteSettings } from "@/lib/actions/settings";
import { Save, Loader2, CheckCircle2 } from "lucide-react";

interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  label: string;
  group: string;
}

interface SettingsFormProps {
  groups: Record<string, Setting[]>;
  groupLabels: Record<string, string>;
}

export function SettingsForm({ groups, groupLabels }: SettingsFormProps) {
  const [state, dispatch, isPending] = useActionState<
    { error: string } | { success: true } | null,
    FormData
  >(updateSiteSettings, null);

  return (
    <form action={dispatch} className="space-y-5">
      {state && "error" in state && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {(state as { error: string }).error}
        </div>
      )}
      {state && "success" in state && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          設定已儲存
        </div>
      )}

      {Object.entries(groups).map(([group, items]) => (
        <div key={group} className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-stone-700">
            {groupLabels[group] ?? group}
          </h2>
          <div className="space-y-3.5">
            {items.map((setting) => (
              <div key={setting.key}>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                  {setting.label}
                </label>
                {setting.type === "textarea" ? (
                  <textarea
                    name={setting.key}
                    defaultValue={setting.value}
                    rows={3}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm resize-none focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                  />
                ) : setting.type === "boolean" ? (
                  <select
                    name={setting.key}
                    defaultValue={setting.value}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                  >
                    <option value="true">開啟</option>
                    <option value="false">關閉</option>
                  </select>
                ) : (
                  <input
                    type={setting.type === "email" ? "email" : setting.type === "url" ? "url" : "text"}
                    name={setting.key}
                    defaultValue={setting.value}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-stretch sm:justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B72020] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#9e1c1c] disabled:opacity-60 transition-colors sm:w-auto"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending ? "儲存中…" : "儲存所有設定"}
        </button>
      </div>
    </form>
  );
}
