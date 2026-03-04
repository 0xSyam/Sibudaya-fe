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

export default function RegisterPage() {
  const { register, loginWithGoogle, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      await register({ email: email.trim(), password });
    } catch (err: unknown) {
      const apiErr = err as { message?: string | string[]; statusCode?: number };
      if (Array.isArray(apiErr.message)) {
        setError(apiErr.message.join(". "));
      } else {
        setError(apiErr.message ?? "Registrasi gagal. Silakan coba lagi.");
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
          title="Registrasi Akun"
          description="Buat akun untuk melanjutkan pengajuan"
          titleClassName="font-semibold"
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
            placeholder="Password (min. 8 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <AuthPasswordInput
            placeholder="Konfirmasi password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <AuthPrimaryButton loading={loading}>Daftar</AuthPrimaryButton>

          <AuthDivider />

          <GoogleButton onClick={loginWithGoogle} disabled={loading} />
        </form>

        <p className="mt-4 text-center text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-[#c23513] hover:underline">
            Masuk
          </Link>
        </p>
      </AuthCard>
    </AuthPageShell>
  );
}
