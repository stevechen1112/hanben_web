import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { assertTrustedOrigin } from "@/lib/csrf";
import { db } from "@/lib/db";
import { getRequestIp, rateLimit } from "@/lib/rate-limit";
import { getSiteSetting } from "@/lib/site-settings";

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.email(),
  phone: z.string().trim().optional().default(""),
  message: z.string().trim().min(5),
  website: z.string().trim().optional().default(""),
});

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request, new URL(request.url).origin);

    const ip = getRequestIp(request);
    const limit = rateLimit(`contact:${ip}`, { limit: 3, windowMs: 60_000 });
    if (!limit.success) {
      return NextResponse.json({ message: "送出過於頻繁，請稍後再試。" }, { status: 429 });
    }

    const payload = schema.parse(await request.json());
    if (payload.website) {
      return NextResponse.json({ message: "訊息已送出。" });
    }

    await db.contactSubmission.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone || null,
        message: payload.message,
      },
    });

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    const adminEmail = await getSiteSetting("contact_email", "service@hanben.com.tw");
    if (resend && adminEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@hanben.com.tw",
        to: adminEmail,
        subject: `【漢本三代】新聯絡表單：${payload.name}`,
        html: `<div style="font-family:'Noto Sans TC',sans-serif;padding:24px;line-height:1.8"><p>姓名：${payload.name}</p><p>Email：${payload.email}</p><p>電話：${payload.phone || "—"}</p><p style="white-space:pre-wrap">內容：${payload.message}</p></div>`,
      });
    }

    return NextResponse.json({ message: "訊息已送出，我們會盡快回覆您。" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "送出失敗" },
      { status: 500 },
    );
  }
}