"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";

/**
 * AuthGuard — proteksi halaman dashboard.
 * Redirect ke /login jika user belum terautentikasi.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#f7f7f9]">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-8 w-8 animate-spin text-[#c23513]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-[15px] text-[rgba(38,43,67,0.6)]">
            Memeriksa autentikasi...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}

/**
 * AdminGuard — proteksi halaman admin.
 * Redirect ke /dashboard jika user bukan ADMIN atau SUPER_ADMIN.
 * Harus digunakan di dalam AuthGuard (sudah terjamin terautentikasi).
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  if (isLoading) return null;

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return null;
  }

  return <>{children}</>;
}

/**
 * SuperAdminGuard — proteksi halaman khusus super admin.
 * Redirect ke /dashboard/admin jika user bukan SUPER_ADMIN.
 */
export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard/admin");
    }
  }, [isLoading, user, router]);

  if (isLoading) return null;

  if (!user || user.role !== "SUPER_ADMIN") {
    return null;
  }

  return <>{children}</>;
}
