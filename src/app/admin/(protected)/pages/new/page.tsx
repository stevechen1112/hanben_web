import { PageForm } from "@/components/admin/page-form";
import { createPage } from "@/lib/actions/pages";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPagePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Link href="/admin/pages" className="flex items-center gap-1.5 hover:text-stone-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          頁面列表
        </Link>
        <span>/</span>
        <span className="text-stone-800 font-medium">新增頁面</span>
      </div>
      <PageForm mode="create" action={createPage} />
    </div>
  );
}
