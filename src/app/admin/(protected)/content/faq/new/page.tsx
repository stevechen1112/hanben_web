import { FaqForm } from "@/components/admin/faq-form";
import { createFaq } from "@/lib/actions/faq";

export default function NewFaqPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">新增問答</h1>
      </div>
      <FaqForm action={createFaq} />
    </div>
  );
}
