import crypto from "node:crypto";

export type CheckMacAlgorithm = "SHA256" | "MD5";

function normalizeParams(params: Record<string, string | number | null | undefined>) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => [key, String(value)] as const)
    .sort(([left], [right]) => left.localeCompare(right, "en", { sensitivity: "base" }));
}

export function urlEncodeEcpay(value: string) {
  return encodeURIComponent(value)
    .toLowerCase()
    .replace(/%20/g, "+")
    .replace(/%2d/g, "-")
    .replace(/%5f/g, "_")
    .replace(/%2e/g, ".")
    .replace(/%21/g, "!")
    .replace(/%2a/g, "*")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")");
}

export function generateCheckMacValue(
  params: Record<string, string | number | null | undefined>,
  hashKey: string,
  hashIV: string,
  algorithm: CheckMacAlgorithm = "SHA256",
) {
  const normalized = normalizeParams(params)
    .filter(([key]) => key !== "CheckMacValue")
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const raw = `HashKey=${hashKey}&${normalized}&HashIV=${hashIV}`;
  const encoded = urlEncodeEcpay(raw);
  return crypto.createHash(algorithm.toLowerCase()).update(encoded).digest("hex").toUpperCase();
}

export function verifyCheckMacValue(
  params: Record<string, string | number | null | undefined>,
  hashKey: string,
  hashIV: string,
  algorithm: CheckMacAlgorithm = "SHA256",
) {
  const expected = generateCheckMacValue(params, hashKey, hashIV, algorithm);
  return expected === String(params.CheckMacValue || "").toUpperCase();
}