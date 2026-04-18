"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, useTransition } from "react";
import { MediaUrlInput } from "@/components/admin/media-url-input";
import { updateSiteSettings } from "@/lib/actions/site-settings";

interface SettingField {
  key: string;
  label: string;
  value: string;
  type?: "text" | "textarea" | "url" | "media" | "password";
  placeholder?: string;
  description?: string;
  group?: string;
  storageType?: string;
}

interface SettingsGroupProps {
  title: string;
  fields: SettingField[];
  description?: string;
}

export function SettingsGroup({ title, fields, description }: SettingsGroupProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, f.value])),
  );
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setSaved(false);
    setError(null);
    const updates = fields.map((field) => ({
      key: field.key,
      value: values[field.key] ?? "",
      group: field.group,
      label: field.label,
      type: field.storageType ?? field.type,
    }));
    startTransition(async () => {
      const result = await updateSiteSettings(updates);
      if ("error" in result) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-stone-700">{title}</h2>
          {description ? <p className="mt-1 text-xs leading-6 text-stone-500">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-stone-800 px-4 py-2 text-xs font-medium text-white hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "儲存中…" : "儲存"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
          已儲存
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              {field.label}
            </label>
            {field.description ? <p className="mb-2 text-xs leading-6 text-stone-400">{field.description}</p> : null}
            {field.type === "textarea" ? (
              <textarea
                value={values[field.key] ?? ""}
                onChange={(e) => {
                  setValues((v) => ({ ...v, [field.key]: e.target.value }));
                  setSaved(false);
                }}
                rows={3}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100 resize-y"
              />
            ) : field.type === "media" ? (
              <MediaUrlInput
                name={field.key}
                defaultValue={values[field.key] ?? ""}
                kind="image"
                placeholder={field.placeholder}
                onValueChange={(value) => {
                  setValues((current) => ({ ...current, [field.key]: value }));
                  setSaved(false);
                }}
              />
            ) : (
              <div className="relative">
                <input
                  type={field.type === "url" ? "url" : field.type === "password" && !revealedFields[field.key] ? "password" : "text"}
                  value={values[field.key] ?? ""}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, [field.key]: e.target.value }));
                    setSaved(false);
                  }}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 pr-11 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100"
                />
                {field.type === "password" ? (
                  <button
                    type="button"
                    onClick={() => setRevealedFields((current) => ({
                      ...current,
                      [field.key]: !current[field.key],
                    }))}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-stone-400 transition hover:text-stone-700"
                    aria-label={revealedFields[field.key] ? `隱藏 ${field.label}` : `顯示 ${field.label}`}
                  >
                    {revealedFields[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
