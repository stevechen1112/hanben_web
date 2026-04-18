import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { db } from "@/lib/db";
import { ChannelForm } from "@/components/admin/channel-form";
import { deleteChannel, updateChannel } from "@/lib/actions/channels";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">編輯頻道</h1>
          <p className="text-sm text-stone-500 mt-0.5">{channel._count.articles} 篇文章</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href={`/admin/blog?channelId=${id}`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
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
            <ConfirmSubmitButton
              label="刪除頻道"
              confirmMessage={`確定要刪除「${channel.title}」頻道？所有文章也將一併刪除。`}
              className="w-full sm:w-auto"
            />
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
