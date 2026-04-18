import Link from "next/link";
import { MessageCircleMore, MessageSquareText } from "lucide-react";

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
  const className = "inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-stone-900 shadow-[0_16px_36px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(0,0,0,0.22)]";
  const primaryBubbleClassName = "flex h-12 w-12 items-center justify-center rounded-full bg-[#1681ff] text-white shadow-[0_16px_30px_rgba(22,129,255,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0d6fe2]";
  const secondaryBubbleClassName = "flex h-14 w-14 items-center justify-center rounded-full bg-[#c61d67] text-white shadow-[0_18px_38px_rgba(151,20,79,0.3)] transition hover:-translate-y-0.5 hover:bg-[#ad195a]";

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      {external ? (
        <a href={href} target="_blank" rel="noreferrer" aria-label="Open messenger widget" className={`pointer-events-auto ${primaryBubbleClassName}`}>
          <MessageCircleMore className="h-5 w-5" />
        </a>
      ) : (
        <Link href={href} aria-label="Open messenger widget" className={`pointer-events-auto ${primaryBubbleClassName}`}>
          <MessageCircleMore className="h-5 w-5" />
        </Link>
      )}

      <div className="flex items-center gap-3">
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
          <a href={href} target="_blank" rel="noreferrer" aria-label="Open chat widget" className={`pointer-events-auto ${secondaryBubbleClassName}`}>
            <MessageSquareText className="h-6 w-6" />
          </a>
        ) : (
          <Link href={href} aria-label="Open chat widget" className={`pointer-events-auto ${secondaryBubbleClassName}`}>
            <MessageSquareText className="h-6 w-6" />
          </Link>
        )}
      </div>
    </div>
  );
}