"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth, isSuperAdminRole } from "@/lib/auth";
import { db } from "@/lib/db";

export type AdminUserActionState = { error: string } | { success: string };

const adminRoleSchema = z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]);

const createAdminUserSchema = z.object({
  email: z.string().trim().email("Email 格式不正確"),
  name: z.string().trim().min(1, "姓名必填"),
  role: adminRoleSchema,
  password: z.string().min(8, "密碼至少需要 8 個字元"),
});

const updateAdminUserSchema = z.object({
  name: z.string().trim().min(1, "姓名必填"),
  role: adminRoleSchema,
  password: z.string().min(8, "密碼至少需要 8 個字元").optional(),
});

async function requireSuperAdmin() {
  const session = await auth();

  if (!session?.user || !isSuperAdminRole(session.user.role)) {
    return null;
  }

  return session;
}

function getFirstIssueMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "驗證失敗";
}

async function ensureSuperAdminRemains(adminId: string) {
  const existing = await db.adminUser.findUnique({
    where: { id: adminId },
    select: { role: true },
  });

  if (!existing || existing.role !== "SUPER_ADMIN") {
    return true;
  }

  const superAdminCount = await db.adminUser.count({
    where: { role: "SUPER_ADMIN" },
  });

  return superAdminCount > 1;
}

export async function createAdminUser(
  _prev: AdminUserActionState | null,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await requireSuperAdmin();
  if (!session) return { error: "權限不足" };

  const parsed = createAdminUserSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: getFirstIssueMessage(parsed.error) };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) {
    return { error: "這個 Email 已經有管理員帳號" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await db.adminUser.create({
    data: {
      email,
      name: parsed.data.name,
      role: parsed.data.role,
      passwordHash,
    },
  });

  revalidatePath("/admin/users");
  return { success: `已新增管理員 ${parsed.data.name}` };
}

export async function updateAdminUser(
  id: string,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await requireSuperAdmin();
  if (!session) return { error: "權限不足" };

  const passwordValue = formData.get("password");
  const parsed = updateAdminUserSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    password:
      typeof passwordValue === "string" && passwordValue.trim().length > 0
        ? passwordValue.trim()
        : undefined,
  });

  if (!parsed.success) {
    return { error: getFirstIssueMessage(parsed.error) };
  }

  const existing = await db.adminUser.findUnique({
    where: { id },
    select: { id: true, role: true, name: true },
  });

  if (!existing) {
    return { error: "找不到這個管理員帳號" };
  }

  if (existing.id === session.user.id && parsed.data.role !== existing.role) {
    return { error: "不能修改自己的角色" };
  }

  if (
    existing.role === "SUPER_ADMIN" &&
    parsed.data.role !== "SUPER_ADMIN" &&
    !(await ensureSuperAdminRemains(id))
  ) {
    return { error: "至少需要保留一位超級管理員" };
  }

  await db.adminUser.update({
    where: { id },
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      ...(parsed.data.password
        ? { passwordHash: await bcrypt.hash(parsed.data.password, 12) }
        : {}),
    },
  });

  revalidatePath("/admin/users");
  return {
    success: parsed.data.password
      ? `已更新 ${parsed.data.name} 並重設密碼`
      : `已更新 ${parsed.data.name}`,
  };
}

export async function deleteAdminUser(id: string): Promise<AdminUserActionState> {
  const session = await requireSuperAdmin();
  if (!session) return { error: "權限不足" };

  if (id === session.user.id) {
    return { error: "不能刪除自己的帳號" };
  }

  const existing = await db.adminUser.findUnique({
    where: { id },
    select: { id: true, name: true, role: true },
  });

  if (!existing) {
    return { error: "找不到這個管理員帳號" };
  }

  if (existing.role === "SUPER_ADMIN" && !(await ensureSuperAdminRemains(id))) {
    return { error: "至少需要保留一位超級管理員" };
  }

  await db.adminUser.delete({ where: { id } });

  revalidatePath("/admin/users");
  return { success: `已刪除 ${existing.name}` };
}