"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { trim } from "lodash";
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
  AuthRedirectingState,
  GoogleButton,
} from "@/app/components/auth/auth-ui";
import { useAuth } from "@/app/lib/auth-context";
import { loginSchema, type LoginFormValues } from "@/app/lib/form-schemas";
import { useUiFormStore } from "@/app/lib/ui-form-store";

export default function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const { authError, setAuthError, clearAuthError } = useUiFormStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  useEffect(() => {
    return () => clearAuthError();
  }, [clearAuthError]);

  const onSubmit = handleSubmit(async (values) => {
    clearAuthError();
    setLoading(true);
    try {
      await login({ email: trim(values.email), password: values.password });
    } catch (err: unknown) {
      const apiErr = err as { message?: string | string[]; statusCode?: number };
      if (Array.isArray(apiErr.message)) {
        setAuthError(apiErr.message.join(". "));
      } else {
        setAuthError(apiErr.message ?? "Login gagal. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  });

  const combinedError = authError ?? errors.email?.message ?? errors.password?.message ?? null;

  if (isAuthenticated) {
    return (
      <AuthPageShell>
        <AuthCard>
          <AuthRedirectingState />
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

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <AuthErrorAlert message={combinedError} />

          <AuthInput
            type="email"
            placeholder="Email"
            {...register("email")}
            value={emailValue}
            onChange={(e) => {
              clearAuthError();
              register("email").onChange(e);
            }}
            autoComplete="email"
            required
          />

          <AuthPasswordInput
            placeholder="Password"
            {...register("password")}
            value={passwordValue}
            onChange={(e) => {
              clearAuthError();
              register("password").onChange(e);
            }}
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
