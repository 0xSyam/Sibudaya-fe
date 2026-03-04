"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TimelineStatus = "completed" | "in_progress" | "locked";

type TimelineStep = {
  title: string;
  completedDescription?: string;
  inProgressDescription?: string;
  hasDatePicker?: boolean;
  datePickerLabel?: string;
  hasUploadButton?: boolean;
  uploadLabel?: string;
  uploadButtonText?: string;
};

type StatusOption = {
  label: string;
  chipClass: string;
  textClass: string;
  value: TimelineStatus;
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const INITIAL_ACTIVE_STEP = 2;

const timelineSteps: TimelineStep[] = [
  {
    title: "Pengisian Data Pendaftaran",
    completedDescription:
      "Data awal lembaga dan jenis fasilitas hibah telah berhasil diajukan.",
    inProgressDescription:
      "Data awal lembaga dan jenis fasilitas hibah telah berhasil diajukan.",
  },
  {
    title: "Pemeriksaan Data oleh Admin",
    completedDescription:
      "Data dan dokumen pengajuan telah diverifikasi dan dinyatakan sesuai ketentuan.",
    inProgressDescription:
      "Data pendaftaran telah berhasil dikirim. Menunggu verifikasi oleh pihak Admin.",
  },
  {
    title: "Survey Lapangan Oleh Pihak Dinas Kebudayaan",
    completedDescription:
      "Survey lapangan telah selesai dilakukan oleh pihak Dinas Kebudayaan DIY.",
    inProgressDescription:
      "Pihak Dinas Kebudayaan DIY akan melakukan survey lapangan sesuai lokasi yang sudah kirim pada tahap sebelumnya pada:",
    hasDatePicker: true,
    datePickerLabel: "Tentukan tanggal survey lapangan:",
  },
  {
    title: "Pengisian dan Penandatangan Surat Persetujuan",
    completedDescription:
      "Surat persetujuan telah diterima dan dikonfirmasi di Kantor Dinas Kebudayaan DIY.",
    inProgressDescription:
      "Surat persetujuan telah diterbitkan. Pemohon wajib mengunduh surat persetujuan dan melakukan penandatanganan secara langsung di Kantor Dinas Kebudayaan DIY.",
    hasUploadButton: true,
    uploadLabel: "Surat Persetujuan:",
    uploadButtonText: "Unggah Berkas",
  },
  {
    title: "Pengiriman Sarana Prasarana",
    completedDescription:
      "Sarana prasarana telah dikirim ke lokasi lembaga budaya yang terdaftar.",
    inProgressDescription:
      "Proses pengiriman sarana prasarana sedang berlangsung ke lokasi lembaga budaya.",
  },
  {
    title: "Pelaporan Kegiatan",
    completedDescription:
      "Laporan kegiatan telah diverifikasi dan dinyatakan sesuai ketentuan.",
    inProgressDescription:
      "Silakan unggah laporan kegiatan untuk diverifikasi oleh pihak Dinas Kebudayaan.",
  },
];

const statusOptions: StatusOption[] = [
  {
    label: "Selesai",
    chipClass: "bg-[rgba(114,225,40,0.16)]",
    textClass: "text-[#72e128]",
    value: "completed",
  },
  {
    label: "Dalam Proses",
    chipClass: "bg-[rgba(253,181,40,0.16)]",
    textClass: "text-[#fdb528]",
    value: "in_progress",
  },
  {
    label: "Belum Tersedia",
    chipClass: "bg-[rgba(255,77,73,0.16)]",
    textClass: "text-[#ff4d49]",
    value: "locked",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStepStatus(stepIndex: number, activeStep: number): TimelineStatus {
  if (stepIndex < activeStep) return "completed";
  if (stepIndex === activeStep) return "in_progress";
  return "locked";
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function BackArrowIcon() {
  return (
    <svg width="12" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3.828 6.778H16V8.778H3.828L9.192 14.142L7.778 15.556L0 7.778L7.778 0L9.192 1.414L3.828 6.778Z" fill="currentColor" />
    </svg>
  );
}

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

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1h2v2h6V1h2v2ZM4 9v10h16V9H4Zm2 2h2v2H6v-2Zm5 0h2v2h-2v-2Zm5 0h2v2h-2v-2Z" fill="rgba(38,43,67,0.4)" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 19H20V12H22V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V12H4V19ZM13 9V16H11V9H6L12 3L18 9H13Z" fill="white" />
    </svg>
  );
}

function DropdownArrowIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}>
      <path d="M12.172 11L9.343 8.172L10.757 6.758L15 11L10.757 15.243L9.343 13.828L12.172 11Z" fill="rgba(38,43,67,0.5)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Chips                                                       */
/* ------------------------------------------------------------------ */

function StatusChip({ status }: { status: TimelineStatus }) {
  const config = {
    completed: { label: "Selesai", className: "bg-[rgba(114,225,40,0.16)] text-[#72e128]" },
    in_progress: { label: "Dalam Proses", className: "bg-[rgba(253,181,40,0.16)] text-[#fdb528]" },
    locked: { label: "Belum Tersedia", className: "bg-[rgba(255,77,73,0.16)] text-[#ff4d49]" },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-[2px] text-[13px] font-medium leading-5 ${c.className}`}>
      {c.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Dropdown                                                    */
/* ------------------------------------------------------------------ */

function StatusDropdown({
  currentStatus,
  onSelect,
}: {
  currentStatus: TimelineStatus;
  onSelect?: (value: TimelineStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-1"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <DropdownArrowIcon isOpen={isOpen} />
        <StatusChip status={currentStatus} />
      </button>

      {isOpen ? (
        <div className="absolute left-[-42px] top-[30px] z-10 w-[169px] overflow-hidden rounded-[10px] bg-white py-2 shadow-[0_6px_20px_0_rgba(38,43,67,0.18)]">
          {statusOptions.map((option) => (
            <button
              type="button"
              key={option.label}
              className="flex w-full cursor-pointer items-center px-5 py-2 transition-colors hover:bg-[rgba(38,43,67,0.04)]"
              onClick={() => {
                onSelect?.(option.value);
                setIsOpen(false);
              }}
            >
              <span
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-[2px] text-[13px] font-medium leading-5 ${option.chipClass} ${option.textClass}`}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline Dots                                                      */
/* ------------------------------------------------------------------ */

function TimelineDot({ status, showLine }: { status: TimelineStatus; showLine: boolean }) {
  const dotConfig = {
    completed: { bgClass: "bg-[rgba(114,225,40,0.16)]", colorClass: "text-[#72e128]", icon: <CheckIcon /> },
    in_progress: { bgClass: "bg-[rgba(253,181,40,0.16)]", colorClass: "text-[#fdb528]", icon: <ClockIcon /> },
    locked: { bgClass: "bg-[rgba(255,77,73,0.16)]", colorClass: "text-[#ff4d49]", icon: <LockIcon /> },
  };
  const config = dotConfig[status];

  return (
    <div className="relative flex justify-center">
      <span className={`z-[1] flex size-8 items-center justify-center rounded-full ${config.bgClass} ${config.colorClass}`}>
        {config.icon}
      </span>
      {showLine ? <span className="absolute top-8 h-[calc(100%+24px)] w-px bg-[rgba(38,43,67,0.12)]" /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Date Input                                                         */
/* ------------------------------------------------------------------ */

function DateInput() {
  return (
    <div className="w-[422px]">
      <div className="flex items-center gap-[10px] rounded-[10px] border border-[rgba(38,43,67,0.22)] px-4 py-3">
        <input
          type="text"
          placeholder="dd/mm/yyyy"
          className="flex-1 bg-transparent text-[17px] leading-6 text-[rgba(38,43,67,0.9)] outline-none placeholder:text-[rgba(38,43,67,0.4)]"
          readOnly
        />
        <CalendarIcon />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function AdminStatusDalamProsesPage() {
  const [activeStep, setActiveStep] = useState(INITIAL_ACTIVE_STEP);
  const totalSteps = timelineSteps.length;
  const allCompleted = activeStep >= totalSteps;

  function handleStatusChange(stepIndex: number, newStatus: TimelineStatus) {
    const currentStatus = getStepStatus(stepIndex, activeStep);

    if (newStatus === "completed" && currentStatus === "in_progress") {
      setActiveStep((prev) => prev + 1);
    }

    if (newStatus === "in_progress" && currentStatus === "completed") {
      setActiveStep(stepIndex);
    }
  }

  return (
    <section className="h-full overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-[950px] pb-10 pt-6 lg:pt-[28px]">
        <Link
          href="/dashboard/admin"
          className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[8px] bg-[#c23513] px-[22px] text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
        >
          <BackArrowIcon />
          Kembali
        </Link>

        <section className="mt-6">
          <h1 className="text-[28px] font-medium leading-[42px] text-[rgba(38,43,67,0.9)]">
            Status Pengajuan Fasilitasi
          </h1>
          <p className="mt-4 text-[13px] leading-5 text-[rgba(38,43,67,0.7)]">
            Pantau perkembangan pengajuan fasilitas pentas dan sarana prasarana yang telah Anda ajukan.
          </p>

          <div className="mt-4 overflow-hidden rounded-[10px] bg-white shadow-[0_4px_14px_0_rgba(38,43,67,0.16)]">
            <div className="overflow-x-auto">
              <div className="min-w-[920px]">
                {/* Table Header */}
                <div className="grid grid-cols-[360px_minmax(200px,1fr)_minmax(200px,1fr)_165px] border-b border-[rgba(38,43,67,0.12)] bg-[#f5f5f7]">
                  {["NAMA KEGIATAN", "KATEGORI", "TANGGAL PENGAJUAN", "STATUS"].map((heading, index) => (
                    <div key={heading} className={`px-5 py-5 ${index < 3 ? "border-r border-[rgba(38,43,67,0.12)]" : ""}`}>
                      <p className="text-[13px] font-medium leading-6 tracking-[0.2px] text-[rgba(38,43,67,0.9)]">{heading}</p>
                    </div>
                  ))}
                </div>

                {/* Table Row */}
                <div className="grid h-[54px] grid-cols-[360px_minmax(200px,1fr)_minmax(200px,1fr)_165px] border-b border-[rgba(38,43,67,0.12)]">
                  <div className="flex items-center px-5">
                    <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">Sanggar Tribhuwana</p>
                  </div>
                  <div className="flex items-center gap-3 px-5">
                    <span className="flex size-[30px] items-center justify-center rounded-full bg-[rgba(194,53,19,0.16)]">
                      <Image src="/figma/shopping-bag-3-line.png" alt="" width={18} height={18} aria-hidden="true" className="size-[18px]" />
                    </span>
                    <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)]">Fasilitasi Hibah</p>
                  </div>
                  <div className="flex items-center px-5">
                    <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">17 Januari 2026</p>
                  </div>
                  <div className="flex items-center px-5">
                    <StatusChip status={allCompleted ? "completed" : "in_progress"} />
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="px-5 py-4">
                  <div className="space-y-6">
                    {timelineSteps.map((step, index) => {
                      const status = getStepStatus(index, activeStep);
                      const description =
                        status === "completed"
                          ? step.completedDescription
                          : status === "in_progress"
                            ? step.inProgressDescription
                            : undefined;
                      const showDatePicker = status === "in_progress" && step.hasDatePicker;
                      const showUploadButton = status === "in_progress" && step.hasUploadButton;

                      return (
                        <div key={step.title} className="grid grid-cols-[160px_32px_minmax(0,1fr)] gap-5">
                          <div className="flex items-start justify-end pt-3">
                            <StatusDropdown
                              currentStatus={status}
                              onSelect={(newStatus) => handleStatusChange(index, newStatus)}
                            />
                          </div>

                          <TimelineDot status={status} showLine={index < totalSteps - 1} />

                          <article className="rounded-[10px] bg-white p-5 shadow-[0_4px_14px_0_rgba(38,43,67,0.16)]">
                            <h2 className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
                              {step.title}
                            </h2>
                            {description ? (
                              <p className="mt-4 text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                                {description}
                              </p>
                            ) : null}
                            {showDatePicker ? (
                              <div className="mt-4 space-y-2">
                                <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                                  {step.datePickerLabel}
                                </p>
                                <DateInput />
                              </div>
                            ) : null}
                            {showUploadButton ? (
                              <div className="mt-4 flex flex-col gap-2">
                                <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                                  {step.uploadLabel}
                                </p>
                                <button
                                  type="button"
                                  className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium capitalize leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
                                >
                                  {step.uploadButtonText}
                                  <UploadIcon />
                                </button>
                              </div>
                            ) : null}
                          </article>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
