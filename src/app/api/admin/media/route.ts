import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const IMAGE_MIME_TYPES = [
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
];

const VIDEO_MIME_TYPES = ["video/mp4", "video/webm"];

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const kind = searchParams.get("kind")?.trim() ?? "all";

  const items = await db.mediaFile.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { filename: { contains: query, mode: "insensitive" } },
              { altText: { contains: query, mode: "insensitive" } },
              { folder: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(kind === "image"
        ? { mimeType: { in: IMAGE_MIME_TYPES } }
        : kind === "video"
          ? { mimeType: { in: VIDEO_MIME_TYPES } }
          : kind === "document"
            ? { mimeType: { notIn: [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES] } }
            : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 80,
    select: {
      id: true,
      filename: true,
      url: true,
      mimeType: true,
      altText: true,
      folder: true,
      width: true,
      height: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ items });
}