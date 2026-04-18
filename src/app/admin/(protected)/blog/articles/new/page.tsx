import { db } from "@/lib/db";
import { ArticleForm } from "@/components/admin/article-form";
import { createArticle } from "@/lib/actions/blog";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewArticlePage() {
  const channels = await db.blogChannel.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Link href="/admin/blog/articles" className="flex items-center gap-1.5 hover:text-stone-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          文章列表
        </Link>
        <span>/</span>
        <span className="text-stone-800 font-medium">新增文章</span>
      </div>
      <ArticleForm mode="create" channels={channels} action={createArticle} />
    </div>
  );
}
