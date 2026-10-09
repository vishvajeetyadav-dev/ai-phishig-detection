import { DashboardSidebar } from '@/components/dashboard-sidebar';
import AuthGuard from '@/components/auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-background lg:flex-row">
        <DashboardSidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </AuthGuard>
  );
}
