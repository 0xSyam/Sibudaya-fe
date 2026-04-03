import Image from "next/image";
import { StatusChip, type TimelineStatus } from "@/app/dashboard/components/status/timeline-ui";

type SubmissionSummaryTableProps = {
  namaKegiatan: string;
  kategori: string;
  tanggalPengajuan: string;
  status: TimelineStatus;
  headerPaddingClass?: "py-3" | "py-5";
};

const HEADERS = ["NAMA KEGIATAN", "KATEGORI", "TANGGAL PENGAJUAN", "STATUS"] as const;

export function SubmissionSummaryTable({
  namaKegiatan,
  kategori,
  tanggalPengajuan,
  status,
  headerPaddingClass = "py-5",
}: SubmissionSummaryTableProps) {
  return (
    <>
      <div className="grid grid-cols-[360px_minmax(200px,1fr)_minmax(200px,1fr)_165px] border-b border-[rgba(38,43,67,0.12)] bg-[#f5f5f7]">
        {HEADERS.map((heading, index) => (
          <div key={heading} className={`px-5 ${headerPaddingClass} ${index < 3 ? "border-r border-[rgba(38,43,67,0.12)]" : ""}`}>
            <p className="text-[13px] font-medium leading-6 tracking-[0.2px] text-[rgba(38,43,67,0.9)]">{heading}</p>
          </div>
        ))}
      </div>

      <div className="grid h-[54px] grid-cols-[360px_minmax(200px,1fr)_minmax(200px,1fr)_165px] border-b border-[rgba(38,43,67,0.12)]">
        <div className="flex items-center px-5">
          <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">{namaKegiatan}</p>
        </div>
        <div className="flex items-center gap-3 px-5">
          <span className="flex size-[30px] items-center justify-center rounded-full bg-[rgba(194,53,19,0.16)]">
            <Image src="/figma/shopping-bag-3-line.png" alt="" width={18} height={18} aria-hidden="true" className="size-[18px]" />
          </span>
          <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)]">{kategori}</p>
        </div>
        <div className="flex items-center px-5">
          <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">{tanggalPengajuan}</p>
        </div>
        <div className="flex items-center px-5">
          <StatusChip status={status} />
        </div>
      </div>
    </>
  );
}
