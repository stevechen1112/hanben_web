import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { parseAboutPageContent } from "@/lib/about-page-content";
import { DeletePageButton } from "@/components/admin/delete-page-button";
import { db } from "@/lib/db";
import { PageForm } from "@/components/admin/page-form";
import { updatePage, deletePage } from "@/lib/actions/pages";
import { extractAdditionalStorefrontContent, parseStorefrontTemplateContent } from "@/lib/storefront-template";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await db.page.findUnique({ where: { id } });
  if (!page) notFound();

  const boundUpdate = updatePage.bind(null, id) as (
    prev: { error: string } | { success: true; id: string } | null,
    formData: FormData,
  ) => Promise<{ error: string } | { success: true; id: string }>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <Link href="/admin/pages" className="flex items-center gap-1.5 hover:text-stone-700 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            頁面列表
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-medium">{page.title}</span>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${page.isPublished ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
            {page.isPublished ? "已發布" : "草稿"}
          </span>
        </div>
        <form action={deletePage.bind(null, id) as unknown as (formData: FormData) => void} className="w-full sm:w-auto">
          <DeletePageButton />
        </form>
      </div>
      <PageForm
        mode="edit"
        action={boundUpdate}
        defaultValues={{
          title: page.title,
          slug: page.slug,
          bodyHtml: page.bodyHtml,
          isPublished: page.isPublished,
          template: page.template,
          seoTitle: page.seoTitle ?? "",
          seoDescription: page.seoDescription ?? "",
          content: parseStorefrontTemplateContent(page.content),
          aboutContent: parseAboutPageContent(page.content),
          customContentJson: JSON.stringify(extractAdditionalStorefrontContent(page.content, ["about"]), null, 2),
        }}
      />
    </div>
  );
}
