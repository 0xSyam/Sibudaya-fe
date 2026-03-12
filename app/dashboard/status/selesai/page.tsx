import Image from "next/image";
import Link from "next/link";

type TimelineEntry = {
  title: string;
  description: string;
  details?: string[];
  attachmentLabel?: string;
  attachmentFile?: string;
};

const timelineEntries: TimelineEntry[] = [
  {
    title: "Pengisian Data Pendaftaran",
    description: "Data awal lembaga dan jenis fasilitas pentas telah berhasil diajukan.",
  },
  {
    title: "Pemeriksaan Data oleh Admin dan Penetapan Paket Fasilitas",
    description: "Data dan dokumen pengajuan telah diverifikasi dan dinyatakan sesuai ketentuan.",
    details: ["Nama Paket: Paket A", "Nilai Bantuan: Rp 30.000.000"],
  },
  {
    title: "Pengisian dan Penandatangan Surat Persetujuan",
    description: "Surat persetujuan telah diterima dan dikonfirmasi di Kantor Dinas Kebudayaan DIY.",
  },
  {
    title: "Pelaporan Kegiatan",
    description: "Laporan kegiatan telah diverifikasi dan dinyatakan sesuai ketentuan.",
    attachmentLabel: "Hasil Laporan:",
    attachmentFile: "Laporan Kegiatan Lorem Ipsum.pdf",
  },
  {
    title: "Pencairan Dana",
    description: "Dana fasilitasi telah dicairkan ke rekening lembaga budaya yang terdaftar.",
    details: ["Nomor Rekening: xxxxxxxxxxxx", "Nama Pemegang Rekening: xxxxxxxxxxxx"],
    attachmentLabel: "Bukti Pencairan:",
    attachmentFile: "Bukti Pencairan.pdf",
  },
];

function BackArrowIcon() {
  return (
    <svg
      width="12"
      height="20"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.828 6.778H16V8.778H3.828L9.192 14.142L7.778 15.556L0 7.778L7.778 0L9.192 1.414L3.828 6.778Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StatusChip() {
  return (
    <span className="inline-flex h-fit rounded-full bg-[rgba(114,225,40,0.16)] px-2 py-[2px] text-[13px] font-medium leading-5 text-[#72e128]">
      Selesai
    </span>
  );
}

function TimelineDot({ showLine }: { showLine: boolean }) {
  return (
    <div className="relative flex justify-center">
      <span className="z-[1] flex size-8 items-center justify-center rounded-full bg-[rgba(114,225,40,0.16)] text-[#72e128]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M20 6L9 17L4 12"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showLine ? <span className="absolute top-8 h-[calc(100%+24px)] w-px bg-[rgba(38,43,67,0.12)]" /> : null}
    </div>
  );
}

function PdfFileChip({ filename }: { filename: string }) {
  return (
    <div className="inline-flex items-center gap-[10px] rounded-[8px] bg-[rgba(38,43,67,0.06)] px-[10px] py-[5px]">
      <span className="inline-flex h-5 min-w-4 items-center justify-center rounded-[3px] bg-[#d61010] px-[2px] text-[8px] font-bold leading-none text-white">
        PDF
      </span>
      <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.7)]">{filename}</p>
    </div>
  );
}

export default function StatusSelesaiPage() {
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
                <div className="grid grid-cols-[360px_minmax(200px,1fr)_minmax(200px,1fr)_165px] border-b border-[rgba(38,43,67,0.12)] bg-[#f5f5f7]">
                  {["NAMA KEGIATAN", "KATEGORI", "TANGGAL PENGAJUAN", "STATUS"].map((heading, index) => (
                    <div
                      key={heading}
                      className={`px-5 py-3 ${index < 3 ? "border-r border-[rgba(38,43,67,0.12)]" : ""}`}
                    >
                      <p className="text-[13px] font-medium leading-6 tracking-[0.2px] text-[rgba(38,43,67,0.9)]">
                        {heading}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid h-[54px] grid-cols-[360px_minmax(200px,1fr)_minmax(200px,1fr)_165px] border-b border-[rgba(38,43,67,0.12)]">
                  <div className="flex items-center px-5">
                    <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
                      Sanggar Tribhuwana
                    </p>
                  </div>
                  <div className="flex items-center gap-3 px-5">
                    <span className="flex size-[30px] items-center justify-center rounded-full bg-[rgba(194,53,19,0.16)]">
                      <Image
                        src="/figma/shopping-bag-3-line.png"
                        alt=""
                        width={18}
                        height={18}
                        aria-hidden="true"
                        className="size-[18px]"
                      />
                    </span>
                    <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)]">Fasilitasi Pentas</p>
                  </div>
                  <div className="flex items-center px-5">
                    <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">17 Januari 2026</p>
                  </div>
                  <div className="flex items-center px-5">
                    <StatusChip />
                  </div>
                </div>

                <div className="px-5 py-4">
                  <div className="space-y-6">
                    {timelineEntries.map((entry, index) => (
                      <div key={entry.title} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 md:grid-cols-[160px_32px_minmax(0,1fr)] md:gap-5">
                        <div className="hidden items-start justify-end pt-3 md:flex">
                          <StatusChip />
                        </div>

                        <TimelineDot showLine={index < timelineEntries.length - 1} />

                        <article className="rounded-[10px] bg-white p-4 shadow-[0_4px_14px_0_rgba(38,43,67,0.16)] md:p-5">
                          <div className="mb-2 md:hidden">
                            <StatusChip />
                          </div>
                          <h2 className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
                            {entry.title}
                          </h2>
                          <p className="mt-4 text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                            {entry.description}
                          </p>

                          {entry.details ? (
                            <div className="mt-3 text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                              <p>Detail paket yang disetujui:</p>
                              <ul className="ml-[22px] list-disc">
                                {entry.details.map((detail) => (
                                  <li key={detail}>{detail}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {entry.attachmentLabel && entry.attachmentFile ? (
                            <div className="mt-4 space-y-2">
                              <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                                {entry.attachmentLabel}
                              </p>
                              <PdfFileChip filename={entry.attachmentFile} />
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
