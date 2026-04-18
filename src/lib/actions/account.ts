"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createTimedToken, verifyTimedToken } from "@/lib/auth-token";
import { db } from "@/lib/db";
import { Resend } from "resend";

type Result = { success: true; message?: string } | { error: string };

function getResendClient() {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || "noreply@hanben.com.tw";
}

async function requireCustomer() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    throw new Error("未授權");
  }
  return session.user.id;
}

export async function registerCustomer(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<Result> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password || input.password.length < 8) {
    return { error: "請輸入完整資料，且密碼至少 8 碼。" };
  }

  const exists = await db.customer.findUnique({ where: { email } });
  if (exists) {
    return { error: "此 Email 已註冊。" };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  await db.customer.create({
    data: {
      email,
      passwordHash,
      firstName: input.firstName.trim() || null,
      lastName: input.lastName.trim() || null,
      phone: input.phone.trim() || null,
    },
  });

  return { success: true };
}

export async function sendForgotPasswordEmail(email: string, origin: string): Promise<Result> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { error: "請輸入 Email。" };
  }

  const customer = await db.customer.findUnique({ where: { email: normalized } });
  if (!customer) {
    return { success: true, message: "若帳號存在，系統已寄出重設密碼信。" };
  }

  const token = createTimedToken({ customerId: customer.id, email: customer.email }, 60 * 60);
  const resetUrl = `${origin}/account/reset-password?token=${encodeURIComponent(token)}`;
  const resend = getResendClient();

  if (resend) {
    await resend.emails.send({
      from: getFromEmail(),
      to: customer.email,
      subject: "【漢本三代】重設您的會員密碼",
      html: `<div style="font-family:'Noto Sans TC',sans-serif;padding:24px;line-height:1.8"><p>您好：</p><p>請點擊以下連結重設密碼：</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>連結將在 1 小時後失效。</p></div>`,
    });
  }

  return { success: true, message: "若帳號存在，系統已寄出重設密碼信。" };
}

export async function resetCustomerPassword(token: string, password: string): Promise<Result> {
  if (!password || password.length < 8) {
    return { error: "新密碼至少需要 8 碼。" };
  }

  const payload = verifyTimedToken<{ customerId: string; email: string }>(token);
  if (!payload?.customerId || !payload.email) {
    return { error: "重設連結已失效或格式不正確。" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.customer.update({
    where: { id: payload.customerId, email: payload.email },
    data: { passwordHash },
  });

  return { success: true };
}

export async function updateCustomerProfile(formData: FormData): Promise<void> {
  const customerId = await requireCustomer();
  await db.customer.update({
    where: { id: customerId },
    data: {
      firstName: String(formData.get("firstName") || "").trim() || null,
      lastName: String(formData.get("lastName") || "").trim() || null,
      phone: String(formData.get("phone") || "").trim() || null,
    },
  });

  revalidatePath("/account");
}

export async function saveCustomerAddress(formData: FormData): Promise<void> {
  const customerId = await requireCustomer();
  const id = String(formData.get("id") || "").trim();
  const isDefault = String(formData.get("isDefault") || "") === "on";

  const data = {
    label: String(formData.get("label") || "").trim() || null,
    recipientName: String(formData.get("recipientName") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    zipCode: String(formData.get("zipCode") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    district: String(formData.get("district") || "").trim(),
    addressLine: String(formData.get("addressLine") || "").trim(),
    isDefault,
  };

  if (!data.recipientName || !data.phone || !data.zipCode || !data.city || !data.district || !data.addressLine) {
    throw new Error("請完整填寫地址資料。");
  }

  await db.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }

    if (id) {
      await tx.address.update({
        where: { id, customerId },
        data,
      });
    } else {
      await tx.address.create({
        data: {
          customerId,
          ...data,
        },
      });
    }
  });

  revalidatePath("/account/addresses");
}

export async function deleteCustomerAddress(id: string): Promise<void> {
  const customerId = await requireCustomer();
  await db.address.deleteMany({ where: { id, customerId } });
  revalidatePath("/account/addresses");
}

export async function setDefaultCustomerAddress(id: string): Promise<void> {
  const customerId = await requireCustomer();
  await db.$transaction(async (tx) => {
    await tx.address.updateMany({ where: { customerId }, data: { isDefault: false } });
    await tx.address.update({ where: { id, customerId }, data: { isDefault: true } });
  });
  revalidatePath("/account/addresses");
}

export async function redirectCustomerAccountHome() {
  await requireCustomer();
  redirect("/account");
}