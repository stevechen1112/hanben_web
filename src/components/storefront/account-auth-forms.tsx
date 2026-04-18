"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import {
  registerCustomer,
  resetCustomerPassword,
  sendForgotPasswordEmail,
} from "@/lib/actions/account";

function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="storefront-page-narrow max-w-md">
      <div className="mb-8 border-b border-[#ece7de] pb-6 text-center">
        <h1 className="text-[2.2rem] font-semibold tracking-[0.08em] text-[#3f3a37] sm:text-[2.6rem]">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">{description}</p>
      </div>
      <div className="border border-[#e8dfcd] bg-white p-8">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  autoComplete,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  autoComplete?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2 text-sm text-stone-600">
      <span className="font-semibold text-stone-800">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="storefront-input"
      />
    </label>
  );
}

export function CustomerLoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signIn("customer-credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email 或密碼錯誤，請重新輸入。");
        return;
      }

      router.push(callbackUrl || "/account");
      router.refresh();
    });
  }

  return (
    <AuthShell title="會員登入" description="登入後可查看訂單、管理收件地址，並將結帳資訊自動帶入。">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
        <Field label="密碼" type="password" autoComplete="current-password" value={password} onChange={setPassword} />
        {error ? <p className="rounded-2xl bg-[#fff0f0] px-4 py-3 text-sm text-[#a81919]">{error}</p> : null}
        <button type="submit" disabled={isPending || !email || !password} className="storefront-button w-full disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? "登入中…" : "登入會員中心"}
        </button>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm text-stone-500">
        <Link href="/account/register" className="font-semibold text-[#7a1414]">建立新會員</Link>
        <Link href="/account/forgot-password" className="font-semibold text-[#7a1414]">忘記密碼</Link>
      </div>
    </AuthShell>
  );
}

export function CustomerRegisterForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", phone: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await registerCustomer(form);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      setMessage("註冊成功，正在登入會員中心…");
      await signIn("customer-credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });
      router.push(callbackUrl || "/account");
      router.refresh();
    });
  }

  return (
    <AuthShell title="建立會員" description="註冊後可儲存地址、查詢訂單與加速後續結帳流程。">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="姓氏" value={form.lastName} onChange={(value) => updateField("lastName", value)} />
          <Field label="名字" value={form.firstName} onChange={(value) => updateField("firstName", value)} />
        </div>
        <Field label="手機" value={form.phone} autoComplete="tel" onChange={(value) => updateField("phone", value)} />
        <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={(value) => updateField("email", value)} />
        <Field label="密碼" type="password" autoComplete="new-password" value={form.password} onChange={(value) => updateField("password", value)} />
        {error ? <p className="rounded-2xl bg-[#fff0f0] px-4 py-3 text-sm text-[#a81919]">{error}</p> : null}
        {message ? <p className="rounded-2xl bg-[#fff8ef] px-4 py-3 text-sm text-[#7a1414]">{message}</p> : null}
        <button type="submit" disabled={isPending || !form.email || !form.password} className="storefront-button w-full disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? "建立中…" : "建立會員帳號"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-500">
        已經有帳號？ <Link href="/account/login" className="font-semibold text-[#7a1414]">直接登入</Link>
      </p>
    </AuthShell>
  );
}

export function CustomerForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await sendForgotPasswordEmail(email, window.location.origin);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? "若帳號存在，系統已寄出重設密碼信。");
    });
  }

  return (
    <AuthShell title="忘記密碼" description="系統會寄送一封 1 小時內有效的重設連結到您的信箱。">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
        {error ? <p className="rounded-2xl bg-[#fff0f0] px-4 py-3 text-sm text-[#a81919]">{error}</p> : null}
        {message ? <p className="rounded-2xl bg-[#fff8ef] px-4 py-3 text-sm text-[#7a1414]">{message}</p> : null}
        <button type="submit" disabled={isPending || !email} className="storefront-button w-full disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? "送出中…" : "寄送重設信"}
        </button>
      </form>
    </AuthShell>
  );
}

export function CustomerResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await resetCustomerPassword(token, password);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setMessage("密碼已更新，正在導向登入頁…");
      window.setTimeout(() => {
        router.push("/account/login");
      }, 800);
    });
  }

  return (
    <AuthShell title="設定新密碼" description="新密碼至少 8 碼，設定完成後可直接回會員登入頁。">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="新密碼" type="password" autoComplete="new-password" value={password} onChange={setPassword} />
        {error ? <p className="rounded-2xl bg-[#fff0f0] px-4 py-3 text-sm text-[#a81919]">{error}</p> : null}
        {message ? <p className="rounded-2xl bg-[#fff8ef] px-4 py-3 text-sm text-[#7a1414]">{message}</p> : null}
        <button type="submit" disabled={isPending || !password} className="storefront-button w-full disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? "更新中…" : "更新密碼"}
        </button>
      </form>
    </AuthShell>
  );
}