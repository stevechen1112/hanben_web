import { redirect } from "next/navigation";

export default function LegacyAdminPagesRedirect() {
  redirect("/admin/pages");
}