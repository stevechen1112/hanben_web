import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { FaqList } from "@/components/admin/faq-list";

export default async function FaqPage() {
  const items = await db.faqItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, question: true, category: true, sortOrder: true, isActive: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">常見問題（FAQ）</h1>
          <p className="text-sm text-stone-500 mt-0.5">{items.length} 則問答</p>
        </div>
        <Link
          href="/admin/content/faq/new"
          className="flex items-center gap-1.5 rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增問答
        </Link>
      </div>

      <FaqList items={items} />
    </div>
  );
}
