import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { CollectionForm } from "@/components/admin/collection-form";
import { updateCollection, deleteCollection } from "@/lib/actions/collections";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export const metadata = { title: "編輯集合" };

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [collection, allProductsRaw] = await Promise.all([
    db.collection.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: { sortOrder: "asc" },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: {
                  take: 1,
                  orderBy: { sortOrder: "asc" },
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    }),
    db.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
      },
    }),
  ]);

  if (!collection) notFound();

  const allProducts = allProductsRaw.map((p) => ({
    id: p.id,
    title: p.title,
    imageUrl: p.images[0]?.url,
  }));

  const defaultValues = {
    title: collection.title,
    slug: collection.slug,
    description: collection.description ?? "",
    imageUrl: collection.imageUrl ?? "",
    sortOrder: collection.sortOrder,
    isActive: collection.isActive,
    products: collection.products.map((cp, idx) => ({
      id: cp.id,
      productId: cp.productId,
      title: cp.product.title,
      imageUrl: cp.product.images[0]?.url,
      sortOrder: idx,
    })),
  };

  const boundUpdate = updateCollection.bind(null, id) as (
    prev: { error: string } | { success: true; id: string } | null,
    formData: FormData,
  ) => Promise<{ error: string } | { success: true; id: string }>;

  return (
    <div className="space-y-4">
      {/* 麵包屑 */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <Link
            href="/admin/collections"
            className="flex items-center gap-1.5 hover:text-stone-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            集合列表
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-medium">{collection.title}</span>
        </div>

        {/* 刪除按鈕 */}
        <form
          action={async () => {
            "use server";
            await deleteCollection(id);
          }}
        >
          <ConfirmSubmitButton
            label="刪除集合"
            confirmMessage={`確定要刪除「${collection.title}」嗎？此操作無法復原。`}
            className="w-full sm:w-auto"
          />
        </form>
      </div>

      <CollectionForm
        action={boundUpdate}
        defaultValues={defaultValues}
        allProducts={allProducts}
      />
    </div>
  );
}
