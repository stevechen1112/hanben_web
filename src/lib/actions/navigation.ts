"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type ActionResult = { success: true } | { error: string };

const itemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  url: z.string().min(1),
  isExternal: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  parentId: z.string().nullable().optional(),
});

const saveMenuSchema = z.object({
  location: z.string().min(1),
  items: z.array(itemSchema),
});

// ── 儲存整份選單（先清空再寫入）──────────────────────────
export async function saveNavigationMenu(
  location: string,
  items: {
    id?: string;
    title: string;
    url: string;
    isExternal: boolean;
    sortOrder: number;
    parentId?: string | null;
  }[],
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "未授權" };

  const parsed = saveMenuSchema.safeParse({ location, items });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "驗證失敗" };
  }

  // 取得或建立 NavigationMenu
  let menu = await db.navigationMenu.findUnique({ where: { location } });
  if (!menu) {
    menu = await db.navigationMenu.create({ data: { location } });
  }

  // 清空舊項目再寫入（cascade 已設好）
  await db.navigationItem.deleteMany({ where: { menuId: menu.id } });

  // 先建立頂層（parentId = null）
  const topLevel = parsed.data.items.filter((i) => !i.parentId);
  const idMap = new Map<string, string>(); // tempId → dbId

  for (const item of topLevel) {
    const created = await db.navigationItem.create({
      data: {
        menuId: menu.id,
        title: item.title,
        url: item.url,
        isExternal: item.isExternal,
        sortOrder: item.sortOrder,
        parentId: null,
      },
    });
    if (item.id) idMap.set(item.id, created.id);
  }

  // 再建立子層
  const subLevel = parsed.data.items.filter((i) => i.parentId);
  for (const item of subLevel) {
    const realParentId = item.parentId ? (idMap.get(item.parentId) ?? null) : null;
    await db.navigationItem.create({
      data: {
        menuId: menu.id,
        title: item.title,
        url: item.url,
        isExternal: item.isExternal,
        sortOrder: item.sortOrder,
        parentId: realParentId,
      },
    });
  }

  revalidatePath("/admin/site-settings/navigation");
  revalidatePath("/");
  return { success: true };
}
