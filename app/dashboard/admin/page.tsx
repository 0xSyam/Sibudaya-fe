import Image from "next/image";
import Link from "next/link";

type SubmissionStatus = "selesai" | "perlu_tindakan" | "dalam_proses" | "ditolak";

type Submission = {
  activityName: string;
  category: "Fasilitasi Hibah" | "Fasilitasi Pentas";
  submittedAt: string;
  status: SubmissionStatus;
  actionHref: string;
};

const defaultSubmissions: Submission[] = [
  {
    activityName: "Sanggar Tribhuwana",
    category: "Fasilitasi Hibah",
    submittedAt: "14 Januari 2026",
    status: "selesai",
    actionHref: "#",
  },
  {
    activityName: "Sanggar Tribhuwana",
    category: "Fasilitasi Pentas",
    submittedAt: "15 Januari 2026",
    status: "perlu_tindakan",
    actionHref: "/dashboard/admin/status/dalam-proses",
  },
  {
    activityName: "Sanggar Tribhuwana",
    category: "Fasilitasi Hibah",
    submittedAt: "16 Januari 2026",
    status: "dalam_proses",
    actionHref: "/dashboard/admin/status/dalam-proses",
  },
  {
    activityName: "Sanggar Tribhuwana",
    category: "Fasilitasi Pentas",
    submittedAt: "17 Januari 2026",
    status: "ditolak",
    actionHref: "#",
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
    <div className="flex flex-1 items-center gap-4 rounded-[10px] bg-white p-5 shadow-[0_4px_14px_0_rgba(38,43,67,0.16)]">
      <div className={`flex items-center justify-center rounded-lg p-2 ${iconBgClass}`}>
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

function SearchAndToolbar() {
  return (
    <div className="flex items-center justify-between">
      {/* Search Input */}
      <div className="flex h-12 w-[447px] items-center gap-2.5 rounded-lg border-2 border-[#c23513] px-4">
        <SearchIcon />
        <input
          type="text"
          placeholder="Cari bedasarkan nama"
          className="flex-1 bg-transparent text-[15px] leading-6 text-[rgba(38,43,67,0.9)] outline-none placeholder:text-[rgba(38,43,67,0.4)]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-start gap-2.5">
        {/* Terbaru Button */}
        <button
          type="button"
          className="flex items-center justify-center gap-2.5 rounded-[10px] border border-[#c23513] px-[26px] py-2 transition-colors hover:bg-[rgba(194,53,19,0.04)]"
        >
          <span className="text-[17px] font-medium capitalize leading-[26px] text-[#c23513]">Terbaru</span>
          <ArrowUpDownIcon />
        </button>

        {/* Filter Button */}
        <button
          type="button"
          className="flex items-center justify-center gap-2.5 rounded-[10px] bg-[#c23513] px-[26px] py-2 shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
        >
          <span className="text-[17px] font-medium capitalize leading-[26px] text-white">Filter</span>
          <FilterIcon />
        </button>
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
  const submissions = defaultSubmissions;

  const totalPengajuan = submissions.length;
  const dalamProses = submissions.filter((s) => s.status === "dalam_proses").length;
  const perluTindakan = submissions.filter((s) => s.status === "perlu_tindakan").length;
  const selesai = submissions.filter((s) => s.status === "selesai").length;

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
          <SearchAndToolbar />
        </div>

        {/* Stats Cards */}
        <div className="mt-6 flex gap-6">
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
            label="Selesai"
          />
        </div>

        {/* Table */}
        <div className="mt-6">
          <SubmissionStatusTable submissions={submissions} />
        </div>
      </div>
    </section>
  );
}
