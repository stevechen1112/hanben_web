import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FaqForm } from "@/components/admin/faq-form";
import { deleteFaq, updateFaq } from "@/lib/actions/faq";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-stone-800">編輯問答</h1>

        <form
          action={async () => {
            "use server";
            await deleteFaq(id);
          }}
        >
          <ConfirmSubmitButton
            label="刪除"
            confirmMessage="確定要刪除這筆問答？"
            className="w-full sm:w-auto"
          />
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
