"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("admin-credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email 或密碼錯誤，請重新輸入。");
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f1ee]">
      <div className="w-full max-w-sm">
        {/* Logo / 品牌 */}
        <div className="mb-10 text-center">
          <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#B72020]">
            <span className="text-xl font-bold text-white">漢</span>
          </div>
          <h1 className="text-foreground mt-3 text-2xl font-semibold tracking-tight">
            漢本三代後台
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            請登入管理員帳號繼續
          </p>
        </div>

        {/* 登入表單 */}
        <div className="rounded-2xl border border-stone-200 bg-white px-8 py-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-foreground block text-sm font-medium"
              >
                電子郵件
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className={cn(
                  "border-input bg-background placeholder:text-muted-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all",
                  "focus:border-[#B72020] focus:ring-2 focus:ring-[#B72020]/20",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-foreground block text-sm font-medium"
              >
                密碼
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "border-input bg-background placeholder:text-muted-foreground w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all",
                  "focus:border-[#B72020] focus:ring-2 focus:ring-[#B72020]/20",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className={cn(
                "w-full rounded-lg bg-[#B72020] px-4 py-2.5 text-sm font-semibold text-white transition-all",
                "hover:bg-[#9e1c1c] active:scale-[0.98]",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B72020]/40 focus-visible:ring-offset-2",
              )}
            >
              {loading ? "登入中…" : "登入"}
            </button>
          </form>
        </div>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          © {new Date().getFullYear()} 漢本三代。僅供授權人員使用。
        </p>
      </div>
    </div>
  );
}
