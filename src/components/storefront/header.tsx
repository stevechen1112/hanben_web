"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { getManagedLegacyOfficialUrl } from "@/lib/legacy-official-media";
import type { StorefrontNavItem } from "@/lib/storefront";

const HEADER_LOGO_URL = getManagedLegacyOfficialUrl("/official/shared/header-logo.png");

function HeaderNavLink({ item }: { item: StorefrontNavItem }) {
  const className = "text-[0.94rem] font-medium text-white transition hover:text-[#f2d789]";

  if (item.isExternal) {
    return <a href={item.url} target="_blank" rel="noreferrer" className={className}>{item.title}</a>;
  }

  return <Link href={item.url} className={className}>{item.title}</Link>;
}

function MobileNavLink({ item }: { item: StorefrontNavItem }) {
  const className = "text-base font-medium text-stone-700 transition hover:text-[#8f1212]";

  if (item.isExternal) {
    return <a href={item.url} target="_blank" rel="noreferrer" className={className}>{item.title}</a>;
  }

  return <Link href={item.url} className={className}>{item.title}</Link>;
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

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-[#c79a43] bg-[#bc2020] text-white">
      <div className="mx-auto flex max-w-[1460px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={siteName} className="flex min-w-0 items-center gap-3">
          <img src={logoUrl || HEADER_LOGO_URL} alt={siteName} className="h-7 w-auto sm:h-9" />
          <div className="sr-only">
            <div>{siteName}</div>
            <div>{siteTagline}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
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

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/search" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-[#f2d789] hover:text-[#f2d789]" aria-label="搜尋">
            <Search className="h-4 w-4" />
          </Link>
          <Link href="/account" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-[#f2d789] hover:text-[#f2d789]" aria-label="會員中心">
            <User className="h-4 w-4" />
          </Link>
          <Link href="/cart" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-[#f2d789] hover:text-[#f2d789]" aria-label="購物車">
            <ShoppingBag className="h-4 w-4" />
          </Link>
        </div>

        <details className="group relative xl:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-white">
            <Menu className="h-5 w-5" />
            選單
          </summary>
          <div className="absolute right-0 top-full mt-3 w-[min(24rem,calc(100vw-2rem))] border border-[#ded6c9] bg-white p-5 text-stone-800 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
            <nav className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="border-b border-[#efe8d7] pb-3 last:border-0 last:pb-0">
                  <MobileNavLink item={item} />
                </div>
              ))}
              <div className="flex gap-3 pt-2 text-stone-700">
                <Link href="/search" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e7dfd2]" aria-label="搜尋"><Search className="h-4 w-4" /></Link>
                <Link href="/account" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e7dfd2]" aria-label="會員中心"><User className="h-4 w-4" /></Link>
                <Link href="/cart" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e7dfd2]" aria-label="購物車"><ShoppingBag className="h-4 w-4" /></Link>
              </div>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
