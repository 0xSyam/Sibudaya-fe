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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d+$/;
const PASSWORD_8_4_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function RegisterPage() {
  const { register, loginWithGoogle, isAuthenticated } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Nama depan dan nama belakang wajib diisi");
      return;
    }

    if (!address.trim()) {
      setError("Alamat wajib diisi");
      return;
    }

    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Format email tidak valid");
      return;
    }

    if (!noTelp.trim()) {
      setError("Nomor telepon wajib diisi");
      return;
    }

    if (!PHONE_REGEX.test(noTelp.trim())) {
      setError("Nomor telepon hanya boleh berisi angka");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    if (!PASSWORD_8_4_REGEX.test(password)) {
      setError("Password harus mengandung huruf kecil, huruf besar, angka, dan karakter khusus");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        address: address.trim(),
        email: email.trim(),
        no_telp: noTelp.trim(),
        password,
        confirm_password: confirmPassword,
      });
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

          <div className="grid grid-cols-2 gap-3">
            <AuthInput
              type="text"
              placeholder="Nama Depan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
            <AuthInput
              type="text"
              placeholder="Nama Belakang"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
          </div>

          <AuthInput
            type="text"
            placeholder="Alamat Lengkap"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            autoComplete="street-address"
            required
          />

          <AuthInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <AuthInput
            type="tel"
            placeholder="Nomor Telepon"
            value={noTelp}
            onChange={(e) => setNoTelp(e.target.value)}
            autoComplete="tel"
            inputMode="numeric"
            pattern="[0-9]+"
            required
          />

          <AuthPasswordInput
            placeholder="Password (Aturan 8-4)"
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
