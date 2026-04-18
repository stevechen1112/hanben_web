import { CustomerRegisterForm } from "@/components/storefront/account-auth-forms";

export default async function CustomerRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <CustomerRegisterForm callbackUrl={callbackUrl} />;
}