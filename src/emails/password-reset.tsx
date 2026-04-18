import { EmailLayout, emailStyles } from "./shared";

export function PasswordResetEmail({ resetUrl }: { resetUrl: string }) {
  return (
    <EmailLayout
      badge="PASSWORD RESET"
      title="重設您的會員密碼"
      subtitle="我們收到一筆重設密碼請求，請在 1 小時內完成設定。"
    >
      <div style={emailStyles.section}>
        <p style={emailStyles.muted}>
          若這是您本人操作，請點擊下方按鈕進入重設頁面；若不是您提出的要求，可以直接忽略這封信。
        </p>
        <a
          href={resetUrl}
          style={{
            display: "inline-block",
            marginTop: "20px",
            borderRadius: "999px",
            backgroundColor: "#b72020",
            color: "#ffffff",
            textDecoration: "none",
            padding: "12px 20px",
            fontWeight: 700,
          }}
        >
          前往重設密碼
        </a>
        <p style={{ ...emailStyles.muted, marginTop: "18px" }}>{resetUrl}</p>
      </div>
    </EmailLayout>
  );
}