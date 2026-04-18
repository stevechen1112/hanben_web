const loopbackHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function isEquivalentOrigin(left: URL, right: URL) {
  if (left.origin === right.origin) {
    return true;
  }

  const sameProtocol = left.protocol === right.protocol;
  const samePort = (left.port || (left.protocol === "https:" ? "443" : "80")) === (right.port || (right.protocol === "https:" ? "443" : "80"));
  const bothLoopback = loopbackHosts.has(left.hostname) && loopbackHosts.has(right.hostname);

  return sameProtocol && samePort && bothLoopback;
}

function parseOriginHeader(value: string | null) {
  if (!value || value === "null") {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getHeaderValue(headers: Headers, name: string) {
  const value = headers.get(name);
  if (!value) {
    return null;
  }

  return value
    .split(",")
    .map((part) => part.trim())
    .find(Boolean) ?? null;
}

function getForwardedOrigin(request: Request) {
  const forwardedHost = getHeaderValue(request.headers, "x-forwarded-host");
  const host = forwardedHost ?? getHeaderValue(request.headers, "host");

  if (!host) {
    return null;
  }

  const requestUrl = new URL(request.url);
  const forwardedProto = getHeaderValue(request.headers, "x-forwarded-proto");
  const protocol = forwardedProto ? `${forwardedProto.replace(/:$/, "")}:` : requestUrl.protocol;

  try {
    return new URL(`${protocol}//${host}`);
  } catch {
    return null;
  }
}

function getExpectedOrigins(request: Request, origin: string) {
  const expectedOrigins = [new URL(origin), new URL(request.url)];
  const forwardedOrigin = getForwardedOrigin(request);

  if (forwardedOrigin) {
    expectedOrigins.push(forwardedOrigin);
  }

  return expectedOrigins;
}

export function isTrustedOrigin(request: Request, origin: string) {
  const requestOrigin = parseOriginHeader(request.headers.get("origin"));
  const expectedOrigins = getExpectedOrigins(request, origin);

  if (requestOrigin) {
    return expectedOrigins.some((expectedOrigin) => isEquivalentOrigin(requestOrigin, expectedOrigin));
  }

  const referer = request.headers.get("referer");
  if (!referer) {
    return true;
  }

  try {
    const refererUrl = new URL(referer);
    return expectedOrigins.some((expectedOrigin) => isEquivalentOrigin(refererUrl, expectedOrigin));
  } catch {
    return false;
  }
}

export function assertTrustedOrigin(request: Request, origin: string) {
  if (!isTrustedOrigin(request, origin)) {
    throw new Error("Invalid request origin");
  }
}