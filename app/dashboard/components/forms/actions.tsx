import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

const secondaryButtonClass =
  "inline-flex h-[38px] items-center justify-center rounded-[8px] border border-[#c23513] px-[22px] text-[15px] font-medium leading-[22px] text-[#c23513]";

const primaryButtonClass =
  "inline-flex h-[38px] items-center justify-center rounded-[8px] bg-[#c23513] px-[22px] text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)]";

export function FormActionBar({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex items-center justify-end gap-[10px]">{children}</div>;
}

export function SecondaryLinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={secondaryButtonClass}>
      {children}
    </Link>
  );
}

export function PrimaryLinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={primaryButtonClass}>
      {children}
    </Link>
  );
}

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ children, type = "button", ...props }: PrimaryButtonProps) {
  return (
    <button {...props} type={type} className={primaryButtonClass}>
      {children}
    </button>
  );
}
