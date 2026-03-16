"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { adminPengajuanApi } from "@/app/lib/api";
import type { FilterPengajuanDto, Pengajuan } from "@/app/lib/types";

type SubmissionStatus = "selesai" | "disetujui" | "perlu_tindakan" | "dalam_proses" | "ditolak";

type Submission = {
  id: string;
  activityName: string;
  category: "Fasilitasi Hibah" | "Fasilitasi Pentas";
  submittedAt: string;
  status: SubmissionStatus;
  actionHref: string;
};

type SubmissionJenisFilter = "all" | "sapras" | "pentas";

function mapPengajuanToSubmission(p: Pengajuan): Submission {
  const category = p.jenis_fasilitasi_id === 1 ? "Fasilitasi Pentas" as const : "Fasilitasi Hibah" as const;
  const date = new Date(p.tanggal_pengajuan);
  const submittedAt = date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const hasRejectedStep =
    p.status_pemeriksaan === "DITOLAK" ||
    p.survey_lapangan?.status === "DITOLAK" ||
    p.laporan_kegiatan?.status === "DITOLAK" ||
    p.pengiriman_sarana?.status === "DITOLAK" ||
    p.pencairan_dana?.status === "DITOLAK";

  let status: SubmissionStatus = "dalam_proses";
  if (p.status === "DITOLAK" || hasRejectedStep) status = "ditolak";
  else if (p.status === "SELESAI" || p.surat_persetujuan?.file_path) status = "selesai";
  else if (p.jenis_fasilitasi_id === 2 && p.survey_lapangan?.status === "SELESAI") status = "disetujui";
  else if (p.status_pemeriksaan === "SELESAI" || p.status_pemeriksaan === "DISETUJUI") status = "disetujui";
  else if (p.status_pemeriksaan === "MENUNGGU") status = "perlu_tindakan";

  return {
    id: p.pengajuan_id,
    activityName: p.lembaga_budaya?.nama_lembaga || p.judul_kegiatan || p.jenis_kegiatan || "Pengajuan",
    category,
    submittedAt,
    status,
    actionHref: `/dashboard/admin/status/${p.pengajuan_id}`,
  };
}

const statusStyles: Record<
  SubmissionStatus,
  {
    label: string;
    className: string;
  }
> = {
  selesai: {
    label: "Selesai",
    className: "bg-[rgba(114,225,40,0.16)] text-[#72e128]",
  },
  disetujui: {
    label: "Disetujui",
    className: "bg-[rgba(114,225,40,0.16)] text-[#58be15]",
  },
  perlu_tindakan: {
    label: "Perlu Tindakan",
    className: "bg-[rgba(38,198,249,0.16)] text-[#26c6f9]",
  },
  dalam_proses: {
    label: "Dalam Proses",
    className: "bg-[rgba(253,181,40,0.16)] text-[#fdb528]",
  },
  ditolak: {
    label: "Ditolak",
    className: "bg-[#c23513] text-white",
  },
};

/* ───────── Icons ───────── */

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
        stroke="rgba(38,43,67,0.4)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 21L16.65 16.65"
        stroke="rgba(38,43,67,0.4)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUpDownIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7 3L7 21M7 3L3 7M7 3L11 7M17 21V3M17 21L13 17M17 21L21 17"
        stroke="#c23513"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 6H20M7 12H17M10 18H14"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M8 2V5"
        stroke="#4a5066"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 2V5"
        stroke="#4a5066"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 9H21"
        stroke="#4a5066"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="#4a5066" strokeWidth="2" />
      <rect x="7" y="12" width="3" height="3" rx="0.5" fill="#4a5066" />
      <rect x="12" y="12" width="3" height="3" rx="0.5" fill="#4a5066" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 8H16V16"
        stroke="#c23513"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 8L8 16"
        stroke="#c23513"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ───────── Stat Card Icons ───────── */

function TotalPengajuanIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
        stroke="#c23513"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
        stroke="#c23513"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 8V14"
        stroke="#c23513"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 11H17"
        stroke="#c23513"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DalamProsesIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#fdb528" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6V12L16 14" stroke="#fdb528" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PerluTindakanIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#26c6f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8V12" stroke="#26c6f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="16" r="1" fill="#26c6f9" />
    </svg>
  );
}

function SelesaiIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
        stroke="#72e128"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 4L12 14.01L9 11.01"
        stroke="#72e128"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ───────── Stat Cards ───────── */

type StatCardProps = {
  icon: React.ReactNode;
  iconBgClass: string;
  value: number;
  label: string;
};

function StatCard({ icon, iconBgClass, value, label }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-[10px] bg-white p-4 shadow-[0_4px_14px_0_rgba(38,43,67,0.16)] sm:p-5">
      <div className={`flex shrink-0 items-center justify-center rounded-lg p-2 ${iconBgClass}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <p className="text-[18px] font-medium leading-7 text-[rgba(38,43,67,0.9)]">{value}</p>
        <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">{label}</p>
      </div>
    </div>
  );
}

/* ───────── Search & Toolbar ───────── */

function parseIndonesianDate(input: string): number {
  const monthMap: Record<string, number> = {
    januari: 0,
    februari: 1,
    maret: 2,
    april: 3,
    mei: 4,
    juni: 5,
    juli: 6,
    agustus: 7,
    september: 8,
    oktober: 9,
    november: 10,
    desember: 11,
  };

  const [dayRaw, monthRaw, yearRaw] = input.trim().split(/\s+/);
  const day = Number(dayRaw);
  const month = monthMap[monthRaw?.toLowerCase() ?? ""];
  const year = Number(yearRaw);

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return 0;
  }

  return new Date(year, month, day).getTime();
}

function SearchAndToolbar({
  searchQuery,
  onSearchQueryChange,
  sortOrder,
  onToggleSortOrder,
  statusFilter,
  onStatusFilterChange,
  jenisFilter,
  onJenisFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  sortOrder: "desc" | "asc";
  onToggleSortOrder: () => void;
  statusFilter: "all" | SubmissionStatus;
  onStatusFilterChange: (value: "all" | SubmissionStatus) => void;
  jenisFilter: SubmissionJenisFilter;
  onJenisFilterChange: (value: SubmissionJenisFilter) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
}) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="flex h-12 w-full items-center gap-2.5 rounded-lg border-2 border-[#c23513] px-4 sm:max-w-[447px]">
        <SearchIcon />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Cari bedasarkan nama"
          className="flex-1 bg-transparent text-[15px] leading-6 text-[rgba(38,43,67,0.9)] outline-none placeholder:text-[rgba(38,43,67,0.4)]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-start gap-2.5" ref={filterRef}>
        {/* Terbaru Button */}
        <button
          type="button"
          onClick={onToggleSortOrder}
          className="flex items-center justify-center gap-2.5 rounded-[10px] border border-[#c23513] px-[26px] py-2 transition-colors hover:bg-[rgba(194,53,19,0.04)]"
        >
          <span className="text-[17px] font-medium capitalize leading-[26px] text-[#c23513]">Terbaru</span>
          <span className={`${sortOrder === "asc" ? "rotate-180" : ""} transition-transform`}>
            <ArrowUpDownIcon />
          </span>
        </button>

        {/* Filter Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilterMenu((v) => !v)}
            className="flex items-center justify-center gap-2.5 rounded-[10px] bg-[#c23513] px-[26px] py-2 shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
          >
            <span className="text-[17px] font-medium capitalize leading-[26px] text-white">Filter</span>
            <FilterIcon />
          </button>

          {showFilterMenu ? (
            <div className="absolute right-0 top-[calc(100%+8px)] z-10 w-[350px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[12px] border border-[rgba(38,43,67,0.12)] bg-white shadow-[0_14px_30px_-18px_rgba(22,35,71,0.35)]">
              <div className="space-y-0">
                <div className="px-4 py-3.5">
                  <p className="mb-2.5 text-[16px] font-medium leading-6 text-[#3c4358]">Jenis</p>
                  <div className="flex flex-wrap items-center gap-6">
                    <button
                      type="button"
                      onClick={() => onJenisFilterChange("all")}
                      className="flex items-center gap-2.5 text-[#3c4358]"
                    >
                      <span className={`flex size-4.5 items-center justify-center rounded-full border-[3px] ${jenisFilter === "all" ? "border-[#cc3e15]" : "border-[#6d7285]"}`}>
                        <span className={`size-1.5 rounded-full ${jenisFilter === "all" ? "bg-[#cc3e15]" : "bg-transparent"}`} />
                      </span>
                      <span className="text-[14px] leading-6">Semua</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onJenisFilterChange("sapras")}
                      className="flex items-center gap-2.5 text-[#3c4358]"
                    >
                      <span className={`flex size-4.5 items-center justify-center rounded-full border-[3px] ${jenisFilter === "sapras" ? "border-[#cc3e15]" : "border-[#6d7285]"}`}>
                        <span className={`size-1.5 rounded-full ${jenisFilter === "sapras" ? "bg-[#cc3e15]" : "bg-transparent"}`} />
                      </span>
                      <span className="text-[14px] leading-6">Sapras</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onJenisFilterChange("pentas")}
                      className="flex items-center gap-2.5 text-[#3c4358]"
                    >
                      <span className={`flex size-4.5 items-center justify-center rounded-full border-[3px] ${jenisFilter === "pentas" ? "border-[#cc3e15]" : "border-[#6d7285]"}`}>
                        <span className={`size-1.5 rounded-full ${jenisFilter === "pentas" ? "bg-[#cc3e15]" : "bg-transparent"}`} />
                      </span>
                      <span className="text-[14px] leading-6">Pentas</span>
                    </button>
                  </div>
                </div>

                <div className="h-px bg-[rgba(60,67,88,0.16)]" />

                <div className="px-4 py-3.5">
                  <p className="mb-2.5 text-[16px] font-medium leading-6 text-[#3c4358]">Status</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
                    {[
                      { value: "all", label: "Semua", className: "bg-[rgba(109,120,141,0.16)] text-[#6d788d]" },
                      { value: "selesai", label: "Selesai", className: "bg-[rgba(114,225,40,0.2)] text-[#58be15]" },
                      { value: "disetujui", label: "Disetujui", className: "bg-[rgba(114,225,40,0.2)] text-[#58be15]" },
                      { value: "dalam_proses", label: "Dalam Proses", className: "bg-[rgba(253,181,40,0.2)] text-[#eea006]" },
                      { value: "perlu_tindakan", label: "Perlu Tindakan", className: "bg-[rgba(38,198,249,0.2)] text-[#1ea8d5]" },
                      { value: "ditolak", label: "Ditolak", className: "bg-[#cc3e15] text-white" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onStatusFilterChange(option.value as "all" | SubmissionStatus)}
                        className="flex items-center gap-2 text-left"
                      >
                        <span className={`flex size-4.5 items-center justify-center rounded-full border-[3px] ${statusFilter === option.value ? "border-[#cc3e15]" : "border-[#6d7285]"}`}>
                          <span className={`size-1.5 rounded-full ${statusFilter === option.value ? "bg-[#cc3e15]" : "bg-transparent"}`} />
                        </span>
                        <span className={`min-w-[108px] rounded-[999px] px-2.5 py-1 text-center text-[13px] leading-5 ${option.className}`}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-[rgba(60,67,88,0.16)]" />

                <div className="px-4 py-3.5">
                  <p className="mb-2.5 text-[16px] font-medium leading-6 text-[#3c4358]">Tanggal</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <label className="relative flex h-10 items-center rounded-[10px] border border-[rgba(60,67,88,0.24)] pl-10 pr-3">
                      <span className="absolute left-4">
                        <CalendarIcon />
                      </span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="w-full bg-transparent text-[13px] text-[#4a5066] outline-none [color-scheme:light]"
                      />
                    </label>
                    <label className="relative flex h-10 items-center rounded-[10px] border border-[rgba(60,67,88,0.24)] pl-10 pr-3">
                      <span className="absolute left-4">
                        <CalendarIcon />
                      </span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="w-full bg-transparent text-[13px] text-[#4a5066] outline-none [color-scheme:light]"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ───────── Table ───────── */

function SubmissionHeader() {
  const headings = ["NAMA KEGIATAN", "KATEGORI", "TANGGAL PENGAJUAN", "STATUS", "ACTIONS"];
  const widths = ["w-[250px]", "flex-1 min-w-0", "flex-1 min-w-0", "w-[165px]", "w-[120px]"];

  return (
    <div className="flex h-16 border-b border-[rgba(38,43,67,0.12)] bg-[#f5f5f7]">
      {headings.map((heading, index) => (
        <div
          key={heading}
          className={`flex items-center p-5 ${widths[index]}`}
        >
          <p className="flex-1 text-[13px] font-medium uppercase leading-6 tracking-[0.2px] text-[rgba(38,43,67,0.9)]">
            {heading}
          </p>
          <div className="h-3.5 w-0.5 bg-[rgba(38,43,67,0.12)]" />
        </div>
      ))}
    </div>
  );
}

function SubmissionRow({ submission, isLast }: { submission: Submission; isLast: boolean }) {
  const status = statusStyles[submission.status];

  return (
    <div
      className={`flex h-[50px] ${
        !isLast ? "border-b border-[rgba(38,43,67,0.12)]" : ""
      }`}
    >
      {/* Nama Kegiatan */}
      <div className="flex w-[250px] items-center p-5">
        <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
          {submission.activityName}
        </p>
      </div>

      {/* Kategori */}
      <div className="flex min-w-0 flex-1 items-center gap-3 p-5">
        <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[rgba(194,53,19,0.16)]">
          <Image
            src="/figma/shopping-bag-3-line.png"
            alt=""
            width={18}
            height={18}
            aria-hidden="true"
            className="size-[18px]"
          />
        </span>
        <p className="whitespace-nowrap text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)]">
          {submission.category}
        </p>
      </div>

      {/* Tanggal Pengajuan */}
      <div className="flex min-w-0 flex-1 items-center p-5">
        <p className="whitespace-nowrap text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
          {submission.submittedAt}
        </p>
      </div>

      {/* Status */}
      <div className="flex w-[165px] items-center p-5">
        <span
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-[2px] text-[13px] font-medium leading-5 ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex w-[120px] items-center justify-center p-5">
        <Link
          href={submission.actionHref}
          className="inline-flex size-[34px] items-center justify-center rounded-full text-[#c23513] transition-colors hover:bg-[rgba(194,53,19,0.12)]"
          aria-label={`Lihat detail ${submission.activityName}`}
        >
          <ArrowUpRightIcon />
        </Link>
      </div>
    </div>
  );
}

function SubmissionStatusTable({ submissions }: { submissions: Submission[] }) {
  return (
    <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_4px_14px_0_rgba(38,43,67,0.16)]">
      <div className="overflow-x-auto">
        <div className="min-w-[950px]">
          <SubmissionHeader />

          {submissions.length > 0 ? (
            submissions.map((submission, index) => (
              <SubmissionRow
                key={`${submission.category}-${submission.status}-${index}`}
                submission={submission}
                isLast={index === submissions.length - 1}
              />
            ))
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="text-[28px] font-bold leading-[42px] text-[rgba(38,43,67,0.9)]">
                Belum Ada Pengajuan Fasilitasi
              </p>
              <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                Belum ada permohonan fasilitasi kegiatan pentas atau hibah yang diajukan oleh pemohon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────── Main Page ───────── */

export default function AdminDashboardPage() {
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | SubmissionStatus>("all");
  const [jenisFilter, setJenisFilter] = useState<SubmissionJenisFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const fetchData = useCallback(() => {
    setLoading(true);
    const filter: FilterPengajuanDto = {
      search: deferredSearchQuery.trim() || undefined,
      sort_order: sortOrder,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      jenis_fasilitasi_id:
        jenisFilter === "all" ? undefined : jenisFilter === "pentas" ? 1 : 2,
      status:
        statusFilter === "all" || statusFilter === "perlu_tindakan"
          ? undefined
          : statusFilter === "selesai"
            ? "SELESAI"
            : statusFilter === "disetujui"
              ? "DALAM_PROSES"
            : statusFilter === "ditolak"
              ? "DITOLAK"
              : "DALAM_PROSES",
    };

    adminPengajuanApi
      .getAll(filter)
      .then((data) => setAllSubmissions(data.map(mapPengajuanToSubmission)))
      .catch(() => setAllSubmissions([]))
      .finally(() => setLoading(false));
  }, [deferredSearchQuery, endDate, jenisFilter, sortOrder, startDate, statusFilter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

  const submissions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const startTimestamp = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const endTimestamp = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;

    const filtered = allSubmissions.filter((submission) => {
      const matchesQuery = normalizedQuery
        ? submission.activityName.toLowerCase().includes(normalizedQuery)
        : true;
      const matchesStatus = statusFilter === "all" ? true : submission.status === statusFilter;
      const isSapras = submission.category === "Fasilitasi Hibah";
      const matchesJenis = jenisFilter === "all" ? true : jenisFilter === "sapras" ? isSapras : !isSapras;
      const dateTimestamp = parseIndonesianDate(submission.submittedAt);
      const matchesStartDate = startTimestamp === null ? true : dateTimestamp >= startTimestamp;
      const matchesEndDate = endTimestamp === null ? true : dateTimestamp <= endTimestamp;

      return matchesQuery && matchesStatus && matchesJenis && matchesStartDate && matchesEndDate;
    });

    return filtered.sort((a, b) => {
      const dateA = parseIndonesianDate(a.submittedAt);
      const dateB = parseIndonesianDate(b.submittedAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [allSubmissions, searchQuery, sortOrder, statusFilter, jenisFilter, startDate, endDate]);

  const totalPengajuan = submissions.length;
  const dalamProses = submissions.filter((s) => s.status === "dalam_proses").length;
  const perluTindakan = submissions.filter((s) => s.status === "perlu_tindakan").length;
  const selesai = submissions.filter((s) => s.status === "selesai" || s.status === "disetujui").length;

  return (
    <section className="h-full overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-[950px] pb-10 pt-6 lg:pt-7">
        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-[28px] font-bold leading-[42px] text-[rgba(38,43,67,0.9)]">
            Status Pengajuan Fasilitasi
          </h1>
          <p className="text-[13px] leading-5 text-[rgba(38,43,67,0.9)]">
            Pantau perkembangan pengajuan fasilitasi pentas dan sarana prasarana yang telah{" "}
            {" "}diajukan.
          </p>
        </div>

        {/* Search & Toolbar */}
        <div className="mt-6">
          <SearchAndToolbar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            sortOrder={sortOrder}
            onToggleSortOrder={() =>
              setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
            }
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            jenisFilter={jenisFilter}
            onJenisFilterChange={setJenisFilter}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
          />
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
          <StatCard
            icon={<TotalPengajuanIcon />}
            iconBgClass="bg-[rgba(194,53,19,0.16)]"
            value={totalPengajuan}
            label="Total Pengajuan"
          />
          <StatCard
            icon={<DalamProsesIcon />}
            iconBgClass="bg-[rgba(253,181,40,0.16)]"
            value={dalamProses}
            label="Dalam Proses"
          />
          <StatCard
            icon={<PerluTindakanIcon />}
            iconBgClass="bg-[rgba(38,198,249,0.16)]"
            value={perluTindakan}
            label="Perlu Tindakan"
          />
          <StatCard
            icon={<SelesaiIcon />}
            iconBgClass="bg-[rgba(114,225,40,0.16)]"
            value={selesai}
            label="Disetujui / Selesai"
          />
        </div>

        {/* Table */}
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <svg className="h-6 w-6 animate-spin text-[#c23513]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="ml-2 text-[15px] text-[rgba(38,43,67,0.7)]">Memuat data...</span>
            </div>
          ) : (
            <SubmissionStatusTable submissions={submissions} />
          )}
        </div>
      </div>
    </section>
  );
}
