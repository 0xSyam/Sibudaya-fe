import { DashboardSidebar } from "./components/dashboard-sidebar";
import { DashboardTopbar } from "./components/dashboard-topbar";
import { AuthGuard } from "@/app/lib/auth-guard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <main className="h-dvh overflow-hidden bg-[#f7f7f9]">
        <div className="flex h-full">
          <DashboardSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardTopbar />
            <div className="min-h-0 flex-1">{children}</div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
