import { db } from "@/lib/db";
import { MediaGrid } from "@/components/admin/media-grid";
import { MediaUploadButton } from "@/components/admin/media-upload-button";

export const metadata = { title: "媒體庫" };

export default async function MediaPage() {
  const files = await db.mediaFile.findMany({
    orderBy: { createdAt: "desc" },
  });

  // 取出所有唯一資料夾
  const folders = [...new Set(files.map((f) => f.folder))].filter(
    (f) => f !== "/",
  );

  return (
    <div className="space-y-6">
      {/* 標題列 */}
      <div>
        <h1 className="text-xl font-semibold text-stone-800">媒體庫</h1>
        <p className="mt-0.5 text-sm text-stone-500">
          共 {files.length} 個檔案
        </p>
      </div>

      {/* 上傳區域 */}
      <MediaUploadButton />

      {/* 檔案 Grid */}
      <MediaGrid items={files} folders={folders} />
    </div>
  );
}
