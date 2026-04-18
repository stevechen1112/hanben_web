import { db } from "@/lib/db";
import { NavMenuEditor } from "@/components/admin/nav-menu-editor";

const LOCATIONS = [
  { location: "header", label: "Header 導覽選單" },
  { location: "footer", label: "Footer 導覽選單" },
];

export default async function NavigationPage() {
  const menus = await db.navigationMenu.findMany({
    where: { location: { in: LOCATIONS.map((l) => l.location) } },
    include: {
      items: { orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }] },
    },
  });

  function getItems(location: string) {
    const menu = menus.find((m) => m.location === location);
    return (
      menu?.items.map((i) => ({
        id: i.id,
        title: i.title,
        url: i.url,
        isExternal: i.isExternal,
        sortOrder: i.sortOrder,
        parentId: i.parentId,
      })) ?? []
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">導覽選單</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          拖拉調整排序，子項目會顯示為下拉選單
        </p>
      </div>

      {LOCATIONS.map(({ location, label }) => (
        <NavMenuEditor
          key={location}
          location={location}
          label={label}
          initialItems={getItems(location)}
        />
      ))}
    </div>
  );
}
