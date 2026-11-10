import type { Metadata } from "next";
import { AdminRoot } from "@/admin/AdminShell";

export const metadata: Metadata = {
  title: { default: "Админка", template: "%s · Админка" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminRoot>{children}</AdminRoot>;
}
