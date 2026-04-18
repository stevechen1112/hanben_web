import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { db } from "@/lib/db";
import { ChannelForm } from "@/components/admin/channel-form";
import { deleteChannel, updateChannel } from "@/lib/actions/channels";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditChannelPage({ params }: Props) {
  const { id } = await params;
  const channel = await db.blogChannel.findUnique({
    where: { id },
    include: { _count: { select: { articles: true } } },
  });
  if (!channel) notFound();

  const boundUpdate = updateChannel.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">編輯頻道</h1>
          <p className="text-sm text-stone-500 mt-0.5">{channel._count.articles} 篇文章</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/blog?channelId=${id}`}
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            查看文章
          </Link>

          <form
            action={async () => {
              "use server";
              await deleteChannel(id);
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              onClick={(e) => {
                if (!confirm(`確定要刪除「${channel.title}」頻道？所有文章也將一併刪除。`))
                  e.preventDefault();
              }}
            >
              刪除頻道
            </button>
          </form>
        </div>
      </div>

      <ChannelForm
        action={boundUpdate}
        defaultValues={{
          title: channel.title,
          slug: channel.slug,
          description: channel.description ?? "",
        }}
      />
    </div>
  );
}
