"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Newspaper,
  Tag,
  Truck,
  Image as ImageIcon,
  Mail,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

type NavItem = {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { title: string; href: string }[];
};

const navItems: NavItem[] = [
  { title: "儀表板", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "訂單管理", href: "/admin/orders", icon: ShoppingCart },
  {
    title: "商品管理",
    icon: Package,
    children: [
      { title: "商品列表", href: "/admin/products" },
      { title: "商品集合", href: "/admin/collections" },
    ],
  },
  { title: "客戶管理", href: "/admin/customers", icon: Users },
  {
    title: "內容管理",
    icon: FileText,
    children: [
      { title: "靜態頁面", href: "/admin/content/pages" },
      { title: "常見問題", href: "/admin/content/faq" },
    ],
  },
  {
    title: "部落格",
    icon: Newspaper,
    children: [
      { title: "文章列表", href: "/admin/blog/articles" },
      { title: "分類管理", href: "/admin/blog/channels" },
    ],
  },
  { title: "促銷活動", href: "/admin/promotions", icon: Tag },
  { title: "物流設定", href: "/admin/shipping", icon: Truck },
  { title: "媒體庫", href: "/admin/media", icon: ImageIcon },
  { title: "聯絡表單", href: "/admin/contact", icon: Mail },
  {
    title: "網站設定",
    icon: Settings,
    children: [
      { title: "一般設定", href: "/admin/site-settings/general" },
      { title: "導覽選單", href: "/admin/site-settings/navigation" },
      { title: "首頁區塊", href: "/admin/site-settings/homepage" },
      { title: "公告列", href: "/admin/site-settings/announcement" },
      { title: "管理員權限", href: "/admin/users" },
    ],
  },
];

type AdminSidebarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export function AdminSidebar({ mobile = false, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(["商品管理"]);

  useEffect(() => {
    const activeGroup = navItems
      .filter((item) => item.children?.some((child) => isActive(child.href)))
      .map((item) => item.title);

    setOpenGroups((prev) => Array.from(new Set([...prev, ...activeGroup])));
  }, [pathname]);

  function toggleGroup(title: string) {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function isGroupActive(item: NavItem) {
    return item.children?.some((c) => isActive(c.href)) ?? false;
  }

  const isCollapsed = mobile ? false : collapsed;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-stone-200 bg-white transition-all duration-200",
        mobile ? "w-full shadow-2xl" : isCollapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo 區 */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-stone-200 px-4",
          isCollapsed ? "justify-center" : "justify-between",
        )}
      >
        {!isCollapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#B72020]">
              <span className="text-xs font-bold text-white">漢</span>
            </div>
            <span className="text-sm font-semibold text-stone-800">
              漢本三代
            </span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/admin/dashboard">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#B72020]">
              <span className="text-xs font-bold text-white">漢</span>
            </div>
          </Link>
        )}
        {mobile ? (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-md p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors",
              isCollapsed && "mx-auto",
            )}
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;

            // 有子項目的群組
            if (item.children) {
              const isOpen = openGroups.includes(item.title);
              const groupActive = isGroupActive(item);

              return (
                <li key={item.title}>
                  <button
                    onClick={() => !collapsed && toggleGroup(item.title)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                      groupActive
                        ? "bg-[#B72020]/8 text-[#B72020] font-medium"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-800",
                      isCollapsed && "justify-center",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        groupActive ? "text-[#B72020]" : "text-stone-500",
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        {isOpen ? (
                          <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                        )}
                      </>
                    )}
                  </button>

                  {/* Sub-items */}
                  {!isCollapsed && isOpen && (
                    <ul className="mt-0.5 ml-4 space-y-0.5 border-l border-stone-100 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={onNavigate}
                            className={cn(
                              "block rounded-md px-2.5 py-1.5 text-[0.8125rem] transition-colors",
                              isActive(child.href)
                                ? "bg-[#B72020]/8 text-[#B72020] font-medium"
                                : "text-stone-500 hover:bg-stone-100 hover:text-stone-700",
                            )}
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            // 單一連結
            const active = isActive(item.href!);
            return (
              <li key={item.href}>
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-[#B72020]/8 text-[#B72020] font-medium"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-800",
                    isCollapsed && "justify-center",
                  )}
                  onClick={onNavigate}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-[#B72020]" : "text-stone-500",
                    )}
                  />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 底部版本資訊 */}
      {!isCollapsed && (
        <div className="border-t border-stone-100 px-4 py-3">
          <p className="text-[0.7rem] text-stone-400">漢本三代後台 v0.1.0</p>
        </div>
      )}
    </aside>
  );
}
