import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { rateLimit } from "./rate-limit";

// ── 型別擴充 ─────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "CUSTOMER";
    } & DefaultSession["user"];
  }
  interface User {
    role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "CUSTOMER";
  }
}

// ── NextAuth 設定 ─────────────────────────────────────────
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    // ── 管理員 Credentials ──────────────────────────────
    Credentials({
      id: "admin-credentials",
      name: "管理員登入",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "密碼", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);
        const loginLimit = rateLimit(`admin-login:${email}`, { limit: 5, windowMs: 60_000 });
        if (!loginLimit.success) return null;

        const admin = await db.adminUser.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
          },
        });

        if (!admin) return null;

        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) return null;

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role as "SUPER_ADMIN" | "ADMIN" | "EDITOR",
        };
      },
    }),

    // ── 前台會員 Credentials ────────────────────────────
    Credentials({
      id: "customer-credentials",
      name: "會員登入",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "密碼", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);
        const loginLimit = rateLimit(`customer-login:${email}`, { limit: 5, windowMs: 60_000 });
        if (!loginLimit.success) return null;

        const customer = await db.customer.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            passwordHash: true,
          },
        });

        if (!customer) return null;

        const isValid = await bcrypt.compare(password, customer.passwordHash);
        if (!isValid) return null;

        const name = [customer.firstName, customer.lastName]
          .filter(Boolean)
          .join(" ");

        return {
          id: customer.id,
          email: customer.email,
          name: name || customer.email,
          role: "CUSTOMER" as const,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as
          | "SUPER_ADMIN"
          | "ADMIN"
          | "EDITOR"
          | "CUSTOMER";
      }
      return session;
    },
  },
});

// ── 輔助函式 ───────────────────────────────────────────────
export function isAdminRole(
  role: string | undefined,
): role is "SUPER_ADMIN" | "ADMIN" | "EDITOR" {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "EDITOR";
}

export function isSuperAdminRole(role: string | undefined): role is "SUPER_ADMIN" {
  return role === "SUPER_ADMIN";
}
