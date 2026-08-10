import { AdminSidebar } from "@/components/organisms/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <AdminSidebar />
      <main className="flex-1 bg-surface/80 px-8 py-6 backdrop-blur-sm">{children}</main>
    </div>
  );
}
