import { notFound } from "next/navigation";
import { markContactAsRead, replyContactSubmission } from "@/lib/actions/contact";
import { db } from "@/lib/db";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await db.contactSubmission.findUnique({ where: { id } });
  if (!submission) notFound();

  if (!submission.isRead) {
    await markContactAsRead(submission.id);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6">
        <h1 className="text-xl font-semibold text-stone-800">{submission.name}</h1>
        <p className="mt-2 text-sm text-stone-500">{submission.email} {submission.phone ? ` / ${submission.phone}` : ""}</p>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-stone-700">{submission.message}</p>
      </div>

      <form action={replyContactSubmission.bind(null, submission.id)} className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6">
        <h2 className="text-lg font-semibold text-stone-900">回覆訪客</h2>
        <textarea name="reply" rows={8} className="mt-4 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-[#B72020] focus:ring-2 focus:ring-[#B72020]/20" placeholder="輸入回覆內容" />
        <button type="submit" className="mt-4 w-full rounded-full bg-[#B72020] px-5 py-3 text-sm font-semibold text-white sm:w-auto">寄出回覆</button>
      </form>
    </div>
  );
}