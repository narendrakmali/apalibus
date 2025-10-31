import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebarNav from "@/components/admin/sidebar-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebarNav />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
