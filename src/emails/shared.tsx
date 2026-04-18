import type { CSSProperties, ReactNode } from "react";

export const emailStyles: Record<string, CSSProperties> = {
  body: {
    margin: 0,
    backgroundColor: "#f5f5f4",
    color: "#292524",
    fontFamily: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
  },
  wrapper: {
    padding: "32px 16px",
  },
  card: {
    maxWidth: "680px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    overflow: "hidden",
    border: "1px solid #e7e5e4",
    boxShadow: "0 24px 60px rgba(120, 53, 15, 0.08)",
  },
  hero: {
    padding: "28px 32px",
    background: "linear-gradient(135deg, #b72020 0%, #d97706 100%)",
    color: "#ffffff",
  },
  section: {
    padding: "28px 32px",
  },
  muted: {
    color: "#78716c",
    lineHeight: 1.8,
    fontSize: "14px",
  },
  label: {
    color: "#a8a29e",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  rowDivider: {
    borderTop: "1px solid #f1f5f9",
  },
  amount: {
    fontWeight: 700,
    color: "#292524",
  },
  badge: {
    display: "inline-block",
    borderRadius: "999px",
    backgroundColor: "rgba(255,255,255,0.16)",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
  },
};

export function formatPrice(value: number) {
  return `NT$${value.toLocaleString("zh-TW")}`;
}

export function EmailLayout({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body style={emailStyles.body}>
        <div style={emailStyles.wrapper}>
          <div style={emailStyles.card}>
            <div style={emailStyles.hero}>
              <div style={emailStyles.badge}>{badge}</div>
              <h1 style={{ margin: "18px 0 10px", fontSize: "28px", lineHeight: 1.25 }}>{title}</h1>
              <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.8, color: "rgba(255,255,255,0.9)" }}>
                {subtitle}
              </p>
            </div>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}