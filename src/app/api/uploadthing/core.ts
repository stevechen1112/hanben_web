import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  // 商品圖片上傳：最多 10 張，每張 4MB
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error("未授權");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      // 記錄至 MediaFile
      await db.mediaFile.create({
        data: {
          filename: file.name,
          url: file.ufsUrl,
          mimeType: file.type,
          size: file.size,
          folder: "products",
        },
      });
      return { url: file.ufsUrl, name: file.name };
    }),

  // 文章封面圖
  articleImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error("未授權");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      await db.mediaFile.create({
        data: {
          filename: file.name,
          url: file.ufsUrl,
          mimeType: file.type,
          size: file.size,
          folder: "articles",
        },
      });
      return { url: file.ufsUrl, name: file.name };
    }),

  // 通用媒體上傳（圖片 + 文件）
  mediaUpload: f({
    image: { maxFileSize: "8MB", maxFileCount: 20 },
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error("未授權");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      await db.mediaFile.create({
        data: {
          filename: file.name,
          url: file.ufsUrl,
          mimeType: file.type,
          size: file.size,
          folder: "media",
        },
      });
      return { url: file.ufsUrl, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
