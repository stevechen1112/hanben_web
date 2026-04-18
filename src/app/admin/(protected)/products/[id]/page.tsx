import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { updateProduct, deleteProduct } from "@/lib/actions/products";
const STATUS_MAP = {
  ACTIVE: { label: "上架中", className: "bg-green-100 text-green-700" },
  DRAFT: { label: "草稿", className: "bg-stone-100 text-stone-600" },
  ARCHIVED: { label: "封存", className: "bg-red-100 text-red-600" },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) notFound();

  const status = STATUS_MAP[product.status as keyof typeof STATUS_MAP];

  const defaultValues = {
    title: product.title,
    slug: product.slug,
    description: product.description ?? "",
    bodyHtml: product.bodyHtml ?? "",
    vendor: product.vendor ?? "",
    productType: product.productType ?? "",
    status: product.status as "ACTIVE" | "DRAFT" | "ARCHIVED",
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    tags: (product.tags as string[]).join(", "),
    variants: product.variants.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku ?? "",
      price: String(v.price),
      compareAtPrice: v.compareAtPrice != null ? String(v.compareAtPrice) : "",
      inventory: String(v.inventory),
      isActive: v.isActive,
    })),
    images: product.images.map((img, idx) => ({
      id: img.id,
      url: img.url,
      altText: img.altText ?? "",
      sortOrder: idx,
      dbId: img.id,
    })),
  };

  const boundUpdate = updateProduct.bind(null, id) as (
    prev: { error: string } | { success: true; id: string } | null,
    formData: FormData,
  ) => Promise<{ error: string } | { success: true; id: string }>;

  return (
    <div className="space-y-4">
      {/* 麵包屑 + 操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 hover:text-stone-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            商品列表
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-medium">{product.title}</span>
          <span
            className={`ml-1 inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${status?.className}`}
          >
            {status?.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            前台預覽
          </Link>
          <DeleteProductButton
            productTitle={product.title}
            action={deleteProduct.bind(null, id) as unknown as (formData: FormData) => void}
          />
        </div>
      </div>

      <ProductForm
        mode="edit"
        productId={id}
        defaultValues={defaultValues}
        action={boundUpdate}
      />
    </div>
  );
}
