"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmSubmitButtonProps {
  label: string;
  confirmMessage: string;
  className?: string;
}

export function ConfirmSubmitButton({
  label,
  confirmMessage,
  className,
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50",
        className,
      )}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}