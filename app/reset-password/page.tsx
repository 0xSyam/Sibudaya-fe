"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  AuthCard,
  AuthErrorAlert,
  AuthHeading,
  AuthInput,
  AuthLogo,
  AuthPageShell,
  AuthPasswordInput,
  AuthPrimaryButton,
  AuthSuccessAlert,
} from "@/app/components/auth/auth-ui";
import { authApi, isApiAuthEnabled } from "@/app/lib/api";

type Step = "request" | "reset";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<Step>("request");

  // Step 1 — request reset token
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Step 2 — set new password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Shared
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ─── Step 1: Request reset token ─────────────────────────────────────────

  async function handleRequestReset(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }

    setLoading(true);
    try {
      if (!isApiAuthEnabled()) {
        setResetToken("local-reset-token");
        setSuccess("Mode tanpa API aktif. Gunakan password baru langsung.");
        setStep("reset");
        return;
      }

      const data = await authApi.forgotPassword({ email: email.trim() });
      setResetToken(data.reset_token);
      setSuccess("Token reset password berhasil dibuat. Silakan masukkan password baru.");
      setStep("reset");
    } catch (err: unknown) {
      const apiErr = err as { message?: string | string[]; statusCode?: number };
      const message = Array.isArray(apiErr.message)
        ? apiErr.message.join(". ")
        : apiErr.message;
      const normalizedMessage = message?.toLowerCase() ?? "";

      const isUnregisteredEmail =
        apiErr.statusCode === 404 ||
        normalizedMessage.includes("email tidak terdaftar") ||
        normalizedMessage.includes("user not found") ||
        normalizedMessage.includes("email not found") ||
        normalizedMessage.includes("not registered") ||
        normalizedMessage.includes("not found");

      if (isUnregisteredEmail) {
        setError("email tidak terdaftar");
      } else {
        setError(message ?? "Gagal mengirim reset password. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 2: Reset password ──────────────────────────────────────────────

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      if (!isApiAuthEnabled()) {
        setSuccess("Password lokal berhasil diperbarui. Silakan login kembali.");
        setNewPassword("");
        setConfirmPassword("");
        return;
      }

      const data = await authApi.resetPassword({
        token: resetToken,
        new_password: newPassword,
      });
      setSuccess(data.message + " Silakan login dengan password baru.");
      // Reset fields
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const apiErr = err as { message?: string | string[]; statusCode?: number };
      if (Array.isArray(apiErr.message)) {
        setError(apiErr.message.join(". "));
      } else {
        setError(apiErr.message ?? "Gagal reset password. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell>
      <AuthCard>
        <AuthLogo />

        {step === "request" ? (
          <>
            <AuthHeading
              title="Lupa Password?"
              description="Masukkan email yang terdaftar untuk mendapatkan token reset password"
              descriptionClassName="mx-auto max-w-[320px] text-[16px] font-normal leading-6 text-[rgba(38,43,67,0.7)]"
            />

            <form onSubmit={handleRequestReset} className="mt-5 space-y-4">
              <AuthErrorAlert message={error} />
              <AuthSuccessAlert message={success} />

              <AuthInput
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <AuthPrimaryButton loading={loading}>
                Kirim Reset Token
              </AuthPrimaryButton>
            </form>
          </>
        ) : (
          <>
            <AuthHeading
              title="Atur Ulang Password"
              description="Password baru harus berbeda dari password sebelumnya"
              descriptionClassName="mx-auto max-w-[320px] text-[16px] font-normal leading-6 text-[rgba(38,43,67,0.7)]"
            />

            <form onSubmit={handleResetPassword} className="mt-5 space-y-4">
              <AuthErrorAlert message={error} />
              <AuthSuccessAlert message={success} />

              <AuthPasswordInput
                placeholder="Password baru (min. 8 karakter)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

              <AuthPrimaryButton loading={loading}>
                Konfirmasi
              </AuthPrimaryButton>
            </form>
          </>
        )}

        <Link
          href="/login"
          className="mt-4 flex items-center justify-center gap-[6px] text-[15px] font-normal leading-[22px] text-[#c23513] hover:underline"
        >
          <ArrowLeftIcon />
          <span>Kembali ke login</span>
        </Link>
      </AuthCard>
    </AuthPageShell>
  );
}
