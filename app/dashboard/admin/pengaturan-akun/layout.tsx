import { SuperAdminGuard } from "@/app/lib/auth-guard";

export default function PengaturanAkunLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SuperAdminGuard>{children}</SuperAdminGuard>;
}
