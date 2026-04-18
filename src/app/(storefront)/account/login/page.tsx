import { CustomerLoginForm } from "@/components/storefront/account-auth-forms";

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <CustomerLoginForm callbackUrl={callbackUrl} />;
}