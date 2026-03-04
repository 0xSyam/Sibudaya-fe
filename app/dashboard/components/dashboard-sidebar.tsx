"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 11.5L12 4L20 11.5V20H14.5V14H9.5V20H4V11.5Z"
        stroke={active ? "white" : "currentColor"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ApplyIcon({ active }: { active: boolean }) {
  return (
    <Image
      src="/figma/Masked Icon.png"
      alt=""
      width={14}
      height={16}
      aria-hidden="true"
      className={active ? "brightness-0 invert" : ""}
    />
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 14V4H8V14H4ZM10 4V10H14V4H10ZM16 4V12H20V4H16ZM4 18V16H8V18H4ZM10 14V18H14V14H10ZM16 16V18H20V16H16Z"
        fill={active ? "white" : "#6d788d"}
      />
    </svg>
  );
}

function NavItem({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: "home" | "apply" | "settings";
}) {
  const renderIcon = () => {
    switch (icon) {
      case "home":
        return <HomeIcon active={active} />;
      case "apply":
        return <ApplyIcon active={active} />;
      case "settings":
        return <SettingsIcon active={active} />;
    }
  };

  return (
    <Link
      href={href}
      className={
        active
          ? "flex w-full items-center gap-[6px] rounded-[6px] bg-[#c23513] px-3 py-2 text-[13px] font-medium leading-[18px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)]"
          : "flex w-full items-center gap-[6px] rounded-[6px] px-3 py-2 text-[13px] font-medium leading-[18px] text-[#6d788d] transition-colors hover:text-[rgba(38,43,67,0.9)]"
      }
    >
      {renderIcon()}
      <span>{label}</span>
    </Link>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const isAdminDashboard = pathname.startsWith("/dashboard/admin");
  const homeHref = isAdminDashboard ? "/dashboard/admin" : "/dashboard";
  const isBeranda = isAdminDashboard
    ? pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/status")
    : pathname === "/dashboard" || pathname.startsWith("/dashboard/status");
  const isAjukan = pathname.startsWith("/dashboard/ajukan-fasilitasi");
  const isPengaturan = pathname.startsWith("/dashboard/admin/pengaturan-fasilitasi");

  return (
    <aside className="hidden w-[259px] shrink-0 border-r border-[rgba(38,43,67,0.12)] bg-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
      <div className="px-5 py-5">
        <Image
          src="/figma/logo-diy-1.png"
          alt="Dinas Kebudayaan Daerah Istimewa Yogyakarta"
          width={149}
          height={42}
          className="h-[42px] w-auto object-contain"
          priority
        />
      </div>

      <nav className="flex flex-col gap-3 px-5 pt-5">
        <NavItem href={homeHref} label="Beranda" active={isBeranda} icon="home" />
        {!isAdminDashboard ? (
          <NavItem
            href="/dashboard/ajukan-fasilitasi"
            label="Ajukan Fasilitasi"
            active={isAjukan}
            icon="apply"
          />
        ) : (
          <NavItem
            href="/dashboard/admin/pengaturan-fasilitasi"
            label="Pengaturan Fasilitasi"
            active={isPengaturan}
            icon="settings"
          />
        )}
      </nav>
    </aside>
  );
}
