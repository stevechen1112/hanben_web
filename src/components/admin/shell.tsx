"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopBar } from "@/components/admin/top-bar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-stone-50">
      <div className="hidden lg:flex lg:shrink-0">
        <AdminSidebar />
      </div>

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="關閉導覽"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-stone-950/45 lg:hidden"
        />
      )}

      <div
        className={[
          "fixed inset-y-0 left-0 z-50 w-[min(85vw,19rem)] max-w-sm -translate-x-full transition-transform duration-200 ease-out lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "",
        ].join(" ")}
      >
        <AdminSidebar mobile onNavigate={() => setMobileMenuOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopBar onMenuToggle={() => setMobileMenuOpen((open) => !open)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}