import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/lib/actions/products";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      {/* 麵包屑 */}
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Link href="/admin/products" className="flex items-center gap-1.5 hover:text-stone-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          商品列表
        </Link>
        <span>/</span>
        <span className="text-stone-800 font-medium">新增商品</span>
      </div>

      <ProductForm mode="create" action={createProduct} />
    </div>
  );
}
