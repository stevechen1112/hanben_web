import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package } from "lucide-react";

const STATUS_MAP = {
  ACTIVE: { label: "上架中", className: "bg-green-100 text-green-700" },
  DRAFT: { label: "草稿", className: "bg-stone-100 text-stone-600" },
  ARCHIVED: { label: "封存", className: "bg-red-100 text-red-600" },
};

interface SearchParams {
  q?: string;
  status?: string;
  filter?: string;
  page?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = 20;
  const query = params.q?.trim() ?? "";
  const statusFilter = params.status as "ACTIVE" | "DRAFT" | "ARCHIVED" | undefined;
  const specialFilter = params.filter;
  const lowStockFilter = specialFilter === "low-stock";

  const buildHref = (next: {
    q?: string;
    status?: string;
    filter?: string;
    page?: string;
  }) => {
    const queryParams = new URLSearchParams();

    if (next.q) queryParams.set("q", next.q);
    if (next.status) queryParams.set("status", next.status);
    if (next.filter) queryParams.set("filter", next.filter);
    if (next.page) queryParams.set("page", next.page);

    const queryString = queryParams.toString();
    return queryString ? `/admin/products?${queryString}` : "/admin/products";
  };

  const where = {
    ...(query && {
      OR: [
        { title: { contains: query, mode: "insensitive" as const } },
        { slug: { contains: query, mode: "insensitive" as const } },
        { vendor: { contains: query, mode: "insensitive" as const } },
      ],
    }),
    ...(statusFilter && { status: statusFilter }),
    ...(lowStockFilter && {
      variants: {
        some: {
          isActive: true,
          trackInventory: true,
          inventory: { lte: 10 },
        },
      },
    }),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        vendor: true,
        updatedAt: true,
        _count: { select: { variants: true } },
        images: { take: 1, select: { url: true, altText: true } },
      },
    }),
    db.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* 頁面操作列 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 搜尋框 */}
          <form method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input
              name="q"
              defaultValue={query}
              placeholder="搜尋商品名稱、Slug…"
              className="h-8 w-64 rounded-lg border border-stone-200 bg-white pl-8 pr-3 text-sm placeholder:text-stone-400 focus:border-[#B72020] focus:outline-none focus:ring-2 focus:ring-[#B72020]/20"
            />
            {statusFilter && (
              <input type="hidden" name="status" value={statusFilter} />
            )}
            {lowStockFilter && <input type="hidden" name="filter" value="low-stock" />}
          </form>

          {/* 狀態篩選 */}
          <div className="flex items-center gap-1">
            {(["", "ACTIVE", "DRAFT", "ARCHIVED"] as const).map((s) => (
              <Link
                key={s}
                href={buildHref({ q: query || undefined, status: s || undefined })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  (statusFilter === s && !lowStockFilter) || (!s && !statusFilter && !lowStockFilter)
                    ? "bg-stone-800 text-white"
                    : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                {s === "" ? "全部" : STATUS_MAP[s]?.label}
              </Link>
            ))}
            <Link
              href={buildHref({ q: query || undefined, filter: "low-stock" })}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                lowStockFilter
                  ? "bg-stone-800 text-white"
                  : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              低庫存
            </Link>
          </div>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-lg bg-[#B72020] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#9e1c1c] transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增商品
        </Link>
      </div>

      {/* 商品表格 */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="mb-3 h-10 w-10 text-stone-300" />
            <p className="text-sm text-stone-500">
              {query || statusFilter ? "找不到符合條件的商品" : "尚無商品"}
            </p>
            {!query && !statusFilter && (
              <Link
                href="/admin/products/new"
                className="mt-3 text-sm text-[#B72020] hover:underline"
              >
                新增第一個商品 →
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500 w-8">
                  <input type="checkbox" className="rounded border-stone-300" />
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">
                  商品名稱
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">
                  狀態
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">
                  品牌
                </th>
                <th className="px-5 py-3 text-center text-xs font-medium text-stone-500">
                  規格數
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-stone-500">
                  最後更新
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const status =
                  STATUS_MAP[product.status as keyof typeof STATUS_MAP];
                const thumb = product.images[0];

                return (
                  <tr
                    key={product.id}
                    className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-stone-300"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {/* 縮圖 */}
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-stone-100 bg-stone-50">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumb.url}
                              alt={thumb.altText ?? product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-4 w-4 text-stone-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-medium text-stone-800 hover:text-[#B72020] transition-colors"
                          >
                            {product.title}
                          </Link>
                          <p className="text-xs text-stone-400">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${status?.className}`}
                      >
                        {status?.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-stone-500">
                      {product.vendor ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-center text-xs text-stone-500">
                      {product._count.variants}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-stone-400">
                      {new Date(product.updatedAt).toLocaleDateString("zh-TW")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* 分頁 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3">
            <p className="text-xs text-stone-400">
              共 {total} 筆，第 {page}/{totalPages} 頁
            </p>
            <div className="flex gap-1">
              {page > 1 && (
                <Link
                  href={buildHref({ page: String(page - 1), q: query || undefined, status: statusFilter, filter: lowStockFilter ? "low-stock" : undefined })}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs hover:bg-stone-50 transition-colors"
                >
                  上一頁
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={buildHref({ page: String(page + 1), q: query || undefined, status: statusFilter, filter: lowStockFilter ? "low-stock" : undefined })}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs hover:bg-stone-50 transition-colors"
                >
                  下一頁
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
