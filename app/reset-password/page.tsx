"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { trim } from "lodash";
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
import {
  requestResetSchema,
  resetPasswordSchema,
  type RequestResetFormValues,
  type ResetPasswordFormValues,
} from "@/app/lib/form-schemas";

type Step = "request" | "reset";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<Step>("request");

  // Step 1 — request reset token
  const [resetToken, setResetToken] = useState("");

  const {
    register: requestRegister,
    handleSubmit: handleRequestSubmit,
    formState: { errors: requestErrors },
    watch: watchRequest,
  } = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  });

  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    watch: watchReset,
    reset: resetForm,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const email = watchRequest("email");
  const newPassword = watchReset("newPassword");
  const confirmPassword = watchReset("confirmPassword");

  // Shared
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ─── Step 1: Request reset token ─────────────────────────────────────────

  const onRequestReset = handleRequestSubmit(async (values) => {
    setError(null);
    setSuccess(null);

    setLoading(true);
    try {
      if (!isApiAuthEnabled()) {
        setResetToken("local-reset-token");
        setSuccess("Mode tanpa API aktif. Gunakan password baru langsung.");
        setStep("reset");
        return;
      }

      const data = await authApi.forgotPassword({ email: trim(values.email) });
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
  });

  // ─── Step 2: Reset password ──────────────────────────────────────────────

  const onResetPassword = handleResetSubmit(async (values) => {
    setError(null);
    setSuccess(null);

    setLoading(true);
    try {
      if (!isApiAuthEnabled()) {
        setSuccess("Password lokal berhasil diperbarui. Silakan login kembali.");
        resetForm({ newPassword: "", confirmPassword: "" });
        return;
      }

      const data = await authApi.resetPassword({
        token: resetToken,
        new_password: values.newPassword,
      });
      setSuccess(data.message + " Silakan login dengan password baru.");
      resetForm({ newPassword: "", confirmPassword: "" });
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
  });

  const requestErrorMessage = error ?? requestErrors.email?.message ?? null;
  const resetErrorMessage = error ?? resetErrors.newPassword?.message ?? resetErrors.confirmPassword?.message ?? null;

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

            <form onSubmit={onRequestReset} className="mt-5 space-y-4">
              <AuthErrorAlert message={requestErrorMessage} />
              <AuthSuccessAlert message={success} />

              <AuthInput
                type="email"
                placeholder="Email"
                {...requestRegister("email")}
                value={email}
                onChange={(e) => requestRegister("email").onChange(e)}
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

            <form onSubmit={onResetPassword} className="mt-5 space-y-4">
              <AuthErrorAlert message={resetErrorMessage} />
              <AuthSuccessAlert message={success} />

              <AuthPasswordInput
                placeholder="Password baru (min. 8 karakter)"
                {...resetRegister("newPassword")}
                value={newPassword}
                onChange={(e) => resetRegister("newPassword").onChange(e)}
                autoComplete="new-password"
                required
              />

              <AuthPasswordInput
                placeholder="Konfirmasi password"
                {...resetRegister("confirmPassword")}
                value={confirmPassword}
                onChange={(e) => resetRegister("confirmPassword").onChange(e)}
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
