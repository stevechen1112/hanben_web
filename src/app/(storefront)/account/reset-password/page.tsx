import { CustomerResetPasswordForm } from "@/components/storefront/account-auth-forms";

export default async function CustomerResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-[2rem] border border-[#dcc28a]/35 bg-white p-8 text-center shadow-[0_18px_40px_rgba(118,24,24,0.08)]">
          <h1 className="text-3xl font-bold text-[#671515]">重設連結無效</h1>
          <p className="mt-4 text-sm leading-7 text-stone-600">請重新回到忘記密碼頁寄送新的重設信。</p>
        </div>
      </div>
    );
  }

  return <CustomerResetPasswordForm token={token} />;
}