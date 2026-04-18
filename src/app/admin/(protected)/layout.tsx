import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminProviders } from "@/components/admin/providers";
import { AdminShell } from "@/components/admin/shell";
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
      <AdminShell>{children}</AdminShell>
    </AdminProviders>
  );
}
