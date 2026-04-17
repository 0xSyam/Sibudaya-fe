"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { adminPengajuanApi, fasilitasiApi } from "@/app/lib/api";
import { buildProtectedFileUrl } from "@/app/lib/file-url";
import { documentUploadValidation, pdfUploadValidation, validateUploadFile } from "@/app/lib/file-validation";
import { useToast } from "@/app/lib/toast-context";
import { StatusBackButton, StatusChip, TimelineDot } from "@/app/dashboard/components/status/timeline-ui";
import type { PaketFasilitasi, Pengajuan } from "@/app/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TimelineStatus = "completed" | "in_progress" | "locked" | "rejected";

type TimelineStepKey =
  | "PENDAFTARAN"
  | "PEMERIKSAAN"
  | "SURVEY"
  | "SURAT_PERSETUJUAN"
  | "PENGIRIMAN"
  | "PELAPORAN"
  | "PENCAIRAN";

type TimelineStep = {
  key: TimelineStepKey;
  title: string;
  description: string;
  status: TimelineStatus;
  detailsTitle?: string;
  details?: string[];
  secondaryDetails?: string[];
  attachmentLabel?: string;
  attachmentFile?: string;
  attachmentPath?: string;
  scheduledDate?: string;
  action?: StepAction;
};

type StepAction =
  | { type: "setujui_pemeriksaan" }
  | { type: "tolak_pemeriksaan" }
  | { type: "set_survey" }
  | { type: "selesaikan_survey" }
  | { type: "upload_surat" }
  | { type: "konfirmasi_surat" }
  | { type: "setujui_laporan" }
  | { type: "tolak_laporan" }
  | { type: "upload_pencairan" }
  | { type: "selesaikan_pencairan" }
  | { type: "upload_pengiriman" };

/* ------------------------------------------------------------------ */
/*  Timeline builder                                                   */
/* ------------------------------------------------------------------ */

function buildAdminPentasTimeline(p: Pengajuan): TimelineStep[] {
  const steps: TimelineStep[] = [];

  steps.push({
    key: "PENDAFTARAN",
    title: "Pengajuan Data Pendaftaran",
    description: "Data awal lembaga dan jenis fasilitas pentas telah berhasil diajukan.",
    status: "completed",
  });

  const pemStatus = mapSubStatus(p.status_pemeriksaan, p.status);
  steps.push({
    key: "PEMERIKSAAN",
    title: "Pemeriksaan Data oleh Admin dan Penetapan Paket Fasilitas",
    description:
      pemStatus === "completed"
        ? "Data dan dokumen pengajuan telah diverifikasi dan dinyatakan sesuai ketentuan."
        : pemStatus === "rejected"
          ? `Pengajuan ditolak. ${p.catatan_pemeriksaan?.trim() || "Tidak ada alasan penolakan."}`
          : "Data pendaftaran telah berhasil dikirim. Lihat data pengajuan untuk memastikan kelengkapan dan kesesuaian data.",
    status: pemStatus,
    detailsTitle: pemStatus === "completed" && p.paket_fasilitasi ? "Detail paket yang disetujui:" : undefined,
    details:
      pemStatus === "completed" && p.paket_fasilitasi
        ? [`Nama Paket: ${p.paket_fasilitasi.nama_paket}`, ...(p.paket_fasilitasi.nilai_bantuan ? [`Nilai Bantuan: Rp ${Number(p.paket_fasilitasi.nilai_bantuan).toLocaleString("id-ID")}`] : [])]
        : undefined,
    action: pemStatus === "in_progress" ? { type: "setujui_pemeriksaan" } : undefined,
  });

  const suratStatus = p.surat_persetujuan ? mapSubStatus(p.surat_persetujuan.status, p.status) : deriveNext(pemStatus);
  steps.push({
    key: "SURAT_PERSETUJUAN",
    title: "Pengisian dan Penandatangan Surat Persetujuan",
    description:
      suratStatus === "completed"
        ? "Surat persetujuan telah diterima dan dikonfirmasi di Kantor Dinas Kebudayaan DIY."
        : "Surat persetujuan telah diterbitkan. Pemohon wajib mengunduh surat persetujuan dan melakukan penandatanganan secara langsung di Kantor Dinas Kebudayaan DIY.",
    status: suratStatus,
    attachmentLabel: p.surat_persetujuan?.file_path ? "Surat Persetujuan:" : undefined,
    attachmentFile: p.surat_persetujuan?.file_path ? extractFilename(p.surat_persetujuan.file_path) : undefined,
    attachmentPath: p.surat_persetujuan?.file_path ?? undefined,
    action:
      suratStatus === "in_progress" && !p.surat_persetujuan
        ? { type: "upload_surat" }
        : suratStatus === "in_progress" && p.surat_persetujuan && p.surat_persetujuan.status !== "SELESAI"
          ? { type: "konfirmasi_surat" }
          : undefined,
  });

  const laporanStatus = p.laporan_kegiatan ? mapSubStatus(p.laporan_kegiatan.status, p.status) : deriveNext(suratStatus);
  steps.push({
    key: "PELAPORAN",
    title: "Pelaporan Kegiatan",
    description:
      laporanStatus === "completed"
        ? "Laporan kegiatan telah diverifikasi dan dinyatakan sesuai ketentuan."
        : laporanStatus === "rejected"
          ? `Laporan ditolak. ${p.laporan_kegiatan?.catatan_admin?.trim() || "Tidak ada alasan penolakan."}`
          : "Silakan unggah laporan dan dokumentasi kegiatan setelah pelaksanaan pentas selesai.",
    status: laporanStatus,
    attachmentLabel: p.laporan_kegiatan?.file_laporan ? "Hasil Laporan:" : undefined,
    attachmentFile: p.laporan_kegiatan?.file_laporan ? extractFilename(p.laporan_kegiatan.file_laporan) : undefined,
    attachmentPath: p.laporan_kegiatan?.file_laporan ?? undefined,
    secondaryDetails: !p.laporan_kegiatan?.file_laporan ? ["Pengaju belum menginput laporan"] : undefined,
    action:
      laporanStatus === "in_progress" && p.laporan_kegiatan?.file_laporan
        ? { type: "setujui_laporan" }
        : undefined,
  });

  const pencairanStatus = p.pencairan_dana ? mapSubStatus(p.pencairan_dana.status, p.status) : deriveNext(laporanStatus);
  steps.push({
    key: "PENCAIRAN",
    title: "Pencairan Dana",
    description:
      pencairanStatus === "completed"
        ? "Dana fasilitasi telah dicairkan ke rekening lembaga budaya yang terdaftar."
        : "Proses pencairan dana sedang dilakukan berdasarkan laporan kegiatan yang telah disetujui. Mohon menunggu.",
    status: pencairanStatus,
    details:
      pencairanStatus === "completed" || pencairanStatus === "in_progress"
        ? [`Nomor Rekening: ${p.nomor_rekening ?? "-"}`, `Nama Pemegang Rekening: ${p.nama_pemegang_rekening ?? "-"}`]
        : undefined,
    attachmentLabel: p.pencairan_dana?.bukti_transfer ? "Bukti Pencairan:" : undefined,
    attachmentFile: p.pencairan_dana?.bukti_transfer ? extractFilename(p.pencairan_dana.bukti_transfer) : undefined,
    attachmentPath: p.pencairan_dana?.bukti_transfer ?? undefined,
    action:
      pencairanStatus === "in_progress" && !p.pencairan_dana?.bukti_transfer
        ? { type: "upload_pencairan" }
        : pencairanStatus === "in_progress" && p.pencairan_dana?.bukti_transfer
          ? { type: "selesaikan_pencairan" }
          : undefined,
  });

  return steps;
}

function buildAdminHibahTimeline(p: Pengajuan): TimelineStep[] {
  const steps: TimelineStep[] = [];

  steps.push({
    key: "PENDAFTARAN",
    title: "Pengisian Data Pendaftaran",
    description: "Data awal lembaga dan jenis fasilitas hibah telah berhasil diajukan.",
    status: "completed",
  });

  const pemStatus = mapSubStatus(p.status_pemeriksaan, p.status);
  steps.push({
    key: "PEMERIKSAAN",
    title: "Pemeriksaan Data oleh Admin",
    description:
      pemStatus === "completed"
        ? "Data dan dokumen pengajuan telah diverifikasi dan dinyatakan sesuai ketentuan."
        : pemStatus === "rejected"
          ? `Pengajuan ditolak. ${p.catatan_pemeriksaan?.trim() || "Tidak ada alasan penolakan."}`
          : "Data pendaftaran telah berhasil dikirim dan sedang diperiksa oleh Admin Dinas Kebudayaan DIY untuk memastikan kelengkapan dan kesesuaian data.",
    status: pemStatus,
    action: pemStatus === "in_progress" ? { type: "setujui_pemeriksaan" } : undefined,
  });

  const surveyStatus = p.survey_lapangan ? mapSubStatus(p.survey_lapangan.status, p.status) : deriveNext(pemStatus);
  steps.push({
    key: "SURVEY",
    title: "Survey Lapangan Oleh Pihak Dinas Kebudayaan",
    description:
      surveyStatus === "completed"
        ? "Survey lapangan telah dilaksanakan oleh Dinas Kebudayaan DIY sesuai lokasi yang diajukan pada tahap sebelumnya."
        : surveyStatus === "rejected"
          ? `Survey lapangan ditolak. ${p.survey_lapangan?.catatan?.trim() || "Tidak ada alasan penolakan."}`
        : "Pihak Dinas Kebudayaan DIY akan melakukan survey lapangan sesuai lokasi yang diajukan pada tahap sebelumnya.",
    status: surveyStatus,
    scheduledDate: p.survey_lapangan?.tanggal_survey ? formatDate(p.survey_lapangan.tanggal_survey) : undefined,
    action:
      surveyStatus === "in_progress" && !p.survey_lapangan
        ? { type: "set_survey" }
        : surveyStatus === "in_progress" && p.survey_lapangan && p.survey_lapangan.status !== "SELESAI"
          ? { type: "selesaikan_survey" }
          : undefined,
  });

  const rejectedAtSurvey = p.status === "DITOLAK" && surveyStatus === "rejected";
  if (rejectedAtSurvey) return steps;

  const suratStatus = p.surat_persetujuan ? mapSubStatus(p.surat_persetujuan.status, p.status) : deriveNext(surveyStatus);
  steps.push({
    key: "SURAT_PERSETUJUAN",
    title: "Pengisian dan Penandatangan Surat Persetujuan",
    description:
      suratStatus === "completed"
        ? "Surat persetujuan telah diterima dan dikonfirmasi di Kantor Dinas Kebudayaan DIY."
        : "Surat persetujuan telah diterbitkan. Pemohon wajib mengunduh surat persetujuan dan melakukan penandatanganan secara langsung di Kantor Dinas Kebudayaan DIY.",
    status: suratStatus,
    attachmentLabel: p.surat_persetujuan?.file_path ? "Surat Persetujuan:" : undefined,
    attachmentFile: p.surat_persetujuan?.file_path ? extractFilename(p.surat_persetujuan.file_path) : undefined,
    attachmentPath: p.surat_persetujuan?.file_path ?? undefined,
    action:
      suratStatus === "in_progress" && !p.surat_persetujuan
        ? { type: "upload_surat" }
        : suratStatus === "in_progress" && p.surat_persetujuan && p.surat_persetujuan.status !== "SELESAI"
          ? { type: "konfirmasi_surat" }
          : undefined,
  });

  const pengirimanStatus = p.pengiriman_sarana ? mapSubStatus(p.pengiriman_sarana.status, p.status) : deriveNext(suratStatus);
  steps.push({
    key: "PENGIRIMAN",
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
    action: pengirimanStatus === "in_progress" ? { type: "upload_pengiriman" } : undefined,
  });

  const laporanStatus = p.laporan_kegiatan ? mapSubStatus(p.laporan_kegiatan.status, p.status) : deriveNext(pengirimanStatus);
  steps.push({
    key: "PELAPORAN",
    title: "Pelaporan Kegiatan",
    description:
      laporanStatus === "completed"
        ? "Laporan kegiatan telah diverifikasi dan dinyatakan sesuai ketentuan."
        : laporanStatus === "rejected"
          ? `Laporan ditolak. ${p.laporan_kegiatan?.catatan_admin?.trim() || "Tidak ada alasan penolakan."}`
          : "Silakan unggah laporan dan dokumentasi kegiatan saat fasilitas digunakan.",
    status: laporanStatus,
    attachmentLabel: p.laporan_kegiatan?.file_laporan ? "File Laporan:" : undefined,
    attachmentFile: p.laporan_kegiatan?.file_laporan ? extractFilename(p.laporan_kegiatan.file_laporan) : undefined,
    attachmentPath: p.laporan_kegiatan?.file_laporan ?? undefined,
    secondaryDetails: !p.laporan_kegiatan?.file_laporan ? ["Pengaju belum menginput laporan"] : undefined,
    action:
      laporanStatus === "in_progress" && p.laporan_kegiatan?.file_laporan
        ? { type: "setujui_laporan" }
        : undefined,
  });

  return steps;
}

function mapSubStatus(sub: string, overall: string): TimelineStatus {
  if (overall === "DITOLAK" && sub === "DITOLAK") return "rejected";
  if (sub === "SELESAI" || sub === "DISETUJUI") return "completed";
  if (sub === "DALAM_PROSES" || sub === "MENUNGGU") return "in_progress";
  if (sub === "DITOLAK") return "rejected";
  return "locked";
}

function deriveNext(prev: TimelineStatus): TimelineStatus {
  return prev === "completed" ? "in_progress" : "locked";
}

function extractFilename(path: string): string {
  return path.split("/").pop() ?? path;
}

function buildUploadUrl(path: string): string {
  return buildProtectedFileUrl(path);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function getOverallChipStatus(p: Pengajuan): TimelineStatus {
  if (p.status === "SELESAI") return "completed";
  if (p.status === "DITOLAK") return "rejected";
  return "in_progress";
}

function getAdminReviewStatus(p: Pengajuan): {
  label: string;
  className: string;
  description: string;
} {
  if (p.status === "DITOLAK") {
    return {
      label: "Ditolak",
      className: "bg-[rgba(255,77,73,0.16)] text-[#ff4d49]",
      description: "Review admin berakhir ditolak. Catatan dan surat penolakan tersimpan untuk lembaga budaya.",
    };
  }

  if (p.status === "SELESAI" || p.surat_persetujuan?.file_path) {
    return {
      label: "Selesai",
      className: "bg-[rgba(114,225,40,0.16)] text-[#58be15]",
      description: "Proses review admin selesai. Surat persetujuan telah diterbitkan pada pengajuan ini.",
    };
  }

  if (p.jenis_fasilitasi_id === 2 && p.survey_lapangan?.status === "SELESAI") {
    return {
      label: "Disetujui",
      className: "bg-[rgba(114,225,40,0.16)] text-[#58be15]",
      description: "Pengajuan telah disetujui pada tahap review admin dan siap dilanjutkan ke penerbitan surat persetujuan.",
    };
  }

  if (p.status_pemeriksaan === "SELESAI" || p.status_pemeriksaan === "DISETUJUI") {
    return {
      label: "Disetujui",
      className: "bg-[rgba(114,225,40,0.16)] text-[#58be15]",
      description: "Pengajuan telah disetujui pada tahap review admin dan siap dilanjutkan ke tahap berikutnya.",
    };
  }

  return {
    label: "Dalam Proses",
    className: "bg-[rgba(253,181,40,0.16)] text-[#fdb528]",
    description: "Pengajuan masih dalam proses review admin.",
  };
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return fallback;
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 19H20V12H22V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V12H4V19ZM13 9V16H11V9H6L12 3L18 9H13Z" fill="white" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  UI Components                                                      */
/* ------------------------------------------------------------------ */

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 8L14 12L10 16" stroke="rgba(38,43,67,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusBadgeControl({
  status,
  options,
  onSelect,
  disabled = false,
}: {
  status: TimelineStatus;
  options: TimelineStatus[];
  onSelect: (value: TimelineStatus) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (options.length === 0) {
    return <StatusChip status={status} />;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ChevronIcon />
        <StatusChip status={status} />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-10 min-w-[150px] rounded-[10px] bg-white p-2 shadow-[0_6px_20px_0_rgba(38,43,67,0.18)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className="flex w-full items-center justify-start px-2 py-1.5 hover:bg-[rgba(38,43,67,0.04)]"
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              <StatusChip status={option} />
            </button>
          ))}
        </div>
      ) : null}
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

function DataRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex gap-3">
      <dt className="w-[160px] shrink-0 text-[13px] text-[rgba(38,43,67,0.5)]">{label}</dt>
      <dd className="text-[14px] text-[rgba(38,43,67,0.9)]">{value ?? "-"}</dd>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  variant = "primary",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger" | "secondary";
}) {
  const bg =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : variant === "secondary"
        ? "border border-[rgba(38,43,67,0.18)] bg-white text-[rgba(38,43,67,0.78)] hover:bg-[rgba(38,43,67,0.04)]"
        : "bg-[#c23513] hover:bg-[#a62c10]";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex w-fit items-center justify-center gap-2 rounded-lg ${bg} px-[22px] py-2 text-[15px] font-medium leading-[22px] ${variant === "secondary" ? "shadow-none" : "text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)]"} transition-colors disabled:opacity-50`}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function AdminStatusDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();

  const [data, setData] = useState<Pengajuan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state for modals / inline inputs
  const [surveyDate, setSurveyDate] = useState("");
  const [tolakCatatan, setTolakCatatan] = useState("");
  const [tolakMode, setTolakMode] = useState<"pemeriksaan" | "laporan" | null>(null);
  const [tolakSuratFile, setTolakSuratFile] = useState<File | null>(null);
  const [tolakLaporanSuratFile, setTolakLaporanSuratFile] = useState<File | null>(null);
  const [paketId, setPaketId] = useState("");
  const [showPaketPicker, setShowPaketPicker] = useState(false);
  const [paketOptions, setPaketOptions] = useState<PaketFasilitasi[]>([]);
  const [rejectReasonError, setRejectReasonError] = useState<string | null>(null);
  const [timelineRejectStep, setTimelineRejectStep] = useState<TimelineStep | null>(null);
  const [timelineRejectReason, setTimelineRejectReason] = useState("");
  const [timelineRejectReasonError, setTimelineRejectReasonError] = useState<string | null>(null);
  const [timelineRejectSuratFile, setTimelineRejectSuratFile] = useState<File | null>(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; filename: string } | null>(null);
  const [selectedUploadFile, setSelectedUploadFile] = useState<{
    name: string;
    action: StepAction["type"];
  } | null>(null);
  const [pencairanTanggal, setPencairanTanggal] = useState("");
  const [pencairanTotalDana, setPencairanTotalDana] = useState("");
  const [pencairanFormError, setPencairanFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFileAction, setPendingFileAction] = useState<StepAction["type"] | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await adminPengajuanApi.getDetail(id);
      setData(result);
      setError(null);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String(err.message) : "Gagal memuat data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!data || data.jenis_fasilitasi_id !== 1) {
      setPaketOptions([]);
      return;
    }

    fasilitasiApi
      .getPaketByJenis(1)
      .then(setPaketOptions)
      .catch(() => setPaketOptions(data.jenis_fasilitasi?.paket_fasilitasi ?? []));
  }, [data]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPdfPreview(null);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const openPdfPreview = useCallback((url: string, filename: string) => {
    setPdfPreview({ url, filename });
  }, []);

  useEffect(() => {
    if (!data) {
      setPencairanTanggal("");
      setPencairanTotalDana("");
      setPencairanFormError(null);
      return;
    }

    setPencairanFormError(null);
    setPencairanTanggal((prev) => {
      if (prev) return prev;
      const existingTanggal = data.pencairan_dana?.tanggal_pencairan;
      if (typeof existingTanggal === "string" && existingTanggal.trim()) {
        return existingTanggal.split("T")[0];
      }
      return new Date().toISOString().split("T")[0];
    });
    setPencairanTotalDana((prev) => {
      if (prev) return prev;
      const existingTotal = data.pencairan_dana?.total_dana ?? data.total_pengajuan_dana;
      return existingTotal === undefined || existingTotal === null ? "" : String(existingTotal);
    });
  }, [data]);

  async function handleAction(actionType: StepAction["type"]) {
    if (!data) return;
    try {
      setActionLoading(true);
      switch (actionType) {
        case "setujui_pemeriksaan":
          if (data.jenis_fasilitasi_id === 1 && !paketId) {
            showToast("Pilih paket terlebih dahulu", "error");
            setActionLoading(false);
            return;
          }

          const selectedPaket = paketOptions.find((paket) => paket.paket_id === paketId);
          await adminPengajuanApi.setujui(data.pengajuan_id, {
            paket_id: paketId || undefined,
            catatan:
              data.jenis_fasilitasi_id === 1
                ? selectedPaket
                  ? `Data lengkap dan sesuai. ${selectedPaket.nama_paket}${selectedPaket.nilai_bantuan ? ` (Rp ${Number(selectedPaket.nilai_bantuan).toLocaleString("id-ID")})` : ""} ditetapkan.`
                  : "Data lengkap dan sesuai. Paket fasilitasi ditetapkan."
                : "Data dan dokumen telah diverifikasi sesuai ketentuan.",
          });
          setShowPaketPicker(false);
          break;
        case "tolak_pemeriksaan":
          if (!tolakCatatan.trim()) {
            setRejectReasonError("Alasan penolakan wajib diisi");
            setActionLoading(false);
            return;
          }
          await adminPengajuanApi.tolak(
            data.pengajuan_id,
            { catatan: tolakCatatan.trim() },
            tolakSuratFile ?? undefined,
          );
          setTolakMode(null);
          setTolakCatatan("");
          setTolakSuratFile(null);
          setRejectReasonError(null);
          break;
        case "set_survey":
          if (!surveyDate) {
            showToast("Pilih tanggal survey terlebih dahulu", "error");
            setActionLoading(false);
            return;
          }
          await adminPengajuanApi.setSurvey(data.pengajuan_id, {
            tanggal_survey: surveyDate,
          });
          setSurveyDate("");
          break;
        case "selesaikan_survey":
          await adminPengajuanApi.selesaikanSurvey(data.pengajuan_id);
          break;
        case "konfirmasi_surat":
          await adminPengajuanApi.konfirmasiSuratPersetujuan(data.pengajuan_id);
          break;
        case "setujui_laporan":
          await adminPengajuanApi.setujuiLaporan(data.pengajuan_id);
          break;
        case "tolak_laporan":
          if (!tolakCatatan.trim()) {
            setRejectReasonError("Alasan penolakan wajib diisi");
            setActionLoading(false);
            return;
          }
          await adminPengajuanApi.tolakLaporan(
            data.pengajuan_id,
            { catatan_admin: tolakCatatan.trim() },
            tolakLaporanSuratFile ?? undefined,
          );
          setTolakMode(null);
          setTolakCatatan("");
          setTolakLaporanSuratFile(null);
          setRejectReasonError(null);
          break;
        case "selesaikan_pencairan":
          if (!data.pencairan_dana?.bukti_transfer) {
            const message = "Bukti transfer wajib diunggah";
            setPencairanFormError(message);
            showToast(message, "error");
            setActionLoading(false);
            return;
          }
          await adminPengajuanApi.selesaikanPencairan(data.pengajuan_id);
          break;
        // File upload actions are handled in handleFileUpload
        default:
          break;
      }
      await fetchData();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String(err.message) : "Aksi gagal";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFileUpload(file: File, actionTypeOverride?: StepAction["type"]) {
    const currentAction = actionTypeOverride ?? pendingFileAction;
    if (!data || !currentAction) return;

    const validationConfig =
      currentAction === "upload_surat"
        ? { ...pdfUploadValidation, label: "Surat persetujuan" }
        : currentAction === "upload_pencairan"
          ? { ...documentUploadValidation, label: "Bukti pencairan" }
          : { ...documentUploadValidation, label: "Bukti pengiriman" };

    const validationMessage = validateUploadFile(file, validationConfig);
    if (validationMessage) {
      showToast(validationMessage, "error");
      setPendingFileAction(null);
      return;
    }

    if (currentAction === "upload_pencairan") {
      const parsedTotalDana = Number(pencairanTotalDana);
      if (!pencairanTotalDana.trim() || !Number.isFinite(parsedTotalDana) || parsedTotalDana <= 0) {
        setPencairanFormError("Total dana wajib diisi");
        showToast("Total dana wajib diisi", "error");
        setPendingFileAction(null);
        return;
      }

      if (!pencairanTanggal.trim()) {
        setPencairanFormError("Tanggal pencairan wajib diisi");
        showToast("Tanggal pencairan wajib diisi", "error");
        setPendingFileAction(null);
        return;
      }

      setPencairanFormError(null);
    }

    try {
      setActionLoading(true);
      switch (currentAction) {
        case "upload_surat":
          await adminPengajuanApi.uploadSuratPersetujuan(
            data.pengajuan_id,
            {
              tanggal_terbit: new Date().toISOString().split("T")[0],
            },
            file,
          );
          break;
        case "upload_pencairan":
          {
            const parsedTotalDana = Number(pencairanTotalDana);
            await adminPengajuanApi.uploadBuktiPencairan(
              data.pengajuan_id,
              { tanggal_pencairan: pencairanTanggal, total_dana: parsedTotalDana },
              file,
            );
          }
          break;
        case "upload_pengiriman":
          await adminPengajuanApi.uploadBuktiPengiriman(
            data.pengajuan_id,
            {
              tanggal_pengiriman: new Date().toISOString().split("T")[0],
            },
            file,
          );
          break;
      }
      setPendingFileAction(null);
      await fetchData();
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Upload gagal");
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  }

  function triggerFileUpload(actionType: StepAction["type"]) {
    setPendingFileAction(actionType);
    fileInputRef.current?.click();
  }

  function renderSelectedFileInfo(actionType: StepAction["type"]) {
    if (!selectedUploadFile || selectedUploadFile.action !== actionType) return null;

    return (
      <div className="inline-flex max-w-full items-center gap-2 rounded-[8px] border border-[rgba(38,43,67,0.14)] bg-[rgba(38,43,67,0.04)] px-3 py-2">
        <span className="inline-flex h-5 min-w-4 items-center justify-center rounded-[3px] bg-[#d61010] px-[2px] text-[8px] font-bold leading-none text-white">
          FILE
        </span>
        <p className="truncate text-[14px] leading-5 text-[rgba(38,43,67,0.72)]" title={selectedUploadFile.name}>
          File dipilih: <span className="font-medium text-[rgba(38,43,67,0.9)]">{selectedUploadFile.name}</span>
        </p>
      </div>
    );
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
          href="/dashboard/admin"
          className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[8px] bg-[#c23513] px-[22px] text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
        >
          Kembali
        </Link>
      </section>
    );
  }

  const isPentas = data.jenis_fasilitasi_id === 1;
  const timeline = isPentas ? buildAdminPentasTimeline(data) : buildAdminHibahTimeline(data);
  const overallStatus = getOverallChipStatus(data);
  const reviewStatus = getAdminReviewStatus(data);
  const kategori = isPentas ? "Fasilitasi Pentas" : "Fasilitasi Hibah";
  const namaKegiatan = data.lembaga_budaya?.nama_lembaga ?? data.judul_kegiatan ?? data.jenis_kegiatan ?? "-";
  const tanggalPengajuan = formatDate(data.tanggal_pengajuan);

  function getSelectableStatuses(step: TimelineStep): TimelineStatus[] {
    if (step.key === "PENDAFTARAN") {
      return [];
    }

    const rejectableSteps: TimelineStepKey[] = ["PEMERIKSAAN", "SURVEY", "PENGIRIMAN", "PELAPORAN"];
    if (rejectableSteps.includes(step.key)) {
      return ["in_progress", "completed", "rejected"];
    }

    return ["in_progress", "completed"];
  }

  function mapStepKeyToApi(stepKey: TimelineStepKey): "PEMERIKSAAN" | "SURVEY" | "SURAT_PERSETUJUAN" | "PENGIRIMAN" | "PELAPORAN" | "PENCAIRAN" | null {
    if (stepKey === "PENDAFTARAN") return null;
    return stepKey;
  }

  function mapTimelineStatusToApi(status: TimelineStatus): "IN_PROGRESS" | "COMPLETED" | "REJECTED" {
    if (status === "completed") return "COMPLETED";
    if (status === "rejected") return "REJECTED";
    return "IN_PROGRESS";
  }

  function handleBadgeStatusChange(step: TimelineStep, nextStatus: TimelineStatus) {
    if (!data) return;
    const apiStep = mapStepKeyToApi(step.key);
    if (!apiStep) return;

    if (step.key === "PENCAIRAN" && nextStatus === "completed" && !data.pencairan_dana?.bukti_transfer) {
      const message = "Bukti transfer wajib diunggah";
      setPencairanFormError(message);
      showToast(message, "error");
      return;
    }

    if (nextStatus === "rejected") {
      setTimelineRejectStep(step);
      setTimelineRejectReason("");
      setTimelineRejectReasonError(null);
      setTimelineRejectSuratFile(null);
      return;
    }

    void (async () => {
      try {
        setActionLoading(true);
        await adminPengajuanApi.updateTimelineStatus(data.pengajuan_id, {
          step: apiStep,
          status: mapTimelineStatusToApi(nextStatus),
          note: undefined,
        });
        await fetchData();
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err, "Gagal mengubah status timeline");
        showToast(msg, "error");
      } finally {
        setActionLoading(false);
      }
    })();
  }

  function submitTimelineReject() {
    if (!data || !timelineRejectStep) return;

    const reason = timelineRejectReason.trim();
    if (!reason) {
      setTimelineRejectReasonError("Alasan penolakan wajib diisi");
      return;
    }

    void (async () => {
      try {
        setActionLoading(true);
        setTimelineRejectReasonError(null);
        if (timelineRejectStep.key === "PEMERIKSAAN") {
          await adminPengajuanApi.tolak(
            data.pengajuan_id,
            { catatan: reason },
            timelineRejectSuratFile ?? undefined,
          );
        } else if (timelineRejectStep.key === "SURVEY") {
          await adminPengajuanApi.tolakSurvey(data.pengajuan_id, reason);
        } else {
          const apiStep = mapStepKeyToApi(timelineRejectStep.key);
          if (!apiStep) return;

          await adminPengajuanApi.updateTimelineStatus(data.pengajuan_id, {
            step: apiStep,
            status: "REJECTED",
            note: reason,
          });
        }

        setTimelineRejectStep(null);
        setTimelineRejectReason("");
        setTimelineRejectSuratFile(null);
        await fetchData();
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err, "Gagal mengubah status timeline");
        showToast(msg, "error");
      } finally {
        setActionLoading(false);
      }
    })();
  }

  function renderStepActions(step: TimelineStep) {
    if (!step.action) return null;
    const { type } = step.action;

    switch (type) {
      case "setujui_pemeriksaan":
        return (
          <div className="mt-4 space-y-3">
            <div>
              <button
                type="button"
                onClick={() => setShowDataModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#c23513] px-[18px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
              >
                Lihat Data Pengajuan
                <UploadIcon />
              </button>
            </div>
            {tolakMode === "pemeriksaan" ? (
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <input
                    type="text"
                    value={tolakCatatan}
                    onChange={(e) => {
                      setTolakCatatan(e.target.value);
                      setRejectReasonError(null);
                    }}
                    placeholder="Alasan penolakan"
                    className="w-full max-w-[250px] rounded-lg border border-[rgba(38,43,67,0.22)] px-3 py-2 text-[15px] outline-none"
                  />
                  {rejectReasonError ? <p className="mt-1 text-[13px] text-red-500">{rejectReasonError}</p> : null}
                </div>
                <label className="flex h-[42px] cursor-pointer items-center rounded-lg border border-[rgba(38,43,67,0.22)] px-3 text-[14px] text-[rgba(38,43,67,0.72)]">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] ?? null;
                      if (!selectedFile) {
                        setTolakSuratFile(null);
                        return;
                      }

                      const validationMessage = validateUploadFile(selectedFile, {
                        ...pdfUploadValidation,
                        label: "Surat penolakan",
                      });

                      if (validationMessage) {
                        setTolakSuratFile(null);
                        showToast(validationMessage, "error");
                        e.currentTarget.value = "";
                        return;
                      }

                      setTolakSuratFile(selectedFile);
                    }}
                  />
                  {tolakSuratFile ? `Surat: ${tolakSuratFile.name}` : "Lampiran surat penolakan (opsional)"}
                </label>
                <ActionButton label="Konfirmasi Tolak" variant="danger" onClick={() => handleAction("tolak_pemeriksaan")} disabled={actionLoading} />
                <ActionButton
                  label="Batal"
                  variant="secondary"
                  onClick={() => {
                    setTolakMode(null);
                    setTolakCatatan("");
                    setTolakSuratFile(null);
                    setRejectReasonError(null);
                  }}
                  disabled={actionLoading}
                />
              </div>
            ) : null}
          </div>
        );

      case "set_survey":
        return (
          <div className="mt-4 space-y-3">
            <label className="block text-[13px] text-[rgba(38,43,67,0.7)]">Tentukan tanggal survey lapangan:</label>
            <input
              type="date"
              value={surveyDate}
              onChange={(e) => setSurveyDate(e.target.value)}
              className="w-full max-w-[300px] rounded-lg border border-[rgba(38,43,67,0.22)] px-3 py-2 text-[15px] outline-none"
            />
          </div>
        );

      case "selesaikan_survey":
        return null;

      case "upload_surat":
        return (
          <div className="mt-4 space-y-3">
            {renderSelectedFileInfo("upload_surat")}
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => triggerFileUpload("upload_surat")}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10] disabled:opacity-50"
            >
              {step.attachmentFile ? "Unggah Ulang" : "Unggah Berkas"}
              <UploadIcon />
            </button>
          </div>
        );

      case "konfirmasi_surat":
        return (
          <div className="mt-4 flex flex-wrap gap-2">
            {renderSelectedFileInfo("upload_surat")}
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => triggerFileUpload("upload_surat")}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-[rgba(38,43,67,0.22)] px-[20px] py-2 text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.78)] transition-colors hover:bg-[rgba(38,43,67,0.04)] disabled:opacity-50"
            >
              Unggah Ulang
            </button>
            <ActionButton
              label="Konfirmasi Surat"
              onClick={() => handleAction("konfirmasi_surat")}
              disabled={actionLoading}
            />
          </div>
        );

      case "setujui_laporan":
        return tolakMode === "laporan" ? (
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <input
                  type="text"
                  value={tolakCatatan}
                  onChange={(e) => {
                    setTolakCatatan(e.target.value);
                    setRejectReasonError(null);
                  }}
                  placeholder="Alasan penolakan"
                  className="w-full max-w-[250px] rounded-lg border border-[rgba(38,43,67,0.22)] px-3 py-2 text-[15px] outline-none"
                />
                {rejectReasonError ? <p className="mt-1 text-[13px] text-red-500">{rejectReasonError}</p> : null}
              </div>
              <label className="flex h-[42px] cursor-pointer items-center rounded-lg border border-[rgba(38,43,67,0.22)] px-3 text-[14px] text-[rgba(38,43,67,0.72)]">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0] ?? null;
                    if (!selectedFile) {
                      setTolakLaporanSuratFile(null);
                      return;
                    }

                    const validationMessage = validateUploadFile(selectedFile, {
                      ...pdfUploadValidation,
                      label: "Surat penolakan",
                    });

                    if (validationMessage) {
                      setTolakLaporanSuratFile(null);
                      showToast(validationMessage, "error");
                      e.currentTarget.value = "";
                      return;
                    }

                    setTolakLaporanSuratFile(selectedFile);
                  }}
                />
                {tolakLaporanSuratFile
                  ? `Surat: ${tolakLaporanSuratFile.name}`
                  : "Lampiran surat penolakan (opsional)"}
              </label>
              <ActionButton label="Konfirmasi Tolak" variant="danger" onClick={() => handleAction("tolak_laporan")} disabled={actionLoading} />
              <ActionButton
                label="Batal"
                variant="secondary"
                onClick={() => {
                  setTolakMode(null);
                  setTolakCatatan("");
                  setTolakLaporanSuratFile(null);
                  setRejectReasonError(null);
                }}
                disabled={actionLoading}
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton label="Setujui Laporan" onClick={() => handleAction("setujui_laporan")} disabled={actionLoading} />
            <ActionButton
              label="Tolak Laporan"
              variant="danger"
              onClick={() => {
                setTolakMode("laporan");
                setRejectReasonError(null);
                setTolakCatatan("");
                setTolakLaporanSuratFile(null);
              }}
              disabled={actionLoading}
            />
          </div>
        );

      case "upload_pencairan":
        return (
          <div className="mt-4 space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-[13px] text-[rgba(38,43,67,0.7)]">
                Tanggal pencairan
                <input
                  type="date"
                  value={pencairanTanggal}
                  onChange={(e) => {
                    setPencairanTanggal(e.target.value);
                    setPencairanFormError(null);
                  }}
                  className="rounded-lg border border-[rgba(38,43,67,0.22)] px-3 py-2 text-[14px] text-[rgba(38,43,67,0.9)] outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-[13px] text-[rgba(38,43,67,0.7)]">
                Total dana
                <input
                  type="number"
                  min={1}
                  value={pencairanTotalDana}
                  onChange={(e) => {
                    setPencairanTotalDana(e.target.value);
                    setPencairanFormError(null);
                  }}
                  placeholder="Masukkan total dana"
                  className="rounded-lg border border-[rgba(38,43,67,0.22)] px-3 py-2 text-[14px] text-[rgba(38,43,67,0.9)] outline-none"
                />
              </label>
            </div>
            {pencairanFormError ? <p className="text-[13px] text-red-500">{pencairanFormError}</p> : null}
            <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">Bukti Pencairan:</p>
            {renderSelectedFileInfo("upload_pencairan")}
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => triggerFileUpload("upload_pencairan")}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10] disabled:opacity-50"
            >
              {step.attachmentFile ? "Unggah Ulang" : "Unggah Berkas"}
              <UploadIcon />
            </button>
          </div>
        );

      case "selesaikan_pencairan":
        return (
          <div className="mt-4 flex flex-wrap gap-2">
            {renderSelectedFileInfo("upload_pencairan")}
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => triggerFileUpload("upload_pencairan")}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-[rgba(38,43,67,0.22)] px-[20px] py-2 text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.78)] transition-colors hover:bg-[rgba(38,43,67,0.04)] disabled:opacity-50"
            >
              Unggah Ulang
            </button>
            <ActionButton
              label="Selesaikan Pencairan"
              onClick={() => handleAction("selesaikan_pencairan")}
              disabled={actionLoading}
            />
          </div>
        );

      case "upload_pengiriman":
        return (
          <div className="mt-4 space-y-2">
            {renderSelectedFileInfo("upload_pengiriman")}
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => triggerFileUpload("upload_pengiriman")}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10] disabled:opacity-50"
            >
              {selectedUploadFile?.action === "upload_pengiriman" || step.attachmentFile ? "Unggah Ulang" : "Unggah Berkas"}
              <UploadIcon />
            </button>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <section className="h-full overflow-y-auto px-4 py-6 sm:px-6">
      {timelineRejectStep ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[520px] rounded-[12px] bg-white p-6 shadow-[0_24px_60px_rgba(22,35,71,0.22)]">
            <h2 className="text-[20px] font-semibold text-[rgba(38,43,67,0.9)]">Alasan Penolakan</h2>
            <p className="mt-2 text-[14px] text-[rgba(38,43,67,0.7)]">
              Isi alasan penolakan.
            </p>

            <textarea
              value={timelineRejectReason}
              onChange={(e) => {
                setTimelineRejectReason(e.target.value);
                setTimelineRejectReasonError(null);
              }}
              placeholder="Tulis alasan penolakan"
              rows={4}
              className="mt-4 w-full rounded-lg border border-[rgba(38,43,67,0.22)] px-3 py-2 text-[15px] outline-none"
            />
            {timelineRejectReasonError ? <p className="mt-1 text-[13px] text-red-500">{timelineRejectReasonError}</p> : null}

            {timelineRejectStep.key === "PEMERIKSAAN" ? (
              <div className="mt-3 space-y-2">
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] ?? null;
                      if (!selectedFile) {
                        setTimelineRejectSuratFile(null);
                        return;
                      }

                      const validationMessage = validateUploadFile(selectedFile, {
                        ...pdfUploadValidation,
                        label: "Surat penolakan",
                      });

                      if (validationMessage) {
                        setTimelineRejectSuratFile(null);
                        showToast(validationMessage, "error");
                        e.currentTarget.value = "";
                        return;
                      }

                      setTimelineRejectSuratFile(selectedFile);
                    }}
                  />

                  <div className="rounded-xl border border-dashed border-[rgba(38,43,67,0.28)] bg-[rgba(38,43,67,0.02)] px-4 py-3 transition-colors hover:border-[#c23513] hover:bg-[rgba(194,53,19,0.04)]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-[rgba(38,43,67,0.9)]">
                          Lampiran surat penolakan (opsional)
                        </p>
                        <p className="mt-0.5 truncate text-[13px] text-[rgba(38,43,67,0.64)]">
                          {timelineRejectSuratFile ? timelineRejectSuratFile.name : "Klik untuk unggah file PDF"}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#c23513] px-3 py-1.5 text-[13px] font-medium text-white">
                        {timelineRejectSuratFile ? "Ganti File" : "Pilih File"}
                      </span>
                    </div>
                  </div>
                </label>

                {timelineRejectSuratFile ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setTimelineRejectSuratFile(null)}
                      className="text-[13px] font-medium text-[rgba(38,43,67,0.62)] underline underline-offset-2 hover:text-[rgba(38,43,67,0.9)]"
                    >
                      Hapus file
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <ActionButton
                label="Batal"
                variant="secondary"
                onClick={() => {
                  setTimelineRejectStep(null);
                  setTimelineRejectReason("");
                  setTimelineRejectReasonError(null);
                  setTimelineRejectSuratFile(null);
                }}
                disabled={actionLoading}
              />
              <ActionButton label="Konfirmasi Tolak" variant="danger" onClick={submitTimelineReject} disabled={actionLoading} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Data Pengajuan Modal */}
      {showDataModal && data && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8"
          onClick={() => setShowDataModal(false)}
        >
          <div
            className="relative w-full max-w-[640px] rounded-[14px] bg-white shadow-[0_24px_60px_rgba(22,35,71,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[rgba(38,43,67,0.10)] px-6 py-5">
              <h2 className="text-[18px] font-semibold text-[rgba(38,43,67,0.9)]">Data Pengajuan</h2>
              <button
                type="button"
                onClick={() => setShowDataModal(false)}
                className="flex size-8 items-center justify-center rounded-full text-[rgba(38,43,67,0.5)] hover:bg-[rgba(38,43,67,0.06)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 px-6 py-5">
              {/* Data Lembaga */}
              {data.lembaga_budaya && (
                <section>
                  <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-[rgba(38,43,67,0.5)]">Data Lembaga Budaya</h3>
                  <dl className="space-y-3">
                    <DataRow label="Nama Lembaga" value={data.lembaga_budaya.nama_lembaga} />
                    <DataRow label="Jenis Kesenian" value={data.lembaga_budaya.jenis_kesenian} />
                    <DataRow label="Alamat" value={data.lembaga_budaya.alamat} />
                    <DataRow label="No. HP" value={data.lembaga_budaya.no_hp} />
                    <DataRow label="Email" value={data.lembaga_budaya.email} />
                  </dl>
                </section>
              )}

              {/* Data Pengajuan Hibah */}
              {!isPentas && (
                <section>
                  <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-[rgba(38,43,67,0.5)]">Data Pengiriman</h3>
                  <dl className="space-y-3">
                    <DataRow label="Nama Penerima" value={data.nama_penerima} />
                    <DataRow label="Alamat Pengiriman" value={data.alamat_pengiriman} />
                    {data.kelurahan_desa && <DataRow label="Kelurahan / Desa" value={data.kelurahan_desa} />}
                    {data.kecamatan && <DataRow label="Kecamatan" value={data.kecamatan} />}
                    {data.kabupaten_kota && <DataRow label="Kabupaten / Kota" value={data.kabupaten_kota} />}
                    {data.provinsi && <DataRow label="Provinsi" value={data.provinsi} />}
                    {data.kode_pos && <DataRow label="Kode Pos" value={data.kode_pos} />}
                  </dl>
                </section>
              )}

              {/* Dokumen */}
              <section>
                <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-[rgba(38,43,67,0.5)]">Dokumen</h3>
                <div className="space-y-2">
                  {data.proposal_file && (
                    <button
                      type="button"
                      onClick={() => openPdfPreview(buildUploadUrl(data.proposal_file), data.proposal_file.split("/").pop() ?? "Proposal")}
                      className="inline-flex items-center gap-[10px] rounded-[8px] bg-[rgba(38,43,67,0.06)] px-[10px] py-[5px] hover:bg-[rgba(38,43,67,0.10)]"
                    >
                      <span className="inline-flex h-5 min-w-4 items-center justify-center rounded-[3px] bg-[#d61010] px-[2px] text-[8px] font-bold leading-none text-white">PDF</span>
                      <span className="text-[15px] font-medium text-[rgba(38,43,67,0.7)]">{data.proposal_file.split("/").pop() ?? "Proposal"}</span>
                    </button>
                  )}
                  {data.sertifikat_nik_file && (
                    <button
                      type="button"
                      onClick={() => openPdfPreview(buildUploadUrl(data.sertifikat_nik_file), data.sertifikat_nik_file.split("/").pop() ?? "Sertifikat NIK")}
                      className="inline-flex items-center gap-[10px] rounded-[8px] bg-[rgba(38,43,67,0.06)] px-[10px] py-[5px] hover:bg-[rgba(38,43,67,0.10)]"
                    >
                      <span className="inline-flex h-5 min-w-4 items-center justify-center rounded-[3px] bg-[#d61010] px-[2px] text-[8px] font-bold leading-none text-white">PDF</span>
                      <span className="text-[15px] font-medium text-[rgba(38,43,67,0.7)]">{data.sertifikat_nik_file.split("/").pop() ?? "Sertifikat NIK"}</span>
                    </button>
                  )}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="border-t border-[rgba(38,43,67,0.10)] px-6 py-4">
              <button
                type="button"
                onClick={() => setShowDataModal(false)}
                className="inline-flex h-[38px] items-center justify-center rounded-[8px] border border-[rgba(38,43,67,0.22)] px-5 text-[15px] font-medium text-[rgba(38,43,67,0.78)] hover:bg-[rgba(38,43,67,0.04)]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {pdfPreview ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={() => setPdfPreview(null)}
        >
          <div
            className="flex h-full max-h-[92vh] w-full max-w-[1000px] flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_24px_60px_rgba(22,35,71,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[rgba(38,43,67,0.10)] px-4 py-3 sm:px-6">
              <p className="truncate pr-4 text-[15px] font-medium text-[rgba(38,43,67,0.9)]">{pdfPreview.filename}</p>
              <div className="flex items-center gap-2">
                <a
                  href={pdfPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[34px] items-center justify-center rounded-[8px] border border-[rgba(38,43,67,0.2)] px-3 text-[13px] font-medium text-[rgba(38,43,67,0.78)] hover:bg-[rgba(38,43,67,0.04)]"
                >
                  Buka Tab Baru
                </a>
                <button
                  type="button"
                  onClick={() => setPdfPreview(null)}
                  className="inline-flex size-8 items-center justify-center rounded-full text-[rgba(38,43,67,0.5)] hover:bg-[rgba(38,43,67,0.06)]"
                >
                  ✕
                </button>
              </div>
            </div>

            <iframe
              src={pdfPreview.url}
              title={`Preview ${pdfPreview.filename}`}
              className="h-full w-full bg-[rgba(38,43,67,0.03)]"
            />
          </div>
        </div>
      ) : null}

      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (pendingFileAction) {
              setSelectedUploadFile({ name: file.name, action: pendingFileAction });
            }
            handleFileUpload(file);
          }
          e.target.value = "";
        }}
      />

      {showPaketPicker && isPentas ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-[594px] rounded-[10px] bg-white p-6 shadow-[0_24px_60px_rgba(22,35,71,0.22)]">
            <h2 className="text-center text-[28px] font-bold leading-[42px] text-[rgba(38,43,67,0.9)]">Pilih Paket</h2>
            <p className="mt-1 text-center text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
              Tetapkan paket yang sesuai dengan pengajuan
            </p>

            <div className="mt-6 space-y-2.5">
              {paketOptions.map((paket) => {
                const isSelected = paketId === paket.paket_id;
                return (
                  <button
                    key={paket.paket_id}
                    type="button"
                    onClick={() => setPaketId(paket.paket_id)}
                    className={`flex w-full items-center gap-3 rounded-[10px] border px-4 py-4 text-left transition-colors ${
                      isSelected
                        ? "border-[#c23513] bg-[rgba(194,53,19,0.02)]"
                        : "border-[rgba(38,43,67,0.12)] bg-white"
                    }`}
                  >
                    <span className={`flex size-4 items-center justify-center rounded-full border-2 ${isSelected ? "border-[#c23513]" : "border-[#6d7285]"}`}>
                      <span className={`size-1.5 rounded-full ${isSelected ? "bg-[#c23513]" : "bg-transparent"}`} />
                    </span>
                    <span className="text-[17px] leading-[26px] text-[rgba(38,43,67,0.9)]">
                      {paket.nama_paket}
                      {paket.nilai_bantuan ? (
                        <span className="font-medium text-[#c23513]"> {`(Rp ${Number(paket.nilai_bantuan).toLocaleString("id-ID")})`}</span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowPaketPicker(false);
                  setPaketId("");
                }}
                className="inline-flex items-center justify-center rounded-[10px] border border-[#c23513] px-6 py-2 text-[17px] font-medium leading-[26px] text-[#c23513]"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={!paketId || actionLoading}
                onClick={async () => {
                  await handleAction("setujui_pemeriksaan");
                  setShowPaketPicker(false);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#c23513] px-6 py-2 text-[17px] font-medium leading-[26px] text-white disabled:opacity-50"
              >
                Pilih Paket
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-[950px] pb-10 pt-6 lg:pt-[28px]">
        <StatusBackButton href="/dashboard/admin" />

        <section className="mt-6">
          <h1 className="text-[28px] font-medium leading-[42px] text-[rgba(38,43,67,0.9)]">
            Status Pengajuan Fasilitasi
          </h1>
          <p className="mt-4 text-[13px] leading-5 text-[rgba(38,43,67,0.7)]">
            Kelola dan perbarui status pengajuan fasilitas lembaga budaya.
          </p>

          <div className="mt-4 rounded-[10px] bg-white p-5 shadow-[0_4px_14px_0_rgba(38,43,67,0.16)]">
            <p className="text-[13px] leading-5 text-[rgba(38,43,67,0.7)]">Status Review Admin</p>
            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span className={`inline-flex w-fit items-center justify-center whitespace-nowrap rounded-full px-2 py-0.5 text-[13px] font-medium leading-5 ${reviewStatus.className}`}>
                {reviewStatus.label}
              </span>
              <p className="text-[15px] leading-5.5 text-[rgba(38,43,67,0.7)] md:text-right">
                {reviewStatus.description}
              </p>
            </div>
          </div>

          <div id="ringkasan-pengajuan" className="mt-4 overflow-hidden rounded-[10px] bg-white shadow-[0_4px_14px_0_rgba(38,43,67,0.16)]">
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
                          <StatusBadgeControl
                            status={step.status}
                            options={getSelectableStatuses(step)}
                            onSelect={(value) => handleBadgeStatusChange(step, value)}
                            disabled={actionLoading}
                          />
                        </div>

                        <TimelineDot status={step.status} showLine={index < timeline.length - 1} />

                        <article className="rounded-[10px] bg-white p-4 shadow-[0_4px_14px_0_rgba(38,43,67,0.16)] md:p-5">
                          <div className="mb-2 md:hidden">
                            <StatusBadgeControl
                              status={step.status}
                              options={getSelectableStatuses(step)}
                              onSelect={(value) => handleBadgeStatusChange(step, value)}
                              disabled={actionLoading}
                            />
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
                              {step.detailsTitle ? <p className="mb-1">{step.detailsTitle}</p> : null}
                              <ul className="list-none">
                                {step.details.map((d) => (
                                  <li key={d}>• {d}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {!isPentas && step.scheduledDate && (
                            <div className="mt-3 space-y-1 text-[15px] text-[rgba(38,43,67,0.7)]">
                              <p>Tentukan tanggal survey lapangan:</p>
                              <div className="inline-flex items-center gap-2 rounded-lg border border-[rgba(38,43,67,0.16)] px-3 py-2">
                                <span className="font-medium text-[rgba(38,43,67,0.9)]">{step.scheduledDate}</span>
                              </div>
                            </div>
                          )}

                          {step.title === "Pelaporan Kegiatan" && step.status !== "locked" && (
                            <div className="mt-4 space-y-2">
                              <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">Contoh Laporan:</p>
                              <PdfFileChip filename="Contoh Laporan Kegiatan.pdf" />
                            </div>
                          )}

                          {step.attachmentLabel && step.attachmentFile && (
                            <div className="mt-4 space-y-2">
                              <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">{step.attachmentLabel}</p>
                              {step.attachmentPath ? (
                                <button
                                  type="button"
                                  onClick={() => openPdfPreview(buildUploadUrl(step.attachmentPath), step.attachmentFile)}
                                  className="inline-flex"
                                >
                                  <PdfFileChip filename={step.attachmentFile} />
                                </button>
                              ) : (
                                <PdfFileChip filename={step.attachmentFile} />
                              )}
                            </div>
                          )}

                          {step.secondaryDetails && step.status !== "locked" && (
                            <div className="mt-4 space-y-1">
                              <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">Hasil Laporan:</p>
                              {step.secondaryDetails.map((detail) => (
                                <div key={detail} className="inline-flex items-center rounded-[8px] bg-[rgba(38,43,67,0.06)] px-3 py-2 text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                                  {detail}
                                </div>
                              ))}
                            </div>
                          )}

                          {renderStepActions(step)}
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
