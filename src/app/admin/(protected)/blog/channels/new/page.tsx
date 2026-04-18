import { ChannelForm } from "@/components/admin/channel-form";
import { createChannel } from "@/lib/actions/channels";

export default function NewChannelPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">新增頻道</h1>
      </div>
      <ChannelForm action={createChannel} />
    </div>
  );
}
