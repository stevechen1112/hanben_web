"use server";

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

export async function updateCustomerNote(customerId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const note = String(formData.get("note") || "").trim();
  await db.customer.update({
    where: { id: customerId },
    data: { note: note || null },
  });

  revalidatePath(`/admin/customers/${customerId}`);
}