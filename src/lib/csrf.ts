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

export function isTrustedOrigin(request: Request, origin: string) {
  const expectedOrigin = new URL(origin);
  const requestOrigin = parseOriginHeader(request.headers.get("origin"));
  if (requestOrigin) {
    return isEquivalentOrigin(requestOrigin, expectedOrigin);
  }

  const referer = request.headers.get("referer");
  if (!referer) {
    return true;
  }

  try {
    return isEquivalentOrigin(new URL(referer), expectedOrigin);
  } catch {
    return false;
  }
}

export function assertTrustedOrigin(request: Request, origin: string) {
  if (!isTrustedOrigin(request, origin)) {
    throw new Error("Invalid request origin");
  }
}