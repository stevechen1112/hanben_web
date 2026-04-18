import Link from "next/link";
import { MessageCircleMore } from "lucide-react";

function isExternalUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function StorefrontSupportWidget({
  primaryUrl,
  fallbackUrl = "/pages/contact",
}: {
  primaryUrl?: string;
  fallbackUrl?: string;
}) {
  const href = primaryUrl || fallbackUrl;
  const external = isExternalUrl(href);
  const className = "inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-stone-800 shadow-[0_14px_34px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)]";
  const bubbleClassName = "flex h-14 w-14 items-center justify-center rounded-full bg-[#bc2020] text-white shadow-[0_14px_30px_rgba(117,17,17,0.28)] transition hover:-translate-y-0.5 hover:bg-[#a71d1d]";

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-5 sm:right-5">
      {external ? (
        <a href={href} target="_blank" rel="noreferrer" className={`pointer-events-auto ${className}`}>
          <span>真人客服</span>
          <span aria-hidden="true">👋</span>
        </a>
      ) : (
        <Link href={href} className={`pointer-events-auto ${className}`}>
          <span>真人客服</span>
          <span aria-hidden="true">👋</span>
        </Link>
      )}

      {external ? (
        <a href={href} target="_blank" rel="noreferrer" aria-label="Open chat widget" className={`pointer-events-auto ${bubbleClassName}`}>
          <MessageCircleMore className="h-6 w-6" />
        </a>
      ) : (
        <Link href={href} aria-label="Open chat widget" className={`pointer-events-auto ${bubbleClassName}`}>
          <MessageCircleMore className="h-6 w-6" />
        </Link>
      )}
    </div>
  );
}