import Image from "next/image";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TimelineStatus = "completed" | "in_progress" | "locked";

type TimelineStep = {
  title: string;
  description: string;
  status: TimelineStatus;
  scheduledDate?: string;
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const timelineSteps: TimelineStep[] = [
  {
    title: "Pengisian Data Pendaftaran",
    description:
      "Data awal lembaga dan jenis fasilitas hibah telah berhasil diajukan.",
    status: "completed",
  },
  {
    title: "Pemeriksaan Data oleh Admin",
    description:
      "Data dan dokumen pengajuan telah diverifikasi dan dinyatakan sesuai ketentuan.",
    status: "completed",
  },
  {
    title: "Survey Lapangan Oleh Pihak Dinas Kebudayaan",
    description:
      "Pihak Dinas Kebudayaan DIY akan melakukan survey lapangan sesuai lokasi yang sudah kirim pada tahap sebelumnya pada:",
    status: "in_progress",
    scheduledDate: "dd/mm/yyyy",
  },
  {
    title: "Pengisian dan Penandatangan Surat Persetujuan",
    description:
      "Silakan isi dan tandatangani surat persetujuan di Kantor Dinas Kebudayaan DIY.",
    status: "locked",
  },
  {
    title: "Pengiriman Sarana Prasarana",
    description:
      "Proses pengiriman sarana prasarana sedang berlangsung ke lokasi lembaga budaya.",
    status: "locked",
  },
  {
    title: "Pelaporan Kegiatan",
    description:
      "Silakan unggah laporan kegiatan untuk diverifikasi oleh pihak Dinas Kebudayaan.",
    status: "locked",
  },
];

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

/* ------------------------------------------------------------------ */
/*  Status Chip                                                        */
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
/*  Timeline Dot                                                       */
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
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function StatusSurveyLapanganPage() {
  return (
    <section className="h-full overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-[950px] pb-10 pt-6 lg:pt-[28px]">
        <Link
          href="/dashboard"
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
                    <StatusChip status="in_progress" />
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="px-5 py-4">
                  <div className="space-y-6">
                    {timelineSteps.map((step, index) => (
                      <div key={step.title} className="grid grid-cols-[160px_32px_minmax(0,1fr)] gap-5">
                        <div className="flex items-start justify-end pt-3">
                          <StatusChip status={step.status} />
                        </div>

                        <TimelineDot status={step.status} showLine={index < timelineSteps.length - 1} />

                        <article className="rounded-[10px] bg-white p-5 shadow-[0_4px_14px_0_rgba(38,43,67,0.16)]">
                          <h2 className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
                            {step.title}
                          </h2>
                          {step.status !== "locked" ? (
                            <p className="mt-4 text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                              {step.description}
                            </p>
                          ) : null}
                          {step.status === "in_progress" && step.scheduledDate ? (
                            <div className="mt-4">
                              <div className="w-[422px]">
                                <div className="flex items-center gap-[10px] rounded-[10px] border border-[rgba(38,43,67,0.22)] px-4 py-3">
                                  <p className="flex-1 text-[17px] leading-6 text-[rgba(38,43,67,0.4)]">
                                    {step.scheduledDate}
                                  </p>
                                  <CalendarIcon />
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </article>
                      </div>
                    ))}
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
