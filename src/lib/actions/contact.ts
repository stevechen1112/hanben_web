"use server";

import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Result = { success: true } | { error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role === "CUSTOMER") {
    throw new Error("未授權");
  }
}

export async function markContactAsRead(id: string): Promise<void> {
  await requireAdmin();
  await db.contactSubmission.update({ where: { id }, data: { isRead: true } });
  revalidatePath("/admin/contact");
  revalidatePath(`/admin/contact/${id}`);
}

export async function replyContactSubmission(id: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const reply = String(formData.get("reply") || "").trim();
  if (!reply) {
    throw new Error("請輸入回覆內容。");
  }

  const submission = await db.contactSubmission.findUnique({ where: { id } });
  if (!submission) {
    throw new Error("找不到聯絡表單。");
  }

  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  if (resend) {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@hanben.com.tw",
      to: submission.email,
      subject: "【漢本三代】聯絡表單回覆",
      html: `<div style="font-family:'Noto Sans TC',sans-serif;padding:24px;line-height:1.8"><p>您好，${submission.name}：</p><p style="white-space:pre-wrap">${reply}</p></div>`,
    });
  }

  await db.contactSubmission.update({
    where: { id },
    data: { repliedAt: new Date(), isRead: true },
  });

  revalidatePath("/admin/contact");
  revalidatePath(`/admin/contact/${id}`);
}