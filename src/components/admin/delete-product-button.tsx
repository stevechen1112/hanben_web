"use client";

import { Trash2 } from "lucide-react";

interface DeleteProductButtonProps {
  productTitle: string;
  action: (formData: FormData) => void | Promise<void>;
}

export function DeleteProductButton({
  productTitle,
  action,
}: DeleteProductButtonProps) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
        onClick={(e) => {
          if (!window.confirm(`確定要刪除「${productTitle}」？此操作無法復原。`)) {
            e.preventDefault();
          }
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
        刪除商品
      </button>
    </form>
  );
}