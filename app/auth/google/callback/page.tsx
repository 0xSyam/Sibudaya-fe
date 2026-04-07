"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";
import { useToast } from "@/app/lib/toast-context";
import {
  AuthCard,
  AuthLogo,
  AuthPageShell,
} from "@/app/components/auth/auth-ui";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");

      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken);
        await refreshUser();
        router.replace("/dashboard");
      } else {
        const errMsg = searchParams.get("error");
        const message = errMsg ?? "Google login gagal. Tidak ada token yang diterima.";
        setError(message);
        showToast(message, "error");
      }
    }

    handleCallback();
  }, [searchParams, router, refreshUser, showToast]);

  if (error) {
    return (
      <div className="mt-6 space-y-4">
        <button
          onClick={() => router.push("/login")}
          className="w-full rounded-[8px] bg-[#c23513] py-2 text-[15px] font-medium text-white hover:bg-[#a62c10] cursor-pointer"
        >
          Kembali ke Login
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-3 py-8">
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
      <p className="text-[15px] text-[rgba(38,43,67,0.7)]">
        Memproses login Google...
      </p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <AuthPageShell>
      <AuthCard>
        <AuthLogo />
        <Suspense
          fallback={
            <div className="mt-6 flex flex-col items-center gap-3 py-8">
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
              <p className="text-[15px] text-[rgba(38,43,67,0.7)]">
                Memuat...
              </p>
            </div>
          }
        >
          <GoogleCallbackContent />
        </Suspense>
      </AuthCard>
    </AuthPageShell>
  );
}
