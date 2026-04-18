"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, ShoppingCart, User, X } from "lucide-react";
import { getManagedLegacyOfficialUrl } from "@/lib/legacy-official-media";
import type { StorefrontNavItem } from "@/lib/storefront";
import { useCartStore } from "@/lib/cart-store";

const HEADER_LOGO_URL = getManagedLegacyOfficialUrl("/official/shared/header-logo.png");

function HeaderNavLink({ item }: { item: StorefrontNavItem }) {
  const className = "text-[0.94rem] font-medium text-white transition hover:text-[#f2d789]";

  if (item.isExternal) {
    return <a href={item.url} target="_blank" rel="noreferrer" className={className}>{item.title}</a>;
  }

  return <Link href={item.url} className={className}>{item.title}</Link>;
}

function MobileNavLink({ item }: { item: StorefrontNavItem }) {
  const className = "text-[1.125rem] font-semibold tracking-[0.01em] text-stone-800 transition hover:text-[#8f1212]";

  if (item.isExternal) {
    return <a href={item.url} target="_blank" rel="noreferrer" className={className}>{item.title}</a>;
  }

  return <Link href={item.url} className={className}>{item.title}</Link>;
}

function HeaderActionLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex h-10 w-10 items-center justify-center text-white transition hover:text-[#f2d789]" aria-label={label}>
      {children}
    </Link>
  );
}

export function StorefrontHeader({
  siteName,
  siteTagline,
  logoUrl,
  items,
}: {
  siteName: string;
  siteTagline: string;
  logoUrl?: string;
  items: StorefrontNavItem[];
}) {
  const primaryItems = items.slice(0, 8);
  const overflowItems = items.slice(8);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const cartQty = useCartStore((state) => state.cart.totalQuantity);
  const cartIconClass = cartQty > 0 ? "h-5 w-5 cart-has-items" : "h-5 w-5";

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", drawerOpen);

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [drawerOpen]);

  return (
    <>
      <header className="border-b border-[#d8b66d] bg-[#b72020] text-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <div className="hidden h-[66px] items-center justify-between gap-8 lg:flex">
            <Link href="/" aria-label={siteName} className="flex min-w-0 items-center gap-3">
              <img src={logoUrl || HEADER_LOGO_URL} alt={siteName} className="h-9 w-auto" />
              <div className="sr-only">
                <div>{siteName}</div>
                <div>{siteTagline}</div>
              </div>
            </Link>

            <div className="flex min-w-0 items-center gap-6 xl:gap-8">
              <nav className="flex items-center gap-5 xl:gap-6">
                {primaryItems.map((item) => (
                  <HeaderNavLink key={item.id} item={item} />
                ))}
                {overflowItems.length > 0 ? (
                  <details className="group relative">
                    <summary className="cursor-pointer list-none text-[0.94rem] font-medium text-white transition hover:text-[#f2d789]">更多</summary>
                    <div className="absolute right-0 top-full mt-3 min-w-44 border border-[#e7e0d4] bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
                      <div className="grid gap-3">
                        {overflowItems.map((item) => (
                          <MobileNavLink key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  </details>
                ) : null}
              </nav>

              <div className="flex items-center gap-1">
                <HeaderActionLink href="/account" label="會員中心">
                  <User className="h-4 w-4" />
                </HeaderActionLink>
                <Link href="/cart" className="relative flex h-10 w-10 items-center justify-center text-white transition hover:text-[#f2d789]" aria-label="購物車">
                  <ShoppingCart className={cartIconClass} />
                  {cartQty > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#f2dc8d] px-[3px] text-[10px] font-bold leading-none text-[#7a1414]">
                      {cartQty > 99 ? "99+" : cartQty}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>

          <div className="grid h-[64px] grid-cols-[auto_1fr_auto] items-center gap-3 lg:hidden">
            <button type="button" onClick={() => setDrawerOpen(true)} className="flex h-10 w-10 items-center justify-center text-white" aria-label="開啟選單">
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" aria-label={siteName} className="flex min-w-0 justify-center">
              <img src={logoUrl || HEADER_LOGO_URL} alt={siteName} className="h-7 w-auto" />
            </Link>

            <div className="flex items-center justify-end gap-0.5">
              <Link href="/cart" className="relative flex h-10 w-10 items-center justify-center text-white transition hover:text-[#f2d789]" aria-label="購物車">
                <ShoppingCart className={cartIconClass} />
                {cartQty > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#f2dc8d] px-[3px] text-[10px] font-bold leading-none text-[#7a1414]">
                    {cartQty > 99 ? "99+" : cartQty}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-50 bg-black/35 transition ${drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      <aside className={`fixed inset-y-0 left-0 z-[60] w-[min(22rem,88vw)] bg-white text-stone-900 shadow-[0_24px_60px_rgba(0,0,0,0.2)] transition-transform duration-300 lg:hidden ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!drawerOpen}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[#efe8d7] px-5 py-5">
            <img src={logoUrl || HEADER_LOGO_URL} alt={siteName} className="h-7 w-auto" />
            <button type="button" onClick={() => setDrawerOpen(false)} className="flex h-10 w-10 items-center justify-center text-stone-700" aria-label="關閉選單">
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6">
            <div className="flex flex-col gap-5">
              {items.map((item) => (
                <div key={item.id} className="border-b border-[#efe8d7] pb-4">
                  <div onClick={() => setDrawerOpen(false)}>
                    <MobileNavLink item={item} />
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className="border-t border-[#efe8d7] px-5 py-5">
            <div className="flex items-center gap-3 text-stone-700">
              <Link href="/account" onClick={() => setDrawerOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e7dfd2]" aria-label="會員中心">
                <User className="h-4 w-4" />
              </Link>
              <Link href="/cart" onClick={() => setDrawerOpen(false)} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#e7dfd2]" aria-label="購物車">
                <ShoppingCart className={cartIconClass} />
                {cartQty > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#b72020] px-[3px] text-[10px] font-bold leading-none text-white">
                    {cartQty > 99 ? "99+" : cartQty}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
