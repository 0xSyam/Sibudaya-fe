"use client";

import { useRef } from "react";
import { pdfUploadValidation, validateUploadFile } from "@/app/lib/file-validation";

interface RejectionModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  reason: string;
  reasonError: string | null;
  suratFile: File | null;
  isLoading: boolean;
  showFileUpload?: boolean;
  onReasonChange: (reason: string) => void;
  onSuratFileChange: (file: File | null) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onShowToast: (msg: string, type: "error" | "success") => void;
}

export function RejectionModal({
  isOpen,
  title = "Alasan Penolakan",
  description = "Isi alasan penolakan.",
  reason,
  reasonError,
  suratFile,
  isLoading,
  showFileUpload = true,
  onReasonChange,
  onSuratFileChange,
  onConfirm,
  onCancel,
  onShowToast,
}: RejectionModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[520px] rounded-[12px] bg-white p-6 shadow-[0_24px_60px_rgba(22,35,71,0.22)]">
        <h2 className="text-[20px] font-semibold text-[rgba(38,43,67,0.9)]">{title}</h2>
        <p className="mt-2 text-[14px] text-[rgba(38,43,67,0.7)]">{description}</p>

        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Tulis alasan penolakan"
          rows={4}
          className="mt-4 w-full rounded-lg border border-[rgba(38,43,67,0.22)] px-3 py-2 text-[15px] outline-none"
        />
        {reasonError ? <p className="mt-1 text-[13px] text-red-500">{reasonError}</p> : null}

        {showFileUpload ? (
          <div className="mt-3 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] ?? null;
                if (!selectedFile) {
                  onSuratFileChange(null);
                  return;
                }

                const validationMessage = validateUploadFile(selectedFile, {
                  ...pdfUploadValidation,
                  label: "Surat penolakan",
                });

                if (validationMessage) {
                  onSuratFileChange(null);
                  onShowToast(validationMessage, "error");
                  e.currentTarget.value = "";
                  return;
                }

                onSuratFileChange(selectedFile);
              }}
            />

            <label className="block cursor-pointer">
              <div className="rounded-xl border border-dashed border-[rgba(38,43,67,0.28)] bg-[rgba(38,43,67,0.02)] px-4 py-3 transition-colors hover:border-[#c23513] hover:bg-[rgba(194,53,19,0.04)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-[rgba(38,43,67,0.9)]">
                      Lampiran surat penolakan (opsional)
                    </p>
                    <p className="mt-0.5 truncate text-[13px] text-[rgba(38,43,67,0.64)]">
                      {suratFile ? suratFile.name : "Klik untuk unggah file PDF"}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#c23513] px-3 py-1.5 text-[13px] font-medium text-white">
                    {suratFile ? "Ganti File" : "Pilih File"}
                  </span>
                </div>
              </div>
            </label>

            {suratFile ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onSuratFileChange(null)}
                  className="text-[13px] font-medium text-[rgba(38,43,67,0.62)] underline underline-offset-2 hover:text-[rgba(38,43,67,0.9)]"
                >
                  Hapus file
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-lg border border-[rgba(38,43,67,0.22)] px-[20px] py-2 text-[15px] font-medium text-[rgba(38,43,67,0.78)] transition-colors hover:bg-[rgba(38,43,67,0.04)] disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium text-white transition-colors hover:bg-[#a62c10] disabled:opacity-50"
          >
            Konfirmasi Tolak
          </button>
        </div>
      </div>
    </div>
  );
}
