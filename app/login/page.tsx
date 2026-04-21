"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { trim } from "lodash";
import {
  AuthCard,
  AuthDivider,
  AuthFieldError,
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
import { useToast } from "@/app/lib/toast-context";
import { useUiFormStore } from "@/app/lib/ui-form-store";

export default function LoginPage() {
  const { showToast } = useToast();
  const { login, loginWithGoogle, isAuthenticated, isLoading, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setAuthError, clearAuthError } = useUiFormStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
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

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const target = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
        ? "/dashboard/admin"
        : "/dashboard";
      router.replace(target);
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  const onSubmit = handleSubmit(async (values) => {
    clearAuthError();
    setLoading(true);
    try {
      await login({ email: trim(values.email), password: values.password });
    } catch (err: unknown) {
      const apiErr = err as { message?: string | string[]; statusCode?: number };
      const toastType = apiErr.statusCode === 401 ? "warning" : "error";
      if (Array.isArray(apiErr.message)) {
        const message = apiErr.message.join(". ");
        setAuthError(message);
        showToast(message, toastType);
      } else {
        const message = apiErr.message ?? (apiErr.statusCode === 401 ? "Email atau password salah." : "Login gagal. Silakan coba lagi.");
        setAuthError(message);
        showToast(message, toastType);
      }
    } finally {
      setLoading(false);
    }
  });

  if (isLoading || isAuthenticated) {
    return (
      <AuthPageShell>
        <AuthCard>
          <AuthRedirectingState text={isLoading ? "Memeriksa sesi..." : "Mengalihkan..."} />
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

        <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
          <AuthInput
            type="email"
            placeholder="Email"
            {...register("email")}
            value={emailValue}
            isError={Boolean(errors.email)}
            onChange={(e) => {
              clearAuthError();
              register("email").onChange(e);
            }}
            autoComplete="email"
            required
          />
          <AuthFieldError message={errors.email?.message} />

          <AuthPasswordInput
            placeholder="Password"
            {...register("password")}
            value={passwordValue}
            isError={Boolean(errors.password)}
            onChange={(e) => {
              clearAuthError();
              register("password").onChange(e);
            }}
            autoComplete="current-password"
            required
          />
          <AuthFieldError message={errors.password?.message} />

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-[15px] leading-5.5 text-[rgba(38,43,67,0.9)]">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-[rgba(38,43,67,0.22)] accent-[#c23513]"
              />
              <span>Remember Me</span>
            </label>
            <Link
              href="/reset-password"
              className="text-[15px] font-normal leading-5.5 text-[#c23513] hover:underline"
            >
              Lupa Password?
            </Link>
          </div>

          <AuthPrimaryButton loading={loading}>Masuk</AuthPrimaryButton>

          <AuthDivider />

          <GoogleButton onClick={loginWithGoogle} disabled={loading} />
        </form>

        <p className="mt-4 text-center text-[15px] leading-5.5 text-[rgba(38,43,67,0.7)]">
          Belum punya akun?{" "}
          <Link href="/register" className="text-[#c23513] hover:underline">
            Registrasi
          </Link>
        </p>
      </AuthCard>
    </AuthPageShell>
  );
}
