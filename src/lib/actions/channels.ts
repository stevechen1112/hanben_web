"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type ActionResult = { success: true; id: string } | { error: string };

const channelSchema = z.object({
  title: z.string().min(1, "頻道名稱為必填"),
  slug: z
    .string()
    .min(1, "Slug 為必填")
    .regex(/^[a-z0-9-]+$/, "Slug 只能包含小寫英文、數字及連字號"),
  description: z.string().optional(),
});

export async function createChannel(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = channelSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "驗證失敗" };
  }

  const exists = await db.blogChannel.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (exists) return { error: "此 Slug 已被使用" };

  const channel = await db.blogChannel.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/admin/blog/channels");
  redirect(`/admin/blog/channels/${channel.id}`);
}

export async function updateChannel(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = channelSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "驗證失敗" };
  }

  const exists = await db.blogChannel.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (exists) return { error: "此 Slug 已被使用" };

  await db.blogChannel.update({
    where: { id },
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/admin/blog/channels");
  return { success: true, id };
}

export async function deleteChannel(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role === "EDITOR")
    return { error: "權限不足" };

  await db.blogChannel.delete({ where: { id } });
  revalidatePath("/admin/blog/channels");
  redirect("/admin/blog/channels");
}
