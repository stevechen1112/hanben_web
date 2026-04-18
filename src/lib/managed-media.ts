import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

export const MANAGED_MEDIA_DIR = path.join(process.cwd(), "public", "media-library");

const MIME_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".webm": "video/webm",
  ".webp": "image/webp",
};

export type ManagedMediaImportResult = {
  filename: string;
  folder: string;
  mimeType: string;
  size: number;
  sourceRelativePath: string;
  url: string;
  width: number | null;
  height: number | null;
};

export type ManagedMediaFileDetails = Pick<
  ManagedMediaImportResult,
  "filename" | "folder" | "mimeType" | "size" | "url" | "width" | "height"
>;

function toPosixPath(value: string) {
  return value.replace(/\\/g, "/");
}

function sanitizeSegment(value: string) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return normalized || "asset";
}

function getMimeType(filePath: string) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

async function getImageDimensions(filePath: string) {
  const mimeType = getMimeType(filePath);

  if (!mimeType.startsWith("image/")) {
    return { width: null, height: null };
  }

  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width ?? null,
      height: metadata.height ?? null,
    };
  } catch {
    return { width: null, height: null };
  }
}

export function buildManagedMediaFilename(sourceRelativePath: string, originalFilename: string) {
  const ext = path.extname(originalFilename).toLowerCase();
  const baseName = path.basename(originalFilename, ext);
  const safeBase = sanitizeSegment(baseName);
  const hash = createHash("sha1").update(toPosixPath(sourceRelativePath)).digest("hex").slice(0, 10);

  return `${hash}-${safeBase}${ext}`;
}

export async function importManagedMediaFile(options: {
  sourcePath: string;
  sourceRelativePath: string;
  sourceRootKey: string;
}) {
  const sourceRelativePath = toPosixPath(options.sourceRelativePath);
  const relativeDir = path.posix.dirname(sourceRelativePath);
  const folderSegments = [
    "provided",
    sanitizeSegment(options.sourceRootKey),
    ...relativeDir
      .split("/")
      .filter(Boolean)
      .map((segment) => sanitizeSegment(segment)),
  ];
  const folder = folderSegments.join("/");
  const filename = buildManagedMediaFilename(sourceRelativePath, path.basename(options.sourcePath));
  const targetDir = path.join(MANAGED_MEDIA_DIR, ...folderSegments);
  const targetPath = path.join(targetDir, filename);

  await fs.mkdir(targetDir, { recursive: true });
  await fs.copyFile(options.sourcePath, targetPath);

  const stat = await fs.stat(targetPath);
  const { width, height } = await getImageDimensions(targetPath);

  return {
    filename,
    folder,
    mimeType: getMimeType(targetPath),
    size: Number(stat.size),
    sourceRelativePath,
    url: `/${toPosixPath(path.relative(path.join(process.cwd(), "public"), targetPath))}`,
    width,
    height,
  } satisfies ManagedMediaImportResult;
}

export async function inspectManagedMediaFile(publicRelativePath: string): Promise<ManagedMediaFileDetails> {
  const normalizedPath = toPosixPath(publicRelativePath).replace(/^\/+/, "");
  const targetPath = path.join(process.cwd(), "public", normalizedPath);
  const stat = await fs.stat(targetPath);
  const { width, height } = await getImageDimensions(targetPath);

  return {
    filename: path.posix.basename(normalizedPath),
    folder: path.posix.dirname(normalizedPath).replace(/^media-library\//, ""),
    mimeType: getMimeType(targetPath),
    size: Number(stat.size),
    url: `/${normalizedPath}`,
    width,
    height,
  };
}

export async function walkFiles(rootPath: string): Promise<string[]> {
  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(rootPath, entry.name);
      if (entry.isDirectory()) {
        return walkFiles(fullPath);
      }
      return [fullPath];
    }),
  );

  return files.flat();
}