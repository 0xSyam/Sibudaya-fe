"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { pengajuanApi, fasilitasiApi } from "@/app/lib/api";
import { buildProtectedFileUrl } from "@/app/lib/file-url";
import { pdfUploadValidation, validateUploadFile } from "@/app/lib/file-validation";
import { useToast } from "@/app/lib/toast-context";
import type { Pengajuan } from "@/app/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TimelineStatus = "completed" | "in_progress" | "locked" | "rejected";

type TimelineStep = {
  title: string;
  description: string;
  status: TimelineStatus;
  detailsTitle?: string;
  details?: string[];
  attachmentLabel?: string;
  attachmentFile?: string;
  scheduledDate?: string;
  canUploadLaporan?: boolean;
  attachmentPath?: string;
};

function buildUploadUrl(path: string): string {
  return buildProtectedFileUrl(path);
}

/* ------------------------------------------------------------------ */
/*  Timeline builder                                                   */
/* ------------------------------------------------------------------ */

function buildPentasTimeline(p: Pengajuan): TimelineStep[] {
  const steps: TimelineStep[] = [];

  // Step 1: Pengajuan - always completed once it exists
  steps.push({
    title: "Pengajuan Data Pendaftaran",
    description: "Data awal lembaga dan jenis fasilitas pentas telah berhasil diajukan.",
    status: "completed",
  });

  // Step 2: Pemeriksaan
  const pemeriksaanStatus = mapSubStatus(p.status_pemeriksaan, p.status);
  steps.push({
    title: "Pemeriksaan Data oleh Admin dan Penetapan Paket Fasilitas",
    description:
      pemeriksaanStatus === "completed"
        ? "Data dan dokumen pengajuan telah diverifikasi dan dinyatakan sesuai ketentuan."
        : pemeriksaanStatus === "rejected"
          ? `Pengajuan ditolak. ${p.catatan_pemeriksaan?.trim() || "Tidak ada alasan penolakan."}`
          : "Data pendaftaran telah berhasil dikirim dan sedang diperiksa oleh Admin Dinas Kebudayaan DIY untuk memastikan kelengkapan dan kesesuaian data.",
    status: pemeriksaanStatus,
    detailsTitle: pemeriksaanStatus === "completed" && p.paket_fasilitasi ? "Detail paket yang disetujui:" : undefined,
    details:
      pemeriksaanStatus === "completed" && p.paket_fasilitasi
        ? [
            `Nama Paket: ${p.paket_fasilitasi.nama_paket}`,
            ...(p.paket_fasilitasi.nilai_bantuan ? [`Nilai Bantuan: Rp ${Number(p.paket_fasilitasi.nilai_bantuan).toLocaleString("id-ID")}`] : []),
          ]
        : undefined,
  });

  // Step 3: Surat Persetujuan
  const suratStatus = p.surat_persetujuan ? mapSubStatus(p.surat_persetujuan.status, p.status) : deriveLockedOrNext(pemeriksaanStatus);
  steps.push({
    title: "Pengisian dan Penandatangan Surat Persetujuan",
    description:
      suratStatus === "completed"
        ? "Surat persetujuan telah diterima dan dikonfirmasi di Kantor Dinas Kebudayaan DIY."
        : "Surat persetujuan telah diterbitkan. Pemohon wajib mengunduh surat persetujuan dan melakukan penandatanganan secara langsung di Kantor Dinas Kebudayaan DIY.",
    status: suratStatus,
    attachmentLabel: p.surat_persetujuan?.file_path ? "Surat Persetujuan:" : undefined,
    attachmentFile: p.surat_persetujuan?.file_path ? extractFilename(p.surat_persetujuan.file_path) : undefined,
    attachmentPath: p.surat_persetujuan?.file_path ?? undefined,
  });

  // Step 4: Pelaporan Kegiatan
  const laporanStatus = p.laporan_kegiatan ? mapSubStatus(p.laporan_kegiatan.status, p.status) : deriveLockedOrNext(suratStatus);
  steps.push({
    title: "Pelaporan Kegiatan",
    description:
      laporanStatus === "completed"
        ? "Laporan kegiatan telah diverifikasi dan dinyatakan sesuai ketentuan."
        : laporanStatus === "rejected"
          ? `Laporan ditolak. ${p.laporan_kegiatan?.catatan_admin?.trim() || "Tidak ada alasan penolakan."}`
          : "Silakan unggah laporan dan dokumentasi kegiatan setelah pelaksanaan kegiatan selesai.",
    status: laporanStatus,
    canUploadLaporan: laporanStatus === "in_progress" || laporanStatus === "rejected",
    attachmentLabel: p.laporan_kegiatan?.file_laporan ? "Hasil Laporan:" : undefined,
    attachmentFile: p.laporan_kegiatan?.file_laporan ? extractFilename(p.laporan_kegiatan.file_laporan) : undefined,
    attachmentPath: p.laporan_kegiatan?.file_laporan ?? undefined,
  });

  // Step 5: Pencairan Dana
  const pencairanStatus = p.pencairan_dana ? mapSubStatus(p.pencairan_dana.status, p.status) : deriveLockedOrNext(laporanStatus);
  steps.push({
    title: "Pencairan Dana",
    description:
      pencairanStatus === "completed"
        ? "Dana fasilitasi telah dicairkan ke rekening lembaga budaya yang terdaftar."
        : "Proses pencairan dana sedang berlangsung ke rekening lembaga budaya yang terdaftar.",
    status: pencairanStatus,
    details:
      pencairanStatus === "completed" || pencairanStatus === "in_progress"
        ? [
            `Nomor Rekening: ${p.nomor_rekening ?? "-"}`,
            `Nama Pemegang Rekening: ${p.nama_pemegang_rekening ?? "-"}`,
          ]
        : undefined,
    attachmentLabel: p.pencairan_dana?.bukti_transfer ? "Bukti Pencairan:" : undefined,
    attachmentFile: p.pencairan_dana?.bukti_transfer ? extractFilename(p.pencairan_dana.bukti_transfer) : undefined,
    attachmentPath: p.pencairan_dana?.bukti_transfer ?? undefined,
  });

  return steps;
}

