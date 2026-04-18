"use client";

import { useState, useTransition } from "react";

type ContactState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export function ContactForm() {
  const [form, setForm] = useState<ContactState>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<Key extends keyof ContactState>(key: Key, value: ContactState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, website: "" }),
        });
        const payload = await response.json();

        if (!response.ok) {
          setError(payload.message ?? "送出失敗，請稍後再試。");
          return;
        }

        setMessage(payload.message ?? "訊息已送出，我們會盡快回覆您。");
        setForm({ name: "", email: "", phone: "", message: "" });
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "送出失敗，請稍後再試。");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[620px] space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-[#3f3f3f]">
          <span className="block">名稱</span>
          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="" className="storefront-input" />
        </label>
        <label className="space-y-2 text-sm text-[#3f3f3f]">
          <span className="block">電子郵件*</span>
          <input value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="" className="storefront-input" />
        </label>
      </div>
      <label className="space-y-2 text-sm text-[#3f3f3f]">
        <span className="block">電話</span>
        <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="" className="storefront-input" />
      </label>
      <label className="space-y-2 text-sm text-[#3f3f3f]">
        <span className="block">留言</span>
        <textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} placeholder="" className="storefront-input min-h-72 resize-y" />
      </label>

      {error ? <p className="bg-[#fff2f2] px-4 py-3 text-sm text-[#a61f1f]">{error}</p> : null}
      {message ? <p className="bg-[#faf2df] px-4 py-3 text-sm text-[#6a5847]">{message}</p> : null}

      <button type="submit" disabled={isPending || !form.name || !form.email || !form.message} className="storefront-button disabled:cursor-not-allowed disabled:opacity-50">
        {isPending ? "送出中..." : "Submit"}
      </button>
    </form>
  );
}