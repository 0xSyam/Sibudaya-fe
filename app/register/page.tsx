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
import { registerSchema, type RegisterFormValues } from "@/app/lib/form-schemas";
import { useUiFormStore } from "@/app/lib/ui-form-store";

export default function RegisterPage() {
  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const { authError, setAuthError, clearAuthError } = useUiFormStore();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      email: "",
      noTelp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const address = watch("address");
  const email = watch("email");
  const noTelp = watch("noTelp");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  useEffect(() => {
    return () => clearAuthError();
  }, [clearAuthError]);

  const onSubmit = handleSubmit(async (values) => {
    clearAuthError();

    setLoading(true);
    try {
      await register({
        first_name: trim(values.firstName),
        last_name: trim(values.lastName),
        address: trim(values.address),
        email: trim(values.email),
        no_telp: trim(values.noTelp),
        password: values.password,
        confirm_password: values.confirmPassword,
      });
    } catch (err: unknown) {
      const apiErr = err as { message?: string | string[]; statusCode?: number };
      if (Array.isArray(apiErr.message)) {
        setAuthError(apiErr.message.join(". "));
      } else {
        setAuthError(apiErr.message ?? "Registrasi gagal. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  });

  const combinedError =
    authError ??
    errors.firstName?.message ??
    errors.lastName?.message ??
    errors.address?.message ??
    errors.email?.message ??
    errors.noTelp?.message ??
    errors.password?.message ??
    errors.confirmPassword?.message ??
    null;

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
          title="Registrasi Akun"
          description="Buat akun untuk melanjutkan pengajuan"
          titleClassName="font-semibold"
        />

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <AuthErrorAlert message={combinedError} />

          <div className="grid grid-cols-2 gap-3">
            <AuthInput
              type="text"
              placeholder="Nama Depan"
              {...registerField("firstName")}
              value={firstName}
              onChange={(e) => {
                clearAuthError();
                registerField("firstName").onChange(e);
              }}
              autoComplete="given-name"
              required
            />
            <AuthInput
              type="text"
              placeholder="Nama Belakang"
              {...registerField("lastName")}
              value={lastName}
              onChange={(e) => {
                clearAuthError();
                registerField("lastName").onChange(e);
              }}
              autoComplete="family-name"
              required
            />
          </div>

          <AuthInput
            type="text"
            placeholder="Alamat Lengkap"
            {...registerField("address")}
            value={address}
            onChange={(e) => {
              clearAuthError();
              registerField("address").onChange(e);
            }}
            autoComplete="street-address"
            required
          />

          <AuthInput
            type="email"
            placeholder="Email"
            {...registerField("email")}
            value={email}
            onChange={(e) => {
              clearAuthError();
              registerField("email").onChange(e);
            }}
            autoComplete="email"
            required
          />

          <AuthInput
            type="tel"
            placeholder="Nomor Telepon"
            {...registerField("noTelp")}
            value={noTelp}
            onChange={(e) => {
              clearAuthError();
              registerField("noTelp").onChange(e);
            }}
            autoComplete="tel"
            inputMode="numeric"
            pattern="[0-9]+"
            required
          />

          <AuthPasswordInput
            placeholder="Password (Aturan 8-4)"
            {...registerField("password")}
            value={password}
            onChange={(e) => {
              clearAuthError();
              registerField("password").onChange(e);
            }}
            autoComplete="new-password"
            required
          />

          <AuthPasswordInput
            placeholder="Konfirmasi password"
            {...registerField("confirmPassword")}
            value={confirmPassword}
            onChange={(e) => {
              clearAuthError();
              registerField("confirmPassword").onChange(e);
            }}
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
