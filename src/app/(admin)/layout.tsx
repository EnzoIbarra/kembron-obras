import { AdminSidebar } from '@/shared/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="ml-[220px] flex-1 p-6">{children}</main>
    </div>
  );
}
