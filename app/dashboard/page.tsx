import Image from "next/image";
import Link from "next/link";

type SubmissionStatus = "selesai" | "dalam_proses";

type SubmissionCategory = "Sapras" | "Pentas" | "Hibah";

type Submission = {
  activityName: string;
  category: SubmissionCategory;
  submittedAt: string;
  status: SubmissionStatus;
  actionHref: string;
};

const userSubmissions: Submission[] = [
  {
    activityName: "Sanggar Pijar Resonasi",
    category: "Sapras",
    submittedAt: "17 Januari 2026",
    status: "selesai",
    actionHref: "/dashboard/status/selesai",
  },
  {
    activityName: "Sanggar Tribhuwana",
    category: "Pentas",
    submittedAt: "17 Januari 2026",
    status: "dalam_proses",
    actionHref: "/dashboard/status/dalam-proses",
  },
  {
    activityName: "Sanggar Tribhuwana",
    category: "Hibah",
    submittedAt: "17 Januari 2026",
    status: "dalam_proses",
    actionHref: "/dashboard/status/survey-lapangan",
  },
  {
    activityName: "Sanggar Tribhuwana",
    category: "Pentas",
    submittedAt: "17 Januari 2026",
    status: "dalam_proses",
    actionHref: "/dashboard/status/dalam-proses",
  },
];

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
};

const categoryIcons: Record<SubmissionCategory, { src: string; alt: string }> = {
  Sapras: {
    src: "/figma/shopping-bag-3-line.png",
    alt: "Ikon kategori sarana prasarana",
  },
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

      <div className="mt-6 overflow-hidden rounded-[10px] bg-white shadow-[0_4px_14px_0_rgba(38,43,67,0.16)]">
        <div className="overflow-x-auto">
          <div className="min-w-[950px]">
            <SubmissionHeader />

            {submissions.map((submission, index) => (
              <SubmissionRow
                key={`${submission.category}-${submission.status}-${index}`}
                submission={submission}
                isLast={index === submissions.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
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

        <SubmissionStatusTable submissions={userSubmissions} />
      </div>
    </section>
  );
}
