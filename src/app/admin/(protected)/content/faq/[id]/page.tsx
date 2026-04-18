import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FaqForm } from "@/components/admin/faq-form";
import { deleteFaq, updateFaq } from "@/lib/actions/faq";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditFaqPage({ params }: Props) {
  const { id } = await params;
  const item = await db.faqItem.findUnique({ where: { id } });
  if (!item) notFound();

  const boundUpdate = updateFaq.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-800">編輯問答</h1>

        <form
          action={async () => {
            "use server";
            await deleteFaq(id);
          }}
        >
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            onClick={(e) => {
              if (!confirm("確定要刪除這筆問答？")) e.preventDefault();
            }}
          >
            刪除
          </button>
        </form>
      </div>

      <FaqForm
        action={boundUpdate}
        defaultValues={{
          question: item.question,
          answer: item.answer,
          category: item.category ?? "",
          sortOrder: item.sortOrder,
          isActive: item.isActive,
        }}
      />
    </div>
  );
}
