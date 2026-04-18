import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminProviders } from "@/components/admin/providers";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopBar } from "@/components/admin/top-bar";
import { isAdminRole } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !isAdminRole(session.user?.role)) {
    redirect("/admin/login");
  }

  return (
    <AdminProviders session={session}>
      <div className="flex h-screen bg-stone-50">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminTopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AdminProviders>
  );
}
