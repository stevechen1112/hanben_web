import crypto from "node:crypto";
import { getEnvValue } from "@/lib/env";

function getSecret() {
  return getEnvValue("NEXTAUTH_SECRET", {
    fallback: "hanben-reset-secret",
    required: process.env.NODE_ENV === "production",
    context: "timed auth tokens",
  });
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createTimedToken(payload: Record<string, string>, expiresInSeconds: number) {
  const exp = `${Math.floor(Date.now() / 1000) + expiresInSeconds}`;
  const body = Buffer.from(JSON.stringify({ ...payload, exp }), "utf8").toString("base64url");
  const signature = sign(body);
  return `${body}.${signature}`;
}

export function verifyTimedToken<T extends Record<string, string>>(token: string) {
  const [body, signature] = token.split(".");
  if (!body || !signature || sign(body) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T & {
      exp: string;
    };
    if (Number(payload.exp) < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}