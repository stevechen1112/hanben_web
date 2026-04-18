import { db } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const settings = await db.siteSetting.findMany({
    orderBy: [{ group: "asc" }, { key: "asc" }],
  });

  // 按 group 分組
  const groups = settings.reduce<Record<string, typeof settings>>(
    (acc, s) => {
      if (!acc[s.group]) acc[s.group] = [];
      acc[s.group].push(s);
      return acc;
    },
    {},
  );

  const GROUP_LABELS: Record<string, string> = {
    general:  "一般設定",
    contact:  "聯絡資訊",
    social:   "社群媒體",
    seo:      "SEO 設定",
    shipping: "運送設定",
  };

  return (
    <div className="max-w-3xl space-y-6">
      <SettingsForm groups={groups} groupLabels={GROUP_LABELS} />
    </div>
  );
}
