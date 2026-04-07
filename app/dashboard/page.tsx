"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { pengajuanApi } from "@/app/lib/api";
import { useToast } from "@/app/lib/toast-context";
import type { Pengajuan } from "@/app/lib/types";

const SUBMIT_SUCCESS_NOTICE_KEY = "pengajuan_submit_notice";

type SubmissionStatus = "selesai" | "dalam_proses" | "ditolak";

type SubmissionCategory = "Pentas" | "Hibah";

type Submission = {
  id: string;
  activityName: string;
  category: SubmissionCategory;
  submittedAt: string;
  status: SubmissionStatus;
  actionHref: string;
};

function pickActivityName(p: Pengajuan): string {
  return p.lembaga_budaya?.nama_lembaga || p.judul_kegiatan || p.jenis_kegiatan || "Pengajuan";
}

function mapPengajuanToSubmission(p: Pengajuan): Submission {
  const category: SubmissionCategory = p.jenis_fasilitasi_id === 1 ? "Pentas" : "Hibah";
  const date = new Date(p.tanggal_pengajuan);
  const submittedAt = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hasRejectedStep =
    p.status_pemeriksaan === "DITOLAK" ||
    p.survey_lapangan?.status === "DITOLAK" ||
    p.laporan_kegiatan?.status === "DITOLAK" ||
    p.pengiriman_sarana?.status === "DITOLAK" ||
    p.pencairan_dana?.status === "DITOLAK";

  let status: SubmissionStatus = "dalam_proses";
  if (p.status === "SELESAI") status = "selesai";
  else if (p.status === "DITOLAK" || hasRejectedStep) status = "ditolak";

  return {
    id: p.pengajuan_id,
    activityName: pickActivityName(p),
    category,
    submittedAt,
    status,
    actionHref: `/dashboard/status/${p.pengajuan_id}`,
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
  dalam_proses: {
    label: "Dalam Proses",
    className: "min-w-[101px] bg-[rgba(253,181,40,0.16)] text-[#fdb528]",
  },
  ditolak: {
    label: "Ditolak",
    className: "bg-[#c23513] text-white",
  },
};

const categoryIcons: Record<SubmissionCategory, { src: string; alt: string }> = {
  Pentas: {
    src: "/figma/icon-ticket.svg",
    alt: "Ikon kategori pentas",
  },
  Hibah: {
    src: "/figma/shopping-bag-3-line.png",
    alt: "Ikon kategori hibah",
  },
};

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

function OverviewCard({
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-[10px] bg-white p-5 shadow-[0_4px_14px_0_rgba(38,43,67,0.16)]">
      <h2 className="text-[24px] font-medium leading-[38px] text-[rgba(38,43,67,0.9)]">{title}</h2>
      <p className="mt-3 flex-1 text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">{description}</p>
      <Link
        href={ctaHref}
        className="mt-4 inline-flex h-[38px] w-fit items-center justify-center rounded-[8px] bg-[#c23513] px-[22px] text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
      >
        {ctaLabel}
      </Link>
    </article>
  );
}

function SubmissionHeader() {
  const headings = ["NAMA KEGIATAN", "KATEGORI", "TANGGAL PENGAJUAN", "STATUS", "ACTIONS"];

  return (
    <div className="grid grid-cols-[289px_180px_220px_141px_120px] border-b border-[rgba(38,43,67,0.12)] bg-[#f5f5f7]">
      {headings.map((heading, index) => (
        <div key={heading} className={`px-5 py-5 ${index < 4 ? "border-r border-[rgba(38,43,67,0.12)]" : ""}`}>
          <p className="text-[13px] font-medium leading-6 tracking-[0.2px] text-[rgba(38,43,67,0.9)]">{heading}</p>
        </div>
      ))}
    </div>
  );
}

function SubmissionRow({ submission, isLast }: { submission: Submission; isLast: boolean }) {
  const status = statusStyles[submission.status];
  const categoryIcon = categoryIcons[submission.category];

  return (
    <div
      className={`grid h-[50px] grid-cols-[289px_180px_220px_141px_120px] ${
        !isLast ? "border-b border-[rgba(38,43,67,0.12)]" : ""
      }`}
    >
      <div className="flex items-center px-5">
        <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">{submission.activityName}</p>
      </div>
      <div className="flex items-center gap-3 px-5">
        <span className="flex size-[30px] items-center justify-center rounded-full bg-[rgba(194,53,19,0.16)]">
          <Image src={categoryIcon.src} alt={categoryIcon.alt} width={18} height={18} className="size-[18px]" />
        </span>
        <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)]">{submission.category}</p>
      </div>
      <div className="flex items-center px-5">
        <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">{submission.submittedAt}</p>
      </div>
      <div className="flex items-center px-5">
        <span
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-[2px] text-[13px] font-medium leading-5 ${status.className}`}
        >
          {status.label}
        </span>
      </div>
      <div className="flex items-center justify-center px-5">
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
    <section className="mt-12">
      <h3 className="text-[28px] font-medium leading-[42px] text-[rgba(38,43,67,0.9)]">Status Pengajuan Fasilitasi</h3>
      <p className="mt-4 text-[13px] leading-5 text-[rgba(38,43,67,0.7)]">
        Pantau perkembangan pengajuan fasilitasi pentas dan sarana prasarana yang telah Anda ajukan.
      </p>

      {/* Desktop Table View */}
      <div className="mt-6 hidden overflow-hidden rounded-[10px] bg-white shadow-[0_4px_14px_0_rgba(38,43,67,0.16)] md:block">
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
                  Anda belum mengajukan permohonan fasilitasi kegiatan pentas atau sarana prasarana. Silakan ajukan fasilitasi untuk memulai.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="mt-6 flex flex-col gap-4 md:hidden">
        {submissions.length > 0 ? (
          submissions.map((submission, index) => {
            const status = statusStyles[submission.status];
            const categoryIcon = categoryIcons[submission.category];

            return (
              <div
                key={`${submission.category}-${submission.status}-${index}-mobile`}
                className="flex flex-col rounded-[10px] bg-white p-4 shadow-[0_2px_6px_0_rgba(38,43,67,0.14)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex size-[30px] items-center justify-center rounded-full bg-[rgba(194,53,19,0.16)]">
                      <Image src={categoryIcon.src} alt={categoryIcon.alt} width={18} height={18} className="size-[18px]" />
                    </span>
                    <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">Fasilitasi {submission.category}</p>
                  </div>
                  <span
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-[2px] text-[13px] font-medium leading-5 ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                
                <div className="mt-3">
                  <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">{submission.activityName}</p>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[13px] leading-[22px] text-[rgba(38,43,67,0.7)]">{submission.submittedAt}</p>
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
          })
        ) : (
          <div className="rounded-[10px] bg-white px-5 py-10 text-center shadow-[0_2px_6px_0_rgba(38,43,67,0.14)]">
            <p className="text-[22px] font-bold leading-[34px] text-[rgba(38,43,67,0.9)]">
              Belum Ada Pengajuan Fasilitasi
            </p>
            <p className="mx-auto mt-3 max-w-[560px] text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
              Anda belum mengajukan permohonan fasilitasi kegiatan pentas atau sarana prasarana. Silakan ajukan fasilitasi untuk memulai.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { showToast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const notice = sessionStorage.getItem(SUBMIT_SUCCESS_NOTICE_KEY);
    if (!notice) return;

    showToast(notice, "success");
    sessionStorage.removeItem(SUBMIT_SUCCESS_NOTICE_KEY);
  }, [showToast]);

  useEffect(() => {
    pengajuanApi
      .getMyPengajuan()
      .then((data) => setSubmissions(data.map(mapPengajuanToSubmission)))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="h-full overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-[950px] pb-10 pt-6 lg:pt-[28px]">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-[33px]">
          <OverviewCard
            title="Panduan Pengajuan Fasilitasi"
            description="Pelajari alur dan ketentuan pengajuan fasilitasi agar proses pengajuan Anda berjalan lancar dan sesuai dengan persyaratan yang berlaku."
            ctaLabel="Lihat Panduan"
            ctaHref="#"
          />
          <OverviewCard
            title="Ajukan Fasilitasi"
            description="Ajukan permohonan fasilitasi kegiatan pentas atau sarana prasarana secara online melalui sistem Dinas Kebudayaan DIY."
            ctaLabel="Ajukan Sekarang"
            ctaHref="/dashboard/ajukan-fasilitasi"
          />
        </div>

        {loading ? (
          <div className="mt-12 flex items-center justify-center py-10">
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
    </section>
  );
}