function buildHibahTimeline(p: Pengajuan): TimelineStep[] {
  const steps: TimelineStep[] = [];

  // Step 1: Pengisian Data
  steps.push({
    title: "Pengisian Data Pendaftaran",
    description: "Data awal lembaga dan jenis fasilitas hibah telah berhasil diajukan.",
    status: "completed",
  });

  // Step 2: Pemeriksaan
  const pemeriksaanStatus = mapSubStatus(p.status_pemeriksaan, p.status);
  steps.push({
    title: "Pemeriksaan Data oleh Admin",
    description:
      pemeriksaanStatus === "completed"
        ? "Data dan dokumen pengajuan telah diverifikasi dan dinyatakan sesuai ketentuan."
        : pemeriksaanStatus === "rejected"
          ? `Pengajuan ditolak. ${p.catatan_pemeriksaan?.trim() || "Tidak ada alasan penolakan."}`
          : "Data pendaftaran telah berhasil dikirim. Menunggu verifikasi oleh pihak Admin.",
    status: pemeriksaanStatus,
  });

  // Step 3: Survey Lapangan
  const surveyStatus = p.survey_lapangan ? mapSubStatus(p.survey_lapangan.status, p.status) : deriveLockedOrNext(pemeriksaanStatus);
  steps.push({
    title: "Survey Lapangan Oleh Pihak Dinas Kebudayaan",
    description:
      surveyStatus === "completed"
        ? "Survey lapangan telah selesai dilakukan oleh pihak Dinas Kebudayaan DIY."
        : surveyStatus === "rejected"
          ? `Survey lapangan ditolak. ${p.survey_lapangan?.catatan?.trim() || "Tidak ada alasan penolakan."}`
        : "Pihak Dinas Kebudayaan DIY akan melakukan survey lapangan sesuai lokasi yang sudah kirim pada tahap sebelumnya pada:",
    status: surveyStatus,
    scheduledDate: p.survey_lapangan?.tanggal_survey
      ? formatDate(p.survey_lapangan.tanggal_survey)
      : undefined,
  });

  const rejectedAtSurvey = p.status === "DITOLAK" && surveyStatus === "rejected";
  if (rejectedAtSurvey) return steps;

  // Step 4: Surat Persetujuan
  const suratStatus = p.surat_persetujuan ? mapSubStatus(p.surat_persetujuan.status, p.status) : deriveLockedOrNext(surveyStatus);
  steps.push({
    title: "Pengisian dan Penandatangan Surat Persetujuan",
    description:
      suratStatus === "completed"
        ? "Surat persetujuan telah diterima dan dikonfirmasi di Kantor Dinas Kebudayaan DIY."
        : "Surat persetujuan telah diterbitkan. Pemohon wajib mengunduh surat persetujuan dan melakukan penandatanganan secara langsung di Kantor Dinas Kebudayaan DIY.",
    status: suratStatus,
    attachmentLabel: p.surat_persetujuan?.file_path ? "Surat Persetujuan:" : undefined,
    attachmentFile: p.surat_persetujuan?.file_path ? extractFilename(p.surat_persetujuan.file_path) : undefined,
    attachmentPath: p.surat_persetujuan?.file_path ?? undefined,
  });

  // Step 5: Pengiriman Sarana Prasarana
  const pengirimanStatus = p.pengiriman_sarana ? mapSubStatus(p.pengiriman_sarana.status, p.status) : deriveLockedOrNext(suratStatus);
  steps.push({
    title: "Pengiriman Sarana Prasarana",
    description:
      pengirimanStatus === "completed"
        ? "Fasilitas hibah telah dikirim oleh Dinas Kebudayaan DIY ke alamat yang terdaftar."
        : pengirimanStatus === "rejected"
          ? `Pengiriman sarana ditolak. ${p.pengiriman_sarana?.catatan?.trim() || "Tidak ada alasan penolakan."}`
        : "Proses penyiapan dan pengiriman sarana dan prasarana sedang dilakukan oleh Dinas Kebudayaan DIY dan akan segera dikirim ke:",
    status: pengirimanStatus,
    details:
      pengirimanStatus === "in_progress"
        ? [
            `Nama Penerima: ${p.nama_penerima ?? "-"}`,
            `Alamat: ${[
              p.alamat_pengiriman,
              p.kelurahan_desa,
              p.kecamatan,
              p.kabupaten_kota,
              p.provinsi,
              p.kode_pos,
            ]
              .filter(Boolean)
              .join(", ") || "-"}`,
          ]
        : undefined,
    attachmentLabel: p.pengiriman_sarana?.bukti_pengiriman ? "Bukti Pengiriman:" : undefined,
    attachmentFile: p.pengiriman_sarana?.bukti_pengiriman ? extractFilename(p.pengiriman_sarana.bukti_pengiriman) : undefined,
    attachmentPath: p.pengiriman_sarana?.bukti_pengiriman ?? undefined,
  });

  // Step 6: Pelaporan Kegiatan
  const laporanStatus = p.laporan_kegiatan ? mapSubStatus(p.laporan_kegiatan.status, p.status) : deriveLockedOrNext(pengirimanStatus);
  steps.push({
    title: "Pelaporan Kegiatan",
    description:
      laporanStatus === "completed"
        ? "Laporan kegiatan telah diverifikasi dan dinyatakan sesuai ketentuan."
        : laporanStatus === "rejected"
          ? `Laporan ditolak. ${p.laporan_kegiatan?.catatan_admin?.trim() || "Tidak ada alasan penolakan."}`
          : "Silakan unggah laporan dan dokumentasi kegiatan setelah pelaksanaan kegiatan selesai.",
    status: laporanStatus,
    canUploadLaporan: laporanStatus === "in_progress" || laporanStatus === "rejected",
    attachmentLabel: p.laporan_kegiatan?.file_laporan ? "Hasil Laporan:" : undefined,
    attachmentFile: p.laporan_kegiatan?.file_laporan ? extractFilename(p.laporan_kegiatan.file_laporan) : undefined,
    attachmentPath: p.laporan_kegiatan?.file_laporan ?? undefined,
  });

  return steps;
}

