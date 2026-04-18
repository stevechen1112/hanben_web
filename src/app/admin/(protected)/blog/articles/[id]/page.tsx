import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { ArticleForm } from "@/components/admin/article-form";
import { updateArticle, deleteArticle } from "@/lib/actions/blog";
import { parseStorefrontTemplateContent } from "@/lib/storefront-template";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [article, channels] = await Promise.all([
    db.blogArticle.findUnique({ where: { id } }),
    db.blogChannel.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  if (!article) notFound();

  const boundUpdate = updateArticle.bind(null, id) as (
    prev: { error: string } | { success: true; id: string } | null,
    formData: FormData,
  ) => Promise<{ error: string } | { success: true; id: string }>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <Link href="/admin/blog/articles" className="flex items-center gap-1.5 hover:text-stone-700 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            文章列表
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-medium">{article.title}</span>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${article.isPublished ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
            {article.isPublished ? "已發布" : "草稿"}
          </span>
        </div>
        <form action={deleteArticle.bind(null, id) as unknown as (formData: FormData) => void}>
          <ConfirmSubmitButton
            label="刪除文章"
            confirmMessage="確定要刪除此文章？"
            className="w-full sm:w-auto"
          />
        </form>
      </div>

      <ArticleForm
        mode="edit"
        channels={channels}
        action={boundUpdate}
        defaultValues={{
          channelId: article.channelId,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? "",
          bodyHtml: article.bodyHtml,
          featureImage: article.featureImage ?? "",
          author: article.author ?? "",
          tags: (article.tags as string[]).join(", "),
          isPublished: article.isPublished,
          seoTitle: article.seoTitle ?? "",
          seoDescription: article.seoDescription ?? "",
          content: parseStorefrontTemplateContent(article.content),
        }}
      />
    </div>
  );
}
