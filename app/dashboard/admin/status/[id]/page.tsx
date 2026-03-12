"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { adminPengajuanApi } from "@/app/lib/api";
import type { Pengajuan } from "@/app/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TimelineStatus = "completed" | "in_progress" | "locked" | "rejected";

type TimelineStep = {
  title: string;
  description: string;
  status: TimelineStatus;
  details?: string[];
  attachmentLabel?: string;
  attachmentFile?: string;
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
    title: "Pengajuan Data Pendaftaran",
    description: "Data awal lembaga dan jenis fasilitas pentas telah berhasil diajukan.",
    status: "completed",
  });

  const pemStatus = mapSubStatus(p.status_pemeriksaan, p.status);
  steps.push({
    title: "Pemeriksaan Data oleh Admin dan Penetapan Paket Fasilitas",
    description:
      pemStatus === "completed"
        ? "Data dan dokumen pengajuan telah diverifikasi dan dinyatakan sesuai ketentuan."
        : pemStatus === "rejected"
          ? `Pengajuan ditolak. ${p.catatan_pemeriksaan ?? ""}`
          : "Data pendaftaran telah berhasil dikirim. Lihat data pengajuan untuk memastikan kelengkapan dan kesesuaian data.",
    status: pemStatus,
    details:
      pemStatus === "completed" && p.paket_fasilitasi
        ? [`Nama Paket: ${p.paket_fasilitasi.nama_paket}`, ...(p.paket_fasilitasi.nilai_bantuan ? [`Nilai Bantuan: Rp ${Number(p.paket_fasilitasi.nilai_bantuan).toLocaleString("id-ID")}`] : [])]
        : undefined,
    action: pemStatus === "in_progress" ? { type: "setujui_pemeriksaan" } : undefined,
  });

  if (p.status === "DITOLAK") return steps;

  const suratStatus = p.surat_persetujuan ? mapSubStatus(p.surat_persetujuan.status, p.status) : deriveNext(pemStatus);
  steps.push({
    title: "Pengisian dan Penandatangan Surat Persetujuan",
    description:
      suratStatus === "completed"
        ? "Surat persetujuan telah diterima dan dikonfirmasi di Kantor Dinas Kebudayaan DIY."
        : "Surat persetujuan perlu diterbitkan. Unggah surat persetujuan untuk pemohon.",
    status: suratStatus,
    attachmentLabel: p.surat_persetujuan?.file_path ? "Surat Persetujuan:" : undefined,
    attachmentFile: p.surat_persetujuan?.file_path ? extractFilename(p.surat_persetujuan.file_path) : undefined,
    action:
      suratStatus === "in_progress" && !p.surat_persetujuan
        ? { type: "upload_surat" }
        : suratStatus === "in_progress" && p.surat_persetujuan && p.surat_persetujuan.status !== "SELESAI"
          ? { type: "konfirmasi_surat" }
          : undefined,
  });

  const laporanStatus = p.laporan_kegiatan ? mapSubStatus(p.laporan_kegiatan.status, p.status) : deriveNext(suratStatus);
  steps.push({
    title: "Pelaporan Kegiatan",
    description:
      laporanStatus === "completed"
        ? "Laporan kegiatan telah diverifikasi dan dinyatakan sesuai ketentuan."
        : laporanStatus === "rejected"
          ? `Laporan ditolak. ${p.laporan_kegiatan?.catatan_admin ?? ""}`
          : "Menunggu pemohon mengunggah laporan kegiatan.",
    status: laporanStatus === "rejected" ? "in_progress" : laporanStatus,
    attachmentLabel: p.laporan_kegiatan?.file_laporan ? "File Laporan:" : undefined,
    attachmentFile: p.laporan_kegiatan?.file_laporan ? extractFilename(p.laporan_kegiatan.file_laporan) : undefined,
    action:
      laporanStatus === "in_progress" && p.laporan_kegiatan?.file_laporan
        ? { type: "setujui_laporan" }
        : undefined,
  });

  const pencairanStatus = p.pencairan_dana ? mapSubStatus(p.pencairan_dana.status, p.status) : deriveNext(laporanStatus);
  steps.push({
    title: "Pencairan Dana",
    description:
      pencairanStatus === "completed"
        ? "Dana fasilitasi telah dicairkan ke rekening lembaga budaya yang terdaftar."
        : "Proses pencairan dana ke rekening lembaga budaya.",
    status: pencairanStatus,
    details:
      pencairanStatus === "completed"
        ? [`Nomor Rekening: ${p.nomor_rekening ?? "-"}`, `Nama Pemegang Rekening: ${p.nama_pemegang_rekening ?? "-"}`]
        : undefined,
    attachmentLabel: p.pencairan_dana?.bukti_transfer ? "Bukti Pencairan:" : undefined,
    attachmentFile: p.pencairan_dana?.bukti_transfer ? extractFilename(p.pencairan_dana.bukti_transfer) : undefined,
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
    title: "Pengisian Data Pendaftaran",
    description: "Data awal lembaga dan jenis fasilitas hibah telah berhasil diajukan.",
    status: "completed",
  });

  const pemStatus = mapSubStatus(p.status_pemeriksaan, p.status);
  steps.push({
    title: "Pemeriksaan Data oleh Admin",
    description:
      pemStatus === "completed"
        ? "Data dan dokumen pengajuan telah diverifikasi dan dinyatakan sesuai ketentuan."
        : pemStatus === "rejected"
          ? `Pengajuan ditolak. ${p.catatan_pemeriksaan ?? ""}`
          : "Data pendaftaran telah berhasil dikirim. Menunggu verifikasi.",
    status: pemStatus,
    action: pemStatus === "in_progress" ? { type: "setujui_pemeriksaan" } : undefined,
  });

  if (p.status === "DITOLAK") return steps;

  const surveyStatus = p.survey_lapangan ? mapSubStatus(p.survey_lapangan.status, p.status) : deriveNext(pemStatus);
  steps.push({
    title: "Survey Lapangan Oleh Pihak Dinas Kebudayaan",
    description:
      surveyStatus === "completed"
        ? "Survey lapangan telah selesai dilakukan oleh pihak Dinas Kebudayaan DIY."
        : "Tentukan jadwal survey lapangan.",
    status: surveyStatus,
    scheduledDate: p.survey_lapangan?.tanggal_survey ? formatDate(p.survey_lapangan.tanggal_survey) : undefined,
    action:
      surveyStatus === "in_progress" && !p.survey_lapangan
        ? { type: "set_survey" }
        : surveyStatus === "in_progress" && p.survey_lapangan && p.survey_lapangan.status !== "SELESAI"
          ? { type: "selesaikan_survey" }
          : undefined,
  });

  const suratStatus = p.surat_persetujuan ? mapSubStatus(p.surat_persetujuan.status, p.status) : deriveNext(surveyStatus);
  steps.push({
    title: "Pengisian dan Penandatangan Surat Persetujuan",
    description:
      suratStatus === "completed"
        ? "Surat persetujuan telah diterima dan dikonfirmasi di Kantor Dinas Kebudayaan DIY."
        : "Surat persetujuan perlu diterbitkan. Unggah surat persetujuan untuk pemohon.",
    status: suratStatus,
    attachmentLabel: p.surat_persetujuan?.file_path ? "Surat Persetujuan:" : undefined,
    attachmentFile: p.surat_persetujuan?.file_path ? extractFilename(p.surat_persetujuan.file_path) : undefined,
    action:
      suratStatus === "in_progress" && !p.surat_persetujuan
        ? { type: "upload_surat" }
        : suratStatus === "in_progress" && p.surat_persetujuan && p.surat_persetujuan.status !== "SELESAI"
          ? { type: "konfirmasi_surat" }
          : undefined,
  });

  const pengirimanStatus = p.pengiriman_sarana ? mapSubStatus(p.pengiriman_sarana.status, p.status) : deriveNext(suratStatus);
  steps.push({
    title: "Pengiriman Sarana Prasarana",
    description:
      pengirimanStatus === "completed"
        ? "Sarana prasarana telah dikirim ke lokasi lembaga budaya yang terdaftar."
        : "Proses pengiriman sarana prasarana ke lokasi lembaga budaya.",
    status: pengirimanStatus,
    attachmentLabel: p.pengiriman_sarana?.bukti_pengiriman ? "Bukti Pengiriman:" : undefined,
    attachmentFile: p.pengiriman_sarana?.bukti_pengiriman ? extractFilename(p.pengiriman_sarana.bukti_pengiriman) : undefined,
    action: pengirimanStatus === "in_progress" && !p.pengiriman_sarana?.bukti_pengiriman ? { type: "upload_pengiriman" } : undefined,
  });

  const laporanStatus = p.laporan_kegiatan ? mapSubStatus(p.laporan_kegiatan.status, p.status) : deriveNext(pengirimanStatus);
  steps.push({
    title: "Pelaporan Kegiatan",
    description:
      laporanStatus === "completed"
        ? "Laporan kegiatan telah diverifikasi dan dinyatakan sesuai ketentuan."
        : "Menunggu pemohon mengunggah laporan kegiatan.",
    status: laporanStatus === "rejected" ? "in_progress" : laporanStatus,
    attachmentLabel: p.laporan_kegiatan?.file_laporan ? "File Laporan:" : undefined,
    attachmentFile: p.laporan_kegiatan?.file_laporan ? extractFilename(p.laporan_kegiatan.file_laporan) : undefined,
    action:
      laporanStatus === "in_progress" && p.laporan_kegiatan?.file_laporan
        ? { type: "setujui_laporan" }
        : undefined,
  });

  return steps;
}

function mapSubStatus(sub: string, overall: string): TimelineStatus {
  if (overall === "DITOLAK" && sub === "DITOLAK") return "rejected";
  if (sub === "SELESAI") return "completed";
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
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

function ActionButton({
  label,
  onClick,
  disabled,
  variant = "primary",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger";
}) {
  const bg = variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-[#c23513] hover:bg-[#a62c10]";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex w-fit items-center justify-center gap-2 rounded-lg ${bg} px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors disabled:opacity-50`}
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

  const [data, setData] = useState<Pengajuan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state for modals / inline inputs
  const [surveyDate, setSurveyDate] = useState("");
  const [tolakCatatan, setTolakCatatan] = useState("");
  const [showTolakInput, setShowTolakInput] = useState(false);
  const [paketId, setPaketId] = useState("");

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

  async function handleAction(actionType: StepAction["type"]) {
    if (!data) return;
    try {
      setActionLoading(true);
      switch (actionType) {
        case "setujui_pemeriksaan":
          await adminPengajuanApi.setujui(data.pengajuan_id, { paket_id: paketId || undefined });
          break;
        case "tolak_pemeriksaan":
          await adminPengajuanApi.tolak(data.pengajuan_id, { catatan: tolakCatatan });
          setShowTolakInput(false);
          setTolakCatatan("");
          break;
        case "set_survey":
          if (!surveyDate) { alert("Pilih tanggal survey terlebih dahulu"); setActionLoading(false); return; }
          await adminPengajuanApi.setSurvey(data.pengajuan_id, { tanggal_survey: surveyDate });
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
          await adminPengajuanApi.tolakLaporan(data.pengajuan_id, { catatan: tolakCatatan });
          setShowTolakInput(false);
          setTolakCatatan("");
          break;
        case "selesaikan_pencairan":
          await adminPengajuanApi.selesaikanPencairan(data.pengajuan_id);
          break;
        // File upload actions are handled in handleFileUpload
        default:
          break;
      }
      await fetchData();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String(err.message) : "Aksi gagal";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFileUpload(file: File) {
    if (!data || !pendingFileAction) return;
    try {
      setActionLoading(true);
      switch (pendingFileAction) {
        case "upload_surat":
          await adminPengajuanApi.uploadSuratPersetujuan(
            data.pengajuan_id,
            { tanggal_terbit: new Date().toISOString().split("T")[0] },
            file,
          );
          break;
        case "upload_pencairan":
          await adminPengajuanApi.uploadBuktiPencairan(
            data.pengajuan_id,
            { tanggal_pencairan: new Date().toISOString().split("T")[0], total_dana: Number(data.total_pengajuan_dana ?? 0) },
            file,
          );
          break;
        case "upload_pengiriman":
          await adminPengajuanApi.uploadBuktiPengiriman(
            data.pengajuan_id,
            { tanggal_pengiriman: new Date().toISOString().split("T")[0] },
            file,
          );
          break;
      }
      setPendingFileAction(null);
      await fetchData();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String(err.message) : "Upload gagal";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  function triggerFileUpload(actionType: StepAction["type"]) {
    setPendingFileAction(actionType);
    fileInputRef.current?.click();
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
  const kategori = isPentas ? "Fasilitasi Pentas" : "Fasilitasi Hibah";
  const namaKegiatan = data.lembaga_budaya?.nama_lembaga ?? data.judul_kegiatan ?? data.jenis_kegiatan ?? "-";
  const tanggalPengajuan = formatDate(data.tanggal_pengajuan);

  function renderStepActions(step: TimelineStep) {
    if (!step.action) return null;
    const { type } = step.action;

    switch (type) {
      case "setujui_pemeriksaan":
        return (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-[13px] text-[rgba(38,43,67,0.7)]">Paket ID (opsional)</label>
              <input
                type="text"
                value={paketId}
                onChange={(e) => setPaketId(e.target.value)}
                placeholder="ID Paket fasilitasi"
                className="mt-1 w-full max-w-[300px] rounded-lg border border-[rgba(38,43,67,0.22)] px-3 py-2 text-[15px] outline-none"
              />
            </div>
            <div className="flex gap-2">
              <ActionButton label="Setujui" onClick={() => handleAction("setujui_pemeriksaan")} disabled={actionLoading} />
              {!showTolakInput ? (
                <ActionButton label="Tolak" variant="danger" onClick={() => setShowTolakInput(true)} disabled={actionLoading} />
              ) : (
                <div className="flex items-end gap-2">
                  <div>
                    <input
                      type="text"
                      value={tolakCatatan}
                      onChange={(e) => setTolakCatatan(e.target.value)}
                      placeholder="Alasan penolakan"
                      className="w-full max-w-[250px] rounded-lg border border-[rgba(38,43,67,0.22)] px-3 py-2 text-[15px] outline-none"
                    />
                  </div>
                  <ActionButton label="Konfirmasi Tolak" variant="danger" onClick={() => handleAction("tolak_pemeriksaan")} disabled={actionLoading || !tolakCatatan} />
                </div>
              )}
            </div>
          </div>
        );

      case "set_survey":
        return (
          <div className="mt-4 space-y-3">
            <label className="block text-[13px] text-[rgba(38,43,67,0.7)]">Tanggal Survey</label>
            <input
              type="date"
              value={surveyDate}
              onChange={(e) => setSurveyDate(e.target.value)}
              className="w-full max-w-[300px] rounded-lg border border-[rgba(38,43,67,0.22)] px-3 py-2 text-[15px] outline-none"
            />
            <ActionButton label="Set Jadwal Survey" onClick={() => handleAction("set_survey")} disabled={actionLoading || !surveyDate} />
          </div>
        );

      case "selesaikan_survey":
        return (
          <div className="mt-4">
            <ActionButton label="Tandai Survey Selesai" onClick={() => handleAction("selesaikan_survey")} disabled={actionLoading} />
          </div>
        );

      case "upload_surat":
        return (
          <div className="mt-4">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => triggerFileUpload("upload_surat")}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10] disabled:opacity-50"
            >
              Unggah Surat Persetujuan
              <UploadIcon />
            </button>
          </div>
        );

      case "konfirmasi_surat":
        return (
          <div className="mt-4">
            <ActionButton label="Konfirmasi Surat Ditandatangani" onClick={() => handleAction("konfirmasi_surat")} disabled={actionLoading} />
          </div>
        );

      case "setujui_laporan":
        return (
          <div className="mt-4 flex gap-2">
            <ActionButton label="Setujui Laporan" onClick={() => handleAction("setujui_laporan")} disabled={actionLoading} />
            {!showTolakInput ? (
              <ActionButton label="Tolak Laporan" variant="danger" onClick={() => setShowTolakInput(true)} disabled={actionLoading} />
            ) : (
              <div className="flex items-end gap-2">
                <input
                  type="text"
                  value={tolakCatatan}
                  onChange={(e) => setTolakCatatan(e.target.value)}
                  placeholder="Alasan penolakan"
                  className="w-full max-w-[250px] rounded-lg border border-[rgba(38,43,67,0.22)] px-3 py-2 text-[15px] outline-none"
                />
                <ActionButton label="Konfirmasi Tolak" variant="danger" onClick={() => handleAction("tolak_laporan")} disabled={actionLoading || !tolakCatatan} />
              </div>
            )}
          </div>
        );

      case "upload_pencairan":
        return (
          <div className="mt-4">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => triggerFileUpload("upload_pencairan")}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10] disabled:opacity-50"
            >
              Unggah Bukti Pencairan
              <UploadIcon />
            </button>
          </div>
        );

      case "selesaikan_pencairan":
        return (
          <div className="mt-4">
            <ActionButton label="Selesaikan Pencairan" onClick={() => handleAction("selesaikan_pencairan")} disabled={actionLoading} />
          </div>
        );

      case "upload_pengiriman":
        return (
          <div className="mt-4">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => triggerFileUpload("upload_pengiriman")}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10] disabled:opacity-50"
            >
              Unggah Bukti Pengiriman
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
      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          e.target.value = "";
        }}
      />

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
            Kelola dan perbarui status pengajuan fasilitas lembaga budaya.
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
                              <p>Detail:</p>
                              <ul className="ml-[22px] list-disc">
                                {step.details.map((d) => (
                                  <li key={d}>{d}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {step.scheduledDate && (
                            <div className="mt-3 inline-flex items-center gap-2 text-[15px] text-[rgba(38,43,67,0.7)]">
                              <span>Jadwal:</span>
                              <span className="font-medium text-[rgba(38,43,67,0.9)]">{step.scheduledDate}</span>
                            </div>
                          )}

                          {step.attachmentLabel && step.attachmentFile && (
                            <div className="mt-4 space-y-2">
                              <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">{step.attachmentLabel}</p>
                              <PdfFileChip filename={step.attachmentFile} />
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
