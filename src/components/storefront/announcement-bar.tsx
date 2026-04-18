import Link from "next/link";
import type { AnnouncementBar } from "@/generated/prisma/client";

export function AnnouncementBar({ announcement }: { announcement: AnnouncementBar | null }) {
  if (!announcement?.isActive) {
    return null;
  }

  const content = (
    <div className="mx-auto flex min-h-11 max-w-7xl items-center justify-center px-4 text-center text-sm font-semibold tracking-[0.08em] sm:px-6">
      {announcement.text}
    </div>
  );

  return (
    <aside
      style={{ backgroundColor: announcement.bgColor, color: announcement.textColor }}
      className="border-b border-black/10"
    >
      {announcement.link ? (
        <Link href={announcement.link} className="block transition-opacity hover:opacity-90">
          {content}
        </Link>
      ) : (
        content
      )}
    </aside>
  );
}
