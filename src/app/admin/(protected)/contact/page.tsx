import Link from "next/link";
import { db } from "@/lib/db";

export default async function ContactAdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "unread" } = await searchParams;
  const where =
    tab === "replied"
      ? { repliedAt: { not: null } }
      : tab === "read"
      ? { isRead: true, repliedAt: null }
      : { isRead: false };

  const submissions = await db.contactSubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">聯絡表單</h1>
        <p className="mt-1 text-sm text-stone-500">查看訪客訊息並直接回覆 Email。</p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {[
          { value: "unread", label: "未讀" },
          { value: "read", label: "已讀" },
          { value: "replied", label: "已回覆" },
        ].map((item) => (
          <Link key={item.value} href={`/admin/contact?tab=${item.value}`} className={`rounded-full px-4 py-2 ${tab === item.value ? "bg-stone-900 text-white" : "border border-stone-200 text-stone-600"}`}>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
        {submissions.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-stone-400">目前沒有表單資料</div>
        ) : (
          <>
            <div className="divide-y divide-stone-100 lg:hidden">
              {submissions.map((item) => {
                const status = item.repliedAt ? "已回覆" : item.isRead ? "已讀" : "未讀";

                return (
                  <Link
                    key={item.id}
                    href={`/admin/contact/${item.id}`}
                    className="block px-4 py-4 transition-colors hover:bg-stone-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-800">{item.name}</p>
                        <p className="mt-1 truncate text-xs text-stone-400">{item.email}</p>
                        <p className="mt-1 text-xs text-stone-400">{item.phone || "—"}</p>
                      </div>
                      <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${item.repliedAt ? "bg-green-100 text-green-700" : item.isRead ? "bg-amber-100 text-amber-700" : "bg-stone-900 text-white"}`}>
                        {status}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-stone-400">{new Date(item.createdAt).toLocaleString("zh-TW")}</p>
                  </Link>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">姓名</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">電話</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">狀態</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">日期</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((item) => (
                    <tr key={item.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                      <td className="px-5 py-3 text-xs font-medium text-[#B72020]"><Link href={`/admin/contact/${item.id}`}>{item.name}</Link></td>
                      <td className="px-5 py-3 text-xs text-stone-500">{item.email}</td>
                      <td className="px-5 py-3 text-xs text-stone-500">{item.phone || "—"}</td>
                      <td className="px-5 py-3 text-xs text-stone-500">{item.repliedAt ? "已回覆" : item.isRead ? "已讀" : "未讀"}</td>
                      <td className="px-5 py-3 text-right text-xs text-stone-400">{new Date(item.createdAt).toLocaleString("zh-TW")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}