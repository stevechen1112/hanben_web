import Link from "next/link";
import type { StorefrontNavItem } from "@/lib/storefront";

function PolicyLink({ item, label }: { item: StorefrontNavItem | null; label: string }) {
  if (!item) {
    return <span className="text-sm text-stone-400">{label}</span>;
  }

  if (item.isExternal) {
    return (
      <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-stone-500 transition hover:text-[#8f1212]">
        {label}
      </a>
    );
  }

  return (
    <Link href={item.url} className="text-sm text-stone-500 transition hover:text-[#8f1212]">
      {label}
    </Link>
  );
}

export function StorefrontFooter({
  siteName,
  phone,
  address,
  serviceHours,
  brandStatement,
  brandSummary,
  items,
}: {
  siteName: string;
  phone: string;
  address: string;
  serviceHours: string;
  brandStatement: string;
  brandSummary: string;
  items: StorefrontNavItem[];
}) {
  const policyItems = items.filter((item) => item.url.includes("privacy") || item.url.includes("return-policy") || item.url.includes("terms") || item.url.includes("contact"));
  const policyItem = policyItems[0] ?? items[0] ?? null;

  return (
    <>
      <footer className="mt-16 text-stone-900">
        <div className="bg-[linear-gradient(165deg,#bf953f_0%,#fcf6ba_25%,#aa771c_100%)]">
          <div className="mx-auto max-w-[1200px] px-4 py-7 text-left sm:px-6 lg:px-8">
            <p className="text-[1.25rem] font-medium leading-8 text-[rgba(32,32,32,0.81)]">{brandStatement}</p>
            <p className="mt-1 text-[0.875rem] leading-[1.4] text-[rgba(32,32,32,0.81)]">{brandSummary}</p>
            <p className="mt-1 text-[0.875rem] leading-[1.4] text-[rgba(32,32,32,0.81)]">
              服務專線 : {phone}
              <br />
              服務時間 : {serviceHours}
            </p>
          </div>
        </div>
      </footer>

      <div className="border-b border-[#efebe4] px-4 py-2 text-center text-[0.75rem] text-stone-600">
        公司註冊地址：{address}
      </div>

      <div className="border-b border-[#efebe4] bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-8 text-[0.75rem] text-stone-500 sm:px-6 lg:px-8">
          <p>
            © 2026 <Link href="/" className="transition hover:text-[#8f1212]">{siteName}</Link>, 由 Shopify 技術支援
          </p>
          <div className="flex items-center justify-center lg:justify-center">
            {policyItems.length > 0 ? (
              <details className="group relative">
                <summary className="cursor-pointer list-none text-sm text-stone-500 transition hover:text-[#8f1212]">條款及政策</summary>
                <div className="absolute left-1/2 top-full z-20 mt-3 min-w-40 -translate-x-1/2 border border-[#ebe3d8] bg-white p-4 text-left shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
                  <ul className="grid gap-3">
                    {policyItems.map((item) => (
                      <li key={item.id}>
                        <PolicyLink item={item} label={item.title} />
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ) : (
              <PolicyLink item={policyItem} label="條款及政策" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
