"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Save, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import {
  createAdminUser,
  deleteAdminUser,
  updateAdminUser,
  type AdminUserActionState,
} from "@/lib/actions/admin-users";
import { cn } from "@/lib/utils";

type AdminRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR";

type AdminUserSummary = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAtLabel: string;
};

type AdminUserManagerProps = {
  admins: AdminUserSummary[];
  currentUserId: string;
};

type RowDraft = {
  name: string;
  role: AdminRole;
  password: string;
};

const roleOptions: { value: AdminRole; label: string }[] = [
  { value: "SUPER_ADMIN", label: "超級管理員" },
  { value: "ADMIN", label: "管理員" },
  { value: "EDITOR", label: "編輯者" },
];

function getRoleBadgeClass(role: AdminRole) {
  if (role === "SUPER_ADMIN") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (role === "ADMIN") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-stone-200 bg-stone-100 text-stone-600";
}

function getStatusTone(result: AdminUserActionState | null) {
  if (!result) return null;
  return "error" in result ? "error" : "success";
}

function buildDrafts(admins: AdminUserSummary[]) {
  return Object.fromEntries(
    admins.map((admin) => [
      admin.id,
      {
        name: admin.name,
        role: admin.role,
        password: "",
      },
    ]),
  ) as Record<string, RowDraft>;
}

