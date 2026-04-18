"use client";

import { Trash2 } from "lucide-react";

export function DeletePageButton() {
  return (
    <button
      type="submit"
      className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50"
      onClick={(event) => {
        if (!confirm("確定要刪除此頁面？")) {
          event.preventDefault();
        }
      }}
    >
      <Trash2 className="h-3.5 w-3.5" />
      刪除頁面
    </button>
  );
}