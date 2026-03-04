"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AuthCard,
  AuthDivider,
  AuthErrorAlert,
  AuthHeading,
  AuthInput,
  AuthLogo,
  AuthPageShell,
  AuthPasswordInput,
  AuthPrimaryButton,
  GoogleButton,
} from "@/app/components/auth/auth-ui";
import { useAuth } from "@/app/lib/auth-context";

export default function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Jika sudah login, redirect (optional guard)
  // useEffect di auth-context sudah handle ini

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi");
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err: unknown) {
      const apiErr = err as { message?: string | string[]; statusCode?: number };
      if (Array.isArray(apiErr.message)) {
        setError(apiErr.message.join(". "));
      } else {
        setError(apiErr.message ?? "Login gagal. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated) {
    return (
      <AuthPageShell>
        <AuthCard>
          <div className="flex items-center justify-center py-8">
            <svg className="h-6 w-6 animate-spin text-[#c23513]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="ml-2 text-[15px] text-[rgba(38,43,67,0.7)]">Mengalihkan...</span>
          </div>
        </AuthCard>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <AuthCard>
        <AuthLogo />

        <AuthHeading
          title="Selamat datang kembali!"
          description="Masuk ke akun terdaftar untuk melanjutkan pengajuan"
        />

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <AuthErrorAlert message={error} />

          <AuthInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <AuthPasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)]">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-[rgba(38,43,67,0.22)] accent-[#c23513]"
              />
              <span>Remember Me</span>
            </label>
            <Link
              href="/reset-password"
              className="text-[15px] font-normal leading-[22px] text-[#c23513] hover:underline"
            >
              Lupa Password?
            </Link>
          </div>

          <AuthPrimaryButton loading={loading}>Masuk</AuthPrimaryButton>

          <AuthDivider />

          <GoogleButton onClick={loginWithGoogle} disabled={loading} />
        </form>

        <p className="mt-4 text-center text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
          Belum punya akun?{" "}
          <Link href="/register" className="text-[#c23513] hover:underline">
            Registrasi
          </Link>
        </p>
      </AuthCard>
    </AuthPageShell>
  );
}