export function AdminUserManager({ admins, currentUserId }: AdminUserManagerProps) {
  const router = useRouter();
  const createFormRef = useRef<HTMLFormElement>(null);
  const [createState, createAction, isCreating] = useActionState<
    AdminUserActionState | null,
    FormData
  >(createAdminUser, null);
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>(() => buildDrafts(admins));
  const [rowFeedback, setRowFeedback] = useState<
    Record<string, { type: "success" | "error"; message: string }>
  >({});
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDrafts(buildDrafts(admins));
  }, [admins]);

  useEffect(() => {
    if (createState && "success" in createState) {
      createFormRef.current?.reset();
      router.refresh();
    }
  }, [createState, router]);

  function updateDraft(id: string, patch: Partial<RowDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...patch,
      },
    }));
  }

  function setFeedback(id: string, result: AdminUserActionState) {
    setRowFeedback((prev) => ({
      ...prev,
      [id]: {
        type: "error" in result ? "error" : "success",
        message: "error" in result ? result.error : result.success,
      },
    }));
  }

  function handleSave(id: string) {
    const draft = drafts[id];
    if (!draft) return;

    const formData = new FormData();
    formData.set("name", draft.name);
    formData.set("role", draft.role);
    if (draft.password.trim()) {
      formData.set("password", draft.password.trim());
    }

    startTransition(async () => {
      setPendingRowId(id);
      const result = await updateAdminUser(id, formData);
      setFeedback(id, result);

      if ("success" in result) {
        updateDraft(id, { password: "" });
        router.refresh();
      }

      setPendingRowId(null);
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`確定要刪除管理員 ${name} 嗎？`)) {
      return;
    }

    startTransition(async () => {
      setPendingRowId(id);
      const result = await deleteAdminUser(id);
      setFeedback(id, result);

      if ("success" in result) {
        router.refresh();
      }

      setPendingRowId(null);
    });
  }

  const createTone = getStatusTone(createState);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-800">新增管理員</h2>
            <p className="mt-1 text-sm text-stone-500">
              建議一般同事使用 `ADMIN` 或 `EDITOR`，只在必要時新增 `SUPER_ADMIN`。
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            只有超級管理員可以操作
          </div>
        </div>

        {createState && (
          <p
            className={cn(
              "mt-4 rounded-xl border px-4 py-3 text-sm",
              createTone === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
            )}
          >
            {"error" in createState ? createState.error : createState.success}
          </p>
        )}

        <form
          ref={createFormRef}
          action={createAction}
          className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.1fr_1fr_180px_1fr_auto]"
        >
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-stone-500">Email</span>
            <input
              type="email"
              name="email"
              required
              placeholder="new-admin@hanben.com.tw"
              className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-stone-500"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-stone-500">姓名</span>
            <input
              type="text"
              name="name"
              required
              placeholder="王小明"
              className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-stone-500"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-stone-500">角色</span>
            <select
              name="role"
              defaultValue="ADMIN"
              className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-stone-500"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-stone-500">初始密碼</span>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="至少 8 個字元"
              className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-stone-500"
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B72020] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9f1c1c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {isCreating ? "建立中…" : "新增管理員"}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        <div className="border-b border-stone-100 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-stone-800">現有管理員</h2>
          <p className="mt-1 text-sm text-stone-500">
            可調整姓名、角色與密碼。自己的角色不能在這裡修改，也不能刪除自己。
          </p>
        </div>

        <div className="divide-y divide-stone-100 lg:hidden">
          {admins.map((admin) => {
            const draft = drafts[admin.id];
            const isSelf = admin.id === currentUserId;
            const isRowPending = isPending && pendingRowId === admin.id;
            const feedback = rowFeedback[admin.id];

            return (
              <div key={admin.id} className="space-y-4 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-all text-sm font-medium text-stone-800">{admin.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
                          getRoleBadgeClass(admin.role),
                        )}
                      >
                        {roleOptions.find((option) => option.value === admin.role)?.label}
                      </span>
                      {isSelf && (
                        <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600">
                          目前登入帳號
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-stone-400">{admin.createdAtLabel}</span>
                </div>

                <div className="grid gap-3">
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-stone-500">姓名</span>
                    <input
                      type="text"
                      value={draft?.name ?? ""}
                      onChange={(event) => updateDraft(admin.id, { name: event.target.value })}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-stone-500"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-stone-500">角色</span>
                    <select
                      value={draft?.role ?? admin.role}
                      disabled={isSelf}
                      onChange={(event) =>
                        updateDraft(admin.id, { role: event.target.value as AdminRole })
                      }
                      className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {isSelf && (
                      <p className="text-xs text-stone-400">自己的角色不可在此頁修改</p>
                    )}
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-stone-500">重設密碼</span>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                        type="password"
                        value={draft?.password ?? ""}
                        minLength={8}
                        placeholder="留空代表不變更"
                        onChange={(event) =>
                          updateDraft(admin.id, { password: event.target.value })
                        }
                        className="w-full rounded-xl border border-stone-300 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-stone-500"
                      />
                    </div>
                    <p className="text-xs text-stone-400">若要重設密碼，請輸入至少 8 個字元</p>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isRowPending}
                    onClick={() => handleSave(admin.id)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isRowPending ? "儲存中…" : "儲存"}
                  </button>
                  <button
                    type="button"
                    disabled={isSelf || isRowPending}
                    onClick={() => handleDelete(admin.id, admin.name)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    刪除
                  </button>
                </div>

                {feedback && (
                  <p
                    className={cn(
                      "text-xs",
                      feedback.type === "error" ? "text-red-600" : "text-emerald-600",
                    )}
                  >
                    {feedback.message}
                  </p>
                )}
              </div>
            );
          })}

          {admins.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-stone-400">
              尚未建立任何管理員帳號
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/80">
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">帳號</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">姓名</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">角色</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">重設密碼</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">建立時間</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const draft = drafts[admin.id];
                const isSelf = admin.id === currentUserId;
                const isRowPending = isPending && pendingRowId === admin.id;
                const feedback = rowFeedback[admin.id];

                return (
                  <tr key={admin.id} className="border-b border-stone-100 last:border-0">
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-2">
                        <div className="font-medium text-stone-800">{admin.email}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
                              getRoleBadgeClass(admin.role),
                            )}
                          >
                            {roleOptions.find((option) => option.value === admin.role)?.label}
                          </span>
                          {isSelf && (
                            <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600">
                              目前登入帳號
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <input
                        type="text"
                        value={draft?.name ?? ""}
                        onChange={(event) => updateDraft(admin.id, { name: event.target.value })}
                        className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-stone-500"
                      />
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-2">
                        <select
                          value={draft?.role ?? admin.role}
                          disabled={isSelf}
                          onChange={(event) =>
                            updateDraft(admin.id, { role: event.target.value as AdminRole })
                          }
                          className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
                        >
                          {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {isSelf && (
                          <p className="text-xs text-stone-400">自己的角色不可在此頁修改</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-2">
                        <div className="relative">
                          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                          <input
                            type="password"
                            value={draft?.password ?? ""}
                            minLength={8}
                            placeholder="留空代表不變更"
                            onChange={(event) =>
                              updateDraft(admin.id, { password: event.target.value })
                            }
                            className="w-full rounded-xl border border-stone-300 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-stone-500"
                          />
                        </div>
                        <p className="text-xs text-stone-400">若要重設密碼，請輸入至少 8 個字元</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top text-sm text-stone-500">{admin.createdAtLabel}</td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={isRowPending}
                          onClick={() => handleSave(admin.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {isRowPending ? "儲存中…" : "儲存"}
                        </button>
                        <button
                          type="button"
                          disabled={isSelf || isRowPending}
                          onClick={() => handleDelete(admin.id, admin.name)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          刪除
                        </button>
                      </div>
                      {feedback && (
                        <p
                          className={cn(
                            "mt-2 text-right text-xs",
                            feedback.type === "error" ? "text-red-600" : "text-emerald-600",
                          )}
                        >
                          {feedback.message}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}

              {admins.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-stone-400">
                    尚未建立任何管理員帳號
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}