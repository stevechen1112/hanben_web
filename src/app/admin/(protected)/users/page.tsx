import { redirect } from "next/navigation";
import { AdminUserManager } from "@/components/admin/admin-user-manager";
import { auth, isSuperAdminRole } from "@/lib/auth";
import { db } from "@/lib/db";

const roleRank = {
  SUPER_ADMIN: 0,
  ADMIN: 1,
  EDITOR: 2,
} as const;

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user || !isSuperAdminRole(session.user.role)) {
    redirect("/admin/dashboard");
  }

  const admins = await db.adminUser.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  const mappedAdmins = [...admins]
    .sort((left, right) => {
      const roleOrder = roleRank[left.role] - roleRank[right.role];
      if (roleOrder !== 0) return roleOrder;
      return left.createdAt.getTime() - right.createdAt.getTime();
    })
    .map((admin) => ({
      ...admin,
      createdAtLabel: admin.createdAt.toLocaleString("zh-TW"),
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">管理員權限</h1>
        <p className="mt-1 text-sm text-stone-500">
          管理後台帳號與角色分級，建議只讓可信任人員擁有後台存取權。
        </p>
      </div>

      <AdminUserManager admins={mappedAdmins} currentUserId={session.user.id} />
    </div>
  );
}