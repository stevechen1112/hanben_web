const LOCAL_BASE_URL = "http://localhost:3000";

function readEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

type EnvOptions = {
  fallback?: string;
  required?: boolean;
  context?: string;
};

export function getEnvValue(name: string, options: EnvOptions = {}) {
  const value = readEnv(name);
  if (value) {
    return value;
  }

  if (options.required) {
    const suffix = options.context ? ` for ${options.context}` : "";
    throw new Error(`Missing required environment variable: ${name}${suffix}`);
  }

  if (options.fallback !== undefined) {
    return options.fallback;
  }

  const suffix = options.context ? ` for ${options.context}` : "";
  throw new Error(`Missing required environment variable: ${name}${suffix}`);
}

export function getSiteUrl() {
  const rawValue = getEnvValue("NEXTAUTH_URL", {
    fallback: LOCAL_BASE_URL,
    required: process.env.NODE_ENV === "production",
    context: "site URL",
  });

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawValue);
  } catch {
    throw new Error("NEXTAUTH_URL must be a valid absolute URL");
  }

  return parsedUrl.origin;
}