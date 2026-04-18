import { CheckoutForm } from "@/components/storefront/checkout-form";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listActiveShippingOptions } from "@/lib/shipping";

export default async function CheckoutPage() {
  const session = await auth();
  const shippingOptions = await listActiveShippingOptions();
  const customer = session?.user?.role === "CUSTOMER"
    ? await db.customer.findUnique({
        where: { id: session.user.id },
        include: {
          addresses: {
            where: { isDefault: true },
            take: 1,
          },
        },
      })
    : null;

  const defaultAddress = customer?.addresses[0] ?? null;

  return (
    <CheckoutForm
      shippingOptions={shippingOptions}
      defaults={{
        email: customer?.email ?? "",
        phone: customer?.phone ?? "",
        shippingName: [customer?.lastName, customer?.firstName].filter(Boolean).join("") || defaultAddress?.recipientName || "",
        shippingPhone: defaultAddress?.phone ?? customer?.phone ?? "",
        shippingZip: defaultAddress?.zipCode ?? "",
        shippingCity: defaultAddress?.city ?? "",
        shippingDistrict: defaultAddress?.district ?? "",
        shippingAddress: defaultAddress?.addressLine ?? "",
      }}
    />
  );
}