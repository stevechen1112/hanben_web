"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, LogOut, User, ExternalLink, ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

// 路徑 → 標題對應
const routeTitles: Record<string, string> = {
  "/admin/dashboard": "儀表板",
  "/admin/orders": "訂單管理",
  "/admin/products": "商品管理",
  "/admin/products/new": "新增商品",
  "/admin/collections": "商品集合",
  "/admin/customers": "客戶管理",
  "/admin/content/pages": "靜態頁面",
  "/admin/content/faq": "常見問題",
  "/admin/blog/articles": "部落格文章",
  "/admin/blog/channels": "部落格分類",
  "/admin/promotions": "促銷活動",
  "/admin/shipping": "物流設定",
  "/admin/media": "媒體庫",
  "/admin/contact": "聯絡表單",
  "/admin/site-settings/general": "一般設定",
  "/admin/site-settings/navigation": "導覽選單",
  "/admin/site-settings/homepage": "首頁區塊",
  "/admin/site-settings/announcement": "公告列",
  "/admin/users": "管理員權限",
};

function getPageTitle(pathname: string) {
  if (routeTitles[pathname]) return routeTitles[pathname];
  // 編輯頁：/admin/products/[id]
  if (/^\/admin\/products\/[^/]+$/.test(pathname)) return "編輯商品";
  if (/^\/admin\/orders\/[^/]+$/.test(pathname)) return "訂單詳情";
  if (/^\/admin\/customers\/[^/]+$/.test(pathname)) return "客戶詳情";
  return "後台管理";
}

export function AdminTopBar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const title = getPageTitle(pathname);
  const name = session?.user?.name ?? "管理員";
  const email = session?.user?.email ?? "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b border-stone-200 bg-white px-3 sm:px-4 lg:px-6">
      {/* 頁面標題 */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 lg:hidden"
          aria-label="開啟導覽"
        >
          <Menu className="h-4 w-4" />
        </button>
        <h1 className="truncate text-sm font-semibold text-stone-800 sm:text-[15px]">{title}</h1>
      </div>

      {/* 右側操作區 */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* 前台預覽 */}
        <Link
          href="/"
          target="_blank"
          className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors sm:flex"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          前台預覽
        </Link>

        <Link
          href="/"
          target="_blank"
          className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 sm:hidden"
          aria-label="前台預覽"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>

        {/* 通知 */}
        <button className="relative rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        {/* 用戶選單 */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-stone-100 transition-colors sm:px-2"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#B72020] text-xs font-semibold text-white">
              {initial}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-medium text-stone-800 leading-none">
                {name}
              </p>
              <p className="mt-0.5 text-[0.7rem] text-stone-400 leading-none">
                {session?.user?.role === "SUPER_ADMIN"
                  ? "超級管理員"
                  : session?.user?.role === "ADMIN"
                    ? "管理員"
                    : "編輯者"}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-stone-400 transition-transform",
                open && "rotate-180",
              )}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-stone-200 bg-white py-1.5 shadow-lg">
              <div className="border-b border-stone-100 px-3.5 py-2.5">
                <p className="text-sm font-medium text-stone-800">{name}</p>
                <p className="text-xs text-stone-400 mt-0.5">{email}</p>
              </div>
              <div className="px-1.5 py-1">
                <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-stone-600 hover:bg-stone-100 transition-colors">
                  <User className="h-4 w-4" />
                  帳號設定
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  登出
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
