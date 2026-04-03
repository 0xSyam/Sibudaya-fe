import Link from "next/link";
import type { ReactNode } from "react";

export type TimelineStatus = "completed" | "in_progress" | "locked" | "rejected";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm1-8h4v2h-6V7h2v5Z" fill="currentColor" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18 8h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h2V7a6 6 0 1 1 12 0v1Zm-2 0V7a4 4 0 0 0-8 0v1h8Zm-5 6v2h2v-2h-2Zm-4 0v2h2v-2H7Zm8 0v2h2v-2h-2Z" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 10.586L16.95 5.636L18.364 7.05L13.414 12L18.364 16.95L16.95 18.364L12 13.414L7.05 18.364L5.636 16.95L10.586 12L5.636 7.05L7.05 5.636L12 10.586Z" fill="currentColor" />
    </svg>
  );
}

function getStatusConfig(status: TimelineStatus) {
  const config: Record<TimelineStatus, { label: string; chipClassName: string; dotBgClassName: string; dotTextClassName: string; icon: ReactNode }> = {
    completed: {
      label: "Selesai",
      chipClassName: "bg-[rgba(114,225,40,0.16)] text-[#72e128]",
      dotBgClassName: "bg-[rgba(114,225,40,0.16)]",
      dotTextClassName: "text-[#72e128]",
      icon: <CheckIcon />,
    },
    in_progress: {
      label: "Dalam Proses",
      chipClassName: "bg-[rgba(253,181,40,0.16)] text-[#fdb528]",
      dotBgClassName: "bg-[rgba(253,181,40,0.16)]",
      dotTextClassName: "text-[#fdb528]",
      icon: <ClockIcon />,
    },
    locked: {
      label: "Belum Tersedia",
      chipClassName: "bg-[rgba(255,77,73,0.16)] text-[#ff4d49]",
      dotBgClassName: "bg-[rgba(255,77,73,0.16)]",
      dotTextClassName: "text-[#ff4d49]",
      icon: <LockIcon />,
    },
    rejected: {
      label: "Ditolak",
      chipClassName: "bg-[rgba(255,77,73,0.16)] text-[#ff4d49]",
      dotBgClassName: "bg-[rgba(255,77,73,0.16)]",
      dotTextClassName: "text-[#ff4d49]",
      icon: <XIcon />,
    },
  };

  return config[status];
}

export function BackArrowIcon() {
  return (
    <svg width="12" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3.828 6.778H16V8.778H3.828L9.192 14.142L7.778 15.556L0 7.778L7.778 0L9.192 1.414L3.828 6.778Z" fill="currentColor" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1h2v2h6V1h2v2ZM4 9v10h16V9H4Zm2 2h2v2H6v-2Zm5 0h2v2h-2v-2Zm5 0h2v2h-2v-2Z" fill="rgba(38,43,67,0.4)" />
    </svg>
  );
}

export function StatusBackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[8px] bg-[#c23513] px-[22px] text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
    >
      <BackArrowIcon />
      Kembali
    </Link>
  );
}

export function StatusChip({ status }: { status: TimelineStatus }) {
  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-[2px] text-[13px] font-medium leading-5 ${config.chipClassName}`}>
      {config.label}
    </span>
  );
}

export function TimelineDot({ status, showLine }: { status: TimelineStatus; showLine: boolean }) {
  const config = getStatusConfig(status);

  return (
    <div className="relative flex justify-center">
      <span className={`z-[1] flex size-8 items-center justify-center rounded-full ${config.dotBgClassName} ${config.dotTextClassName}`}>
        {config.icon}
      </span>
      {showLine ? <span className="absolute top-8 h-[calc(100%+24px)] w-px bg-[rgba(38,43,67,0.12)]" /> : null}
    </div>
  );
}