function mapSubStatus(subStatus: string, overallStatus: string): TimelineStatus {
  if (overallStatus === "DITOLAK" && subStatus === "DITOLAK") return "rejected";
  if (subStatus === "SELESAI" || subStatus === "DISETUJUI") return "completed";
  if (subStatus === "DALAM_PROSES" || subStatus === "MENUNGGU") return "in_progress";
  if (subStatus === "DITOLAK") return "rejected";
  return "locked";
}

function deriveLockedOrNext(prevStatus: TimelineStatus): TimelineStatus {
  return prevStatus === "completed" ? "in_progress" : "locked";
}

function extractFilename(path: string): string {
  return path.split("/").pop() ?? path;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getOverallChipStatus(p: Pengajuan): TimelineStatus {
  if (p.status === "SELESAI") return "completed";
  if (p.status === "DITOLAK") return "rejected";
  return "in_progress";
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

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 10.586L16.95 5.636L18.364 7.05L13.414 12L18.364 16.95L16.95 18.364L12 13.414L7.05 18.364L5.636 16.95L10.586 12L5.636 7.05L7.05 5.636L12 10.586Z" fill="currentColor" />
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

function UploadCloudIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 19H20V12H22V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V12H4V19ZM13 9V16H11V9H6L12 3L18 9H13Z" fill="white" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Chip                                                        */
/* ------------------------------------------------------------------ */

function StatusChip({ status }: { status: TimelineStatus }) {
  const config: Record<TimelineStatus, { label: string; className: string }> = {
    completed: { label: "Selesai", className: "bg-[rgba(114,225,40,0.16)] text-[#72e128]" },
    in_progress: { label: "Dalam Proses", className: "bg-[rgba(253,181,40,0.16)] text-[#fdb528]" },
    locked: { label: "Belum Tersedia", className: "bg-[rgba(255,77,73,0.16)] text-[#ff4d49]" },
    rejected: { label: "Ditolak", className: "bg-[rgba(255,77,73,0.16)] text-[#ff4d49]" },
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
  const dotConfig: Record<TimelineStatus, { bgClass: string; colorClass: string; icon: React.ReactNode }> = {
    completed: { bgClass: "bg-[rgba(114,225,40,0.16)]", colorClass: "text-[#72e128]", icon: <CheckIcon /> },
    in_progress: { bgClass: "bg-[rgba(253,181,40,0.16)]", colorClass: "text-[#fdb528]", icon: <ClockIcon /> },
    locked: { bgClass: "bg-[rgba(255,77,73,0.16)]", colorClass: "text-[#ff4d49]", icon: <LockIcon /> },
    rejected: { bgClass: "bg-[rgba(255,77,73,0.16)]", colorClass: "text-[#ff4d49]", icon: <XIcon /> },
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
/*  PDF Chip                                                           */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function UserStatusDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();

  const [data, setData] = useState<Pengajuan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedLaporanFile, setSelectedLaporanFile] = useState<File | null>(null);
  const [templateLaporanUrl, setTemplateLaporanUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await pengajuanApi.getDetail(id);
      setData(result);
      setError(null);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String(err.message) : "Gagal memuat data pengajuan";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fasilitasiApi.getAll().then((list) => {
      const pentas = list.find((j) => j.jenis_fasilitasi_id === 1);
      setTemplateLaporanUrl(pentas?.template_laporan_file ?? null);
    }).catch(() => {/* silently ignore */});
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleSelectLaporanFile(file: File | null) {
    if (!file) {
      setSelectedLaporanFile(null);
      return;
    }

    const validationMessage = validateUploadFile(file, {
      ...pdfUploadValidation,
      label: "Laporan kegiatan",
    });

    if (validationMessage) {
      setSelectedLaporanFile(null);
      showToast("Laporan kegiatan wajib dalam format PDF", "error");
      return;
    }

    setSelectedLaporanFile(file);
  }

  async function handleUploadLaporan() {
    if (!data) return;

    if (!selectedLaporanFile) {
      showToast("Laporan kegiatan wajib diunggah", "error");
      return;
    }

    try {
      setUploading(true);
      await pengajuanApi.uploadLaporan(data.pengajuan_id, selectedLaporanFile);
      setSelectedLaporanFile(null);
      showToast("Laporan kegiatan berhasil diunggah.", "success");
      await fetchData();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String(err.message) : "Gagal mengunggah laporan";
      showToast(msg, "error");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <section className="flex h-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-[#c23513] border-t-transparent" />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-4 px-4">
        <p className="text-[15px] text-[rgba(38,43,67,0.7)]">{error ?? "Data tidak ditemukan"}</p>
        <Link
          href="/dashboard"
          className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[8px] bg-[#c23513] px-[22px] text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
        >
          Kembali ke Dashboard
        </Link>
      </section>
    );
  }

  const isPentas = data.jenis_fasilitasi_id === 1;
  const timeline = isPentas ? buildPentasTimeline(data) : buildHibahTimeline(data);
  const overallStatus = getOverallChipStatus(data);
  const kategori = isPentas ? "Fasilitasi Pentas" : "Fasilitasi Hibah";
  const namaKegiatan = data.lembaga_budaya?.nama_lembaga ?? data.judul_kegiatan ?? data.jenis_kegiatan ?? "-";
  const tanggalPengajuan = formatDate(data.tanggal_pengajuan);

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
                    <StatusChip status={overallStatus} />
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="px-5 py-4">
                  <div className="space-y-6">
                    {timeline.map((step, index) => (
                      <div key={step.title} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 md:grid-cols-[160px_32px_minmax(0,1fr)] md:gap-5">
                        <div className="hidden items-start justify-end pt-3 md:flex">
                          <StatusChip status={step.status} />
                        </div>

                        <TimelineDot status={step.status} showLine={index < timeline.length - 1} />

                        <article className="rounded-[10px] bg-white p-4 shadow-[0_4px_14px_0_rgba(38,43,67,0.16)] md:p-5">
                          <div className="mb-2 md:hidden">
                            <StatusChip status={step.status} />
                          </div>
                          <h2 className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
                            {step.title}
                          </h2>
                          {step.status !== "locked" && (
                            <p className="mt-4 text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                              {step.description}
                            </p>
                          )}

                          {step.details && (
                            <div className="mt-3 text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                              {step.detailsTitle ? <p>{step.detailsTitle}</p> : null}
                              <ul className="ml-[22px] list-disc">
                                {step.details.map((d) => (
                                  <li key={d}>{d}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {step.scheduledDate && (
                            <div className="mt-4">
                              <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                                Hari/Tanggal: <span className="font-semibold text-[rgba(38,43,67,0.9)]">{step.scheduledDate}</span>
                              </p>
                            </div>
                          )}

                          {step.title === "Pelaporan Kegiatan" && step.status !== "locked" && (
                            <div className="mt-4 space-y-2">
                              <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                                Contoh Laporan:
                              </p>
                              {templateLaporanUrl ? (
                                <a
                                  href={buildUploadUrl(templateLaporanUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex"
                                >
                                  <PdfFileChip filename={templateLaporanUrl.split("/").pop() ?? "Contoh Laporan Kegiatan.pdf"} />
                                </a>
                              ) : (
                                <PdfFileChip filename="Contoh Laporan Kegiatan.pdf" />
                              )}
                            </div>
                          )}

                          {step.title === "Pelaporan Kegiatan" && step.status !== "locked" && (
                            <div className="mt-4 space-y-2">
                              <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                                Hasil Laporan:
                              </p>
                              {step.attachmentFile && step.attachmentPath ? (
                                <a
                                  href={buildUploadUrl(step.attachmentPath)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex"
                                >
                                  <PdfFileChip filename={step.attachmentFile} />
                                </a>
                              ) : step.canUploadLaporan ? (
                                <div className="flex flex-col gap-2">
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] ?? null;
                                      handleSelectLaporanFile(file);
                                      e.currentTarget.value = "";
                                    }}
                                  />
                                  {selectedLaporanFile ? (
                                    <p className="text-[14px] text-[rgba(38,43,67,0.7)]">File dipilih: {selectedLaporanFile.name}</p>
                                  ) : null}
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      disabled={uploading}
                                      onClick={() => fileInputRef.current?.click()}
                                      className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-[rgba(38,43,67,0.22)] px-[20px] py-2 text-[15px] font-medium capitalize leading-[22px] text-[rgba(38,43,67,0.78)] transition-colors hover:bg-[rgba(38,43,67,0.04)] disabled:opacity-50"
                                    >
                                      Pilih File
                                    </button>
                                    <button
                                      type="button"
                                      disabled={uploading}
                                      onClick={() => handleUploadLaporan()}
                                      className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium capitalize leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10] disabled:opacity-50"
                                    >
                                      {uploading ? "Mengunggah..." : "Submit Laporan"}
                                      <UploadCloudIcon />
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}

                          {step.title !== "Pelaporan Kegiatan" && step.attachmentLabel && step.attachmentFile && (
                            <div className="mt-4 space-y-2">
                              <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                                {step.attachmentLabel}
                              </p>
                              {step.attachmentPath ? (
                                <a
                                  href={buildUploadUrl(step.attachmentPath)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex"
                                >
                                  <PdfFileChip filename={step.attachmentFile} />
                                </a>
                              ) : (
                                <PdfFileChip filename={step.attachmentFile} />
                              )}
                            </div>
                          )}
                        </article>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {data.surat_penolakan_file ? (
            <div className="mt-6 rounded-[10px] bg-white p-5 shadow-[0_4px_14px_0_rgba(38,43,67,0.16)]">
              <h2 className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
                Surat Penolakan
              </h2>
              <p className="mt-3 text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                Surat penolakan dari admin tersedia dan dapat diakses melalui tautan berikut.
              </p>
              <a
                href={buildUploadUrl(data.surat_penolakan_file)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center rounded-[8px] bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
              >
                Buka Surat Penolakan
              </a>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
