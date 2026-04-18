import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

export default auth(function proxy(req: NextAuthRequest) {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  // ── /admin/* 路由保護 ───────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // 登入頁不需保護
    if (pathname === "/admin/login") return NextResponse.next();

    const isAdmin =
      role === "SUPER_ADMIN" || role === "ADMIN" || role === "EDITOR";

    if (!isAdmin) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── /account/* 路由保護 ────────────────────────────────
  if (pathname.startsWith("/account")) {
    if (
      pathname === "/account/login" ||
      pathname === "/account/register" ||
      pathname === "/account/forgot-password" ||
      pathname === "/account/reset-password"
    ) {
      return NextResponse.next();
    }

    if (role !== "CUSTOMER") {
      const loginUrl = new URL("/account/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
