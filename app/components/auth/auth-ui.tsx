"use client";

import Image from "next/image";
import { useState, forwardRef } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

const authInputBaseClass =
  "h-12 w-full rounded-[8px] border border-[rgba(38,43,67,0.22)] bg-white px-4 text-[15px] leading-6 text-[rgba(38,43,67,0.9)] outline-none placeholder:text-[rgba(38,43,67,0.4)] focus:border-[#c23513]";

export function AuthPageShell({ children }: { children: ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f9] px-4 py-10">{children}</main>;
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <section className="w-full max-w-[460px] rounded-[10px] bg-white px-6 py-8 shadow-[0_4px_14px_0_rgba(38,43,67,0.16)] sm:px-12 sm:py-12">
      {children}
    </section>
  );
}

export function AuthRedirectingState({ text = "Mengalihkan..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <svg className="h-6 w-6 animate-spin text-[#c23513]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="ml-2 text-[15px] text-[rgba(38,43,67,0.7)]">{text}</span>
    </div>
  );
}

export function AuthLogo() {
  return (
    <div className="relative mx-auto h-[42px] w-[185px]">
      <Image
        src="/figma/logo-diy-1.png"
        alt="Logo Dinas Kebudayaan DIY"
        fill
        priority
        className="object-contain"
      />
    </div>
  );
}

type AuthHeadingProps = {
  title: string;
  description: string;
  descriptionClassName?: string;
  titleClassName?: string;
};

export function AuthHeading({ title, description, descriptionClassName, titleClassName }: AuthHeadingProps) {
  return (
    <div className="mt-6 text-center">
      <h1 className={`text-[24px] leading-[38px] text-[rgba(38,43,67,0.9)] ${titleClassName ?? "font-medium"}`}>
        {title}
      </h1>
      <p className={descriptionClassName ?? "text-[15px] font-normal leading-[22px] text-[rgba(38,43,67,0.7)]"}>
        {description}
      </p>
    </div>
  );
}

type AuthInputProps = InputHTMLAttributes<HTMLInputElement>;

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput({ className, ...props }, ref) {
    return <input ref={ref} {...props} className={`${authInputBaseClass} ${className ?? ""}`} />;
  }
);

type AuthInputWithIconProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode;
};

export const AuthInputWithIcon = forwardRef<HTMLInputElement, AuthInputWithIconProps>(
  function AuthInputWithIcon({ icon, className, ...props }, ref) {
    return (
      <div className="relative">
        <input ref={ref} {...props} className={`${authInputBaseClass} pr-10 ${className ?? ""}`} />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(38,43,67,0.7)]">
          {icon}
        </span>
      </div>
    );
  }
);

/** Password input dengan toggle show/hide */
export function AuthPasswordInput({
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className={`${authInputBaseClass} pr-10 ${className ?? ""}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(38,43,67,0.7)] hover:text-[rgba(38,43,67,0.9)] cursor-pointer"
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

type AuthPrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function AuthPrimaryButton({ children, type = "submit", className, loading, disabled, ...props }: AuthPrimaryButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={loading || disabled}
      className={`h-[38px] w-full rounded-[8px] bg-[#c23513] text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10] disabled:opacity-60 disabled:cursor-not-allowed ${className ?? ""}`}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Memproses...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1 12C2.8 8.2 6.7 6 12 6C17.3 6 21.2 8.2 23 12C21.2 15.8 17.3 18 12 18C6.7 18 2.8 15.8 1 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function ArrowLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Divider "atau" */
export function AuthDivider({ text = "atau" }: { text?: string }) {
  return (
    <div className="relative flex items-center py-1">
      <div className="flex-1 border-t border-[rgba(38,43,67,0.15)]" />
      <span className="mx-3 text-[13px] text-[rgba(38,43,67,0.5)]">{text}</span>
      <div className="flex-1 border-t border-[rgba(38,43,67,0.15)]" />
    </div>
  );
}

/** Google OAuth button */
export function GoogleButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[38px] w-full items-center justify-center gap-2 rounded-[8px] border border-[rgba(38,43,67,0.22)] bg-white text-[15px] font-medium text-[rgba(38,43,67,0.9)] transition-colors hover:bg-[#f7f7f9] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
      </svg>
      Masuk dengan Google
    </button>
  );
}

/** Error alert */
export function AuthErrorAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
      {message}
    </div>
  );
}

/** Success alert */
export function AuthSuccessAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-[8px] border border-green-200 bg-green-50 px-4 py-3 text-[14px] text-green-700">
      {message}
    </div>
  );
}
