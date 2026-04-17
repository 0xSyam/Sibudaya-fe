import { StatusBackButton, StatusChip, TimelineDot } from "@/app/dashboard/components/status/timeline-ui";
import { SubmissionSummaryTable } from "@/app/dashboard/components/status/submission-summary-table";

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


function PdfFileChip({ filename }: { filename: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-lg bg-[rgba(38,43,67,0.06)] px-2.5 py-1.25">
      <span className="inline-flex h-5 min-w-4 items-center justify-center rounded-[3px] bg-[#d61010] px-0.5 text-[8px] font-bold leading-none text-white">
        PDF
      </span>
      <p className="text-[15px] font-medium leading-5.5 text-[rgba(38,43,67,0.7)]">{filename}</p>
    </div>
  );
}

export default function StatusSelesaiPage() {
  return (
    <section className="h-full overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-237.5 pb-10 pt-6 lg:pt-7">
        <StatusBackButton href="/dashboard" />

        <section className="mt-6">
          <h1 className="text-[28px] font-medium leading-10.5 text-[rgba(38,43,67,0.9)]">
            Status Pengajuan Fasilitasi
          </h1>
          <p className="mt-4 text-[13px] leading-5 text-[rgba(38,43,67,0.7)]">
            Pantau perkembangan pengajuan fasilitas pentas dan sarana prasarana yang telah Anda ajukan.
          </p>

          <div className="mt-4 overflow-hidden rounded-[10px] bg-white shadow-[0_4px_14px_0_rgba(38,43,67,0.16)]">
            <div className="overflow-x-auto">
              <div className="min-w-230">
                <SubmissionSummaryTable
                  namaKegiatan="Sanggar Tribhuwana"
                  kategori="Fasilitasi Pentas"
                  tanggalPengajuan="17 Januari 2026"
                  status="completed"
                  headerPaddingClass="py-3"
                />

                <div className="px-5 py-4">
                  <div className="space-y-6">
                    {timelineEntries.map((entry, index) => (
                      <div key={entry.title} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 md:grid-cols-[160px_32px_minmax(0,1fr)] md:gap-5">
                        <div className="hidden items-start justify-end pt-3 md:flex">
                          <StatusChip status="completed" />
                        </div>

                        <TimelineDot status="completed" showLine={index < timelineEntries.length - 1} />

                        <article className="rounded-[10px] bg-white p-4 shadow-[0_4px_14px_0_rgba(38,43,67,0.16)] md:p-5">
                          <div className="mb-2 md:hidden">
                            <StatusChip status="completed" />
                          </div>
                          <h2 className="text-[15px] font-medium leading-5.5 text-[rgba(38,43,67,0.9)]">
                            {entry.title}
                          </h2>
                          <p className="mt-4 text-[15px] leading-5.5 text-[rgba(38,43,67,0.7)]">
                            {entry.description}
                          </p>

                          {entry.details ? (
                            <div className="mt-3 text-[15px] leading-5.5 text-[rgba(38,43,67,0.7)]">
                              <p>Detail paket yang selesai diverifikasi:</p>
                              <ul className="ml-5.5 list-disc">
                                {entry.details.map((detail) => (
                                  <li key={detail}>{detail}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {entry.attachmentLabel && entry.attachmentFile ? (
                            <div className="mt-4 space-y-2">
                              <p className="text-[15px] leading-5.5 text-[rgba(38,43,67,0.7)]">
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
