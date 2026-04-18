import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { CollectionForm } from "@/components/admin/collection-form";
import { createCollection } from "@/lib/actions/collections";

export const metadata = { title: "新增集合" };

export default async function NewCollectionPage() {
  const allProducts = await db.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
    },
  });

  const products = allProducts.map((p) => ({
    id: p.id,
    title: p.title,
    imageUrl: p.images[0]?.url,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Link
          href="/admin/collections"
          className="flex items-center gap-1.5 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          集合列表
        </Link>
        <span>/</span>
        <span className="text-stone-800 font-medium">新增集合</span>
      </div>

      <CollectionForm action={createCollection} allProducts={products} />
    </div>
  );
}
