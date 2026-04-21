"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminFasilitasiApi, getAccessToken } from "../../../lib/api";
import type { AdminJenisFasilitasi as ApiFasilitasi } from "../../../lib/types";
import { useToast } from "@/app/lib/toast-context";
import { buildProtectedFileUrl } from "@/app/lib/file-url";
import { SelectField } from "@/app/dashboard/components/forms/fields";

type PdfPreviewState = {
  url: string;
  rawUrl: string;
  filename: string;
  isObjectUrl: boolean;
};

async function buildPdfPreviewState(url: string, filename: string): Promise<PdfPreviewState> {
  const token = getAccessToken();

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      throw new Error("Preview fetch failed");
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    return { url: blobUrl, rawUrl: url, filename, isObjectUrl: true };
  } catch {
    return { url, rawUrl: url, filename, isObjectUrl: false };
  }
}

function releasePdfPreview(preview: PdfPreviewState | null) {
  if (preview?.isObjectUrl) {
    URL.revokeObjectURL(preview.url);
  }
}

// ─── Icons ───────────────────────────────────────────────

function AppsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M6.75 2.5H3.25C2.83579 2.5 2.5 2.83579 2.5 3.25V6.75C2.5 7.16421 2.83579 7.5 3.25 7.5H6.75C7.16421 7.5 7.5 7.16421 7.5 6.75V3.25C7.5 2.83579 7.16421 2.5 6.75 2.5ZM6.75 9.5H3.25C2.83579 9.5 2.5 9.83579 2.5 10.25V13.75C2.5 14.1642 2.83579 14.5 3.25 14.5H6.75C7.16421 14.5 7.5 14.1642 7.5 13.75V10.25C7.5 9.83579 7.16421 9.5 6.75 9.5ZM6.75 16.5H3.25C2.83579 16.5 2.5 16.8358 2.5 17.25V20.75C2.5 21.1642 2.83579 21.5 3.25 21.5H6.75C7.16421 21.5 7.5 21.1642 7.5 20.75V17.25C7.5 16.8358 7.16421 16.5 6.75 16.5ZM13.75 2.5H10.25C9.83579 2.5 9.5 2.83579 9.5 3.25V6.75C9.5 7.16421 9.83579 7.5 10.25 7.5H13.75C14.1642 7.5 14.5 7.16421 14.5 6.75V3.25C14.5 2.83579 14.1642 2.5 13.75 2.5ZM20.75 2.5H17.25C16.8358 2.5 16.5 2.83579 16.5 3.25V6.75C16.5 7.16421 16.8358 7.5 17.25 7.5H20.75C21.1642 7.5 21.5 7.16421 21.5 6.75V3.25C21.5 2.83579 21.1642 2.5 20.75 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CouponIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M2 4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V9C20.8954 9 20 9.89543 20 11C20 12.1046 20.8954 13 22 13V18C22 18.5523 21.5523 19 21 19H3C2.44772 19 2 18.5523 2 18V13C3.10457 13 4 12.1046 4 11C4 9.89543 3.10457 9 2 9V4ZM9 6V16H11V6H9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M7 8V6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6V8H20C20.5523 8 21 8.44772 21 9V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V9C3 8.44772 3.44772 8 4 8H7ZM7 10H5V20H19V10H17V12H15V10H9V12H7V10ZM9 8H15V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z" fill="currentColor" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M15.7279 9.57629L14.3137 8.16207L5 17.4758V18.89H6.41421L15.7279 9.57629ZM17.1421 8.16207L18.5563 6.74786L17.1421 5.33365L15.7279 6.74786L17.1421 8.16207ZM7.24264 20.89H3V16.6474L16.435 3.21233C16.8256 2.8218 17.4587 2.8218 17.8492 3.21233L20.6777 6.04075C21.0682 6.43128 21.0682 7.06444 20.6777 7.45497L7.24264 20.89Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M16.0503 12.0498L21 16.9996L16.0503 21.9493L14.636 20.5351L17.172 17.9991H4V15.9991H17.172L14.636 13.4641L16.0503 12.0498ZM7.94975 2.0498L9.36396 3.46402L6.828 5.99998H20V7.99998H6.828L9.36396 10.536L7.94975 11.9502L3 6.99998L7.94975 2.0498Z"
        fill="currentColor"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 12.5858L16.2426 16.8284L14.8284 18.2426L13 16.4142V22H11V16.4142L9.17157 18.2426L7.75736 16.8284L12 12.5858ZM12 2C15.5934 2 18.5544 4.70761 18.9541 8.19395C21.2858 8.83154 23 10.9656 23 13.5C23 16.3688 20.8036 18.7246 18.0006 18.9776L18 17C19.6569 17 21 15.6569 21 14C21 12.3431 19.6569 11 18 11H17V10C17 7.23858 14.7614 5 12 5C9.23858 5 7 7.23858 7 10V11H6C4.34315 11 3 12.3431 3 14C3 15.6569 4.34315 17 6 17L6.00039 18.9776C3.19696 18.7252 1 16.3692 1 13.5C1 10.9656 2.71424 8.83154 5.04648 8.19411C5.44561 4.70761 8.40662 2 12 2Z"
        fill="rgba(38,43,67,0.4)"
      />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M2 1H10L14 5V19H2V1Z"
        fill="#E12D2D"
        stroke="#B31414"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <path d="M10 1V5H14" fill="#F7A9A9" />
      <text
        x="8"
        y="14"
        textAnchor="middle"
        fontSize="4.2"
        fontWeight="700"
        fill="white"
        fontFamily="Arial, sans-serif"
      >
        PDF
      </text>
    </svg>
  );
}

// ─── Confirm Save Dialog ────────────────────────────────

function ConfirmSaveDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      className="m-auto max-w-[500px] rounded-[10px] bg-transparent p-0 backdrop:bg-black/50"
    >
      <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_8px_26px_0_rgba(38,43,67,0.18)]">
        {/* Header */}
        <div className="p-5">
          <h3 className="text-[18px] font-medium leading-7 text-[rgba(38,43,67,0.9)]">
            Simpan Perubahan
          </h3>
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
            Seluruh perubahan akan diperbarui
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-[#6d788d] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-[#6d788d] transition-colors hover:bg-[rgba(109,120,141,0.08)]"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
          >
            Simpan
          </button>
        </div>
      </div>
    </dialog>
  );
}

// ─── Confirm Cancel Dialog ──────────────────────────────

function ConfirmCancelDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      className="m-auto max-w-[500px] rounded-[10px] bg-transparent p-0 backdrop:bg-black/50"
    >
      <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_8px_26px_0_rgba(38,43,67,0.18)]">
        {/* Header */}
        <div className="p-5">
          <h3 className="text-[18px] font-medium leading-7 text-[rgba(38,43,67,0.9)]">
            Batalkan Perubahan
          </h3>
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
            Seluruh perubahan akan batal diperbarui
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-[#6d788d] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-[#6d788d] transition-colors hover:bg-[rgba(109,120,141,0.08)]"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
          >
            Batalkan
          </button>
        </div>
      </div>
    </dialog>
  );
}

// ─── Upload File Dialog ────────────────────────────────

function UploadFileDialog({
  open,
  onClose,
  onFileSelected,
}: {
  open: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  const handleFile = useCallback(
    (file: File) => {
      onFileSelected(file);
      onClose();
    },
    [onFileSelected, onClose]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      className="m-auto w-full max-w-[500px] rounded-[10px] bg-transparent p-0 backdrop:bg-black/50"
    >
      <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_8px_26px_0_rgba(38,43,67,0.18)]">
        {/* Header */}
        <div className="p-5">
          <h3 className="text-[18px] font-medium leading-7 text-[rgba(38,43,67,0.9)]">
            Unggah File
          </h3>
        </div>

        {/* Drop zone */}
        <div className="px-5 pb-5">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-4 rounded-[10px] border-2 border-dashed px-6 py-12 transition-colors ${
              isDragging
                ? "border-[#c23513] bg-[rgba(194,53,19,0.04)]"
                : "border-[rgba(38,43,67,0.12)] bg-white"
            }`}
          >
            {/* Upload icon circle */}
            <div className="flex size-12 items-center justify-center rounded-lg bg-[#f0eff0]">
              <UploadIcon />
            </div>

            {/* Text */}
            <p className="text-center text-[24px] font-medium leading-[38px] text-[rgba(38,43,67,0.9)]">
              Drag and drop your file here
            </p>

            <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.4)]">or</p>

            {/* Browse button */}
            <button
              type="button"
              onClick={handleBrowse}
              className="inline-flex items-center justify-center rounded-lg border border-[#c23513] px-[22px] py-2 text-[13px] font-medium leading-[18px] text-[#c23513] transition-colors hover:bg-[rgba(194,53,19,0.04)]"
            >
              Browse file
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </dialog>
  );
}

// ─── Add Jenis Dialog ───────────────────────────────────

function AddJenisDialog({
  open,
  onClose,
  title,
  includeDanaPembinaan = false,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  includeDanaPembinaan?: boolean;
  onSubmit: (payload: { jenis: string; danaPembinaan?: string }) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [jenis, setJenis] = useState("");
  const [danaPembinaan, setDanaPembinaan] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setJenis("");
    setDanaPembinaan("");
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        handleClose();
      }
    },
    [handleClose]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedJenis = jenis.trim();
    const trimmedDana = danaPembinaan.trim();

    if (!trimmedJenis) return;
    if (includeDanaPembinaan && !trimmedDana) return;

    onSubmit({
      jenis: trimmedJenis,
      ...(includeDanaPembinaan ? { danaPembinaan: trimmedDana } : {}),
    });
    handleClose();
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleClose}
      onClick={handleBackdropClick}
      className="m-auto w-full max-w-[560px] rounded-[10px] bg-transparent p-0 backdrop:bg-black/50"
    >
      <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_8px_26px_0_rgba(38,43,67,0.18)]">
        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <h3 className="text-[18px] font-medium leading-7 text-[rgba(38,43,67,0.9)]">{title}</h3>
          </div>

          <div className="flex flex-col gap-4 px-5 pb-5">
            <label className="flex flex-col gap-2">
              <span className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
                Jenis
              </span>
              <input
                type="text"
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                placeholder="Contoh: Paket E"
                className="h-11 rounded-lg border border-[rgba(38,43,67,0.18)] px-3 text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)] outline-none transition-colors placeholder:text-[rgba(38,43,67,0.35)] focus:border-[#c23513]"
              />
            </label>

            {includeDanaPembinaan ? (
              <label className="flex flex-col gap-2">
                <span className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
                  Dana Pembinaan
                </span>
                <input
                  type="text"
                  value={danaPembinaan}
                  onChange={(e) => setDanaPembinaan(e.target.value)}
                  placeholder="Contoh: Rp. 15.000.000"
                  className="h-11 rounded-lg border border-[rgba(38,43,67,0.18)] px-3 text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)] outline-none transition-colors placeholder:text-[rgba(38,43,67,0.35)] focus:border-[#c23513]"
                />
              </label>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-4 px-5 pb-5">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-lg border border-[#6d788d] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-[#6d788d] transition-colors hover:bg-[rgba(109,120,141,0.08)]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!jenis.trim() || (includeDanaPembinaan && !danaPembinaan.trim())}
              className="inline-flex items-center justify-center rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10] disabled:cursor-not-allowed disabled:bg-[#d6a297]"
            >
              Tambah Jenis
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

// ─── Jenis Lembaga Dialog ──────────────────────────────

function JenisLembagaDialog({
  open,
  onClose,
  title,
  submitLabel,
  initialValue = "",
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  initialValue?: string;
  onSubmit: (jenis: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [jenis, setJenis] = useState(initialValue);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setJenis(initialValue);
    onClose();
  }, [initialValue, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        handleClose();
      }
    },
    [handleClose]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = jenis.trim();
    if (!value) return;
    onSubmit(value);
    handleClose();
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleClose}
      onClick={handleBackdropClick}
      className="m-auto w-full max-w-[560px] rounded-[10px] bg-transparent p-0 backdrop:bg-black/50"
    >
      <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_8px_26px_0_rgba(38,43,67,0.18)]">
        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <h3 className="text-[18px] font-medium leading-7 text-[rgba(38,43,67,0.9)]">{title}</h3>
          </div>
          <div className="px-5 pb-5">
            <label className="flex flex-col gap-2">
              <span className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
                Jenis
              </span>
              <input
                type="text"
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                className="h-11 rounded-lg border border-[rgba(38,43,67,0.18)] px-3 text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)] outline-none transition-colors placeholder:text-[rgba(38,43,67,0.35)] focus:border-[#c23513]"
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-4 px-5 pb-5">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-lg border border-[#6d788d] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-[#6d788d] transition-colors hover:bg-[rgba(109,120,141,0.08)]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!jenis.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10] disabled:cursor-not-allowed disabled:bg-[#d6a297]"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

// ─── Edit Jenis Fasilitasi Dialog ───────────────────────

function EditJenisFasilitasiDialog({
  title,
  initialValue,
  onClose,
  onSubmit,
}: {
  title: string;
  initialValue: JenisFasilitasi;
  onClose: () => void;
  onSubmit: (payload: JenisFasilitasi) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [jenis, setJenis] = useState(initialValue.jenis);
  const [danaPembinaan, setDanaPembinaan] = useState(initialValue.danaPembinaan);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedJenis = jenis.trim();
    const trimmedDana = danaPembinaan.trim();
    if (!trimmedJenis || !trimmedDana) return;
    onSubmit({ jenis: trimmedJenis, danaPembinaan: trimmedDana });
    onClose();
  };

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      className="m-auto w-full max-w-[560px] rounded-[10px] bg-transparent p-0 backdrop:bg-black/50"
    >
      <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_8px_26px_0_rgba(38,43,67,0.18)]">
        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <h3 className="text-[18px] font-medium leading-7 text-[rgba(38,43,67,0.9)]">{title}</h3>
          </div>
          <div className="flex flex-col gap-4 px-5 pb-5">
            <label className="flex flex-col gap-2">
              <span className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
                Jenis
              </span>
              <input
                type="text"
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                className="h-11 rounded-lg border border-[rgba(38,43,67,0.18)] px-3 text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)] outline-none transition-colors placeholder:text-[rgba(38,43,67,0.35)] focus:border-[#c23513]"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
                Dana Pembinaan
              </span>
              <input
                type="text"
                value={danaPembinaan}
                onChange={(e) => setDanaPembinaan(e.target.value)}
                className="h-11 rounded-lg border border-[rgba(38,43,67,0.18)] px-3 text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)] outline-none transition-colors placeholder:text-[rgba(38,43,67,0.35)] focus:border-[#c23513]"
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-4 px-5 pb-5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-[#6d788d] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-[#6d788d] transition-colors hover:bg-[rgba(109,120,141,0.08)]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!jenis.trim() || !danaPembinaan.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10] disabled:cursor-not-allowed disabled:bg-[#d6a297]"
            >
              Simpan Jenis
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

// ─── Kuota Pengajuan Dialog ─────────────────────────────

function KuotaPengajuanDialog({
  open,
  onClose,
  title,
  submitLabel,
  initialValue,
  paketOptions,
  jenisDisabled = false,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  initialValue?: KuotaPengajuan | null;
  paketOptions: Array<{ paketId: string; jenis: string }>;
  jenisDisabled?: boolean;
  onSubmit: (payload: Pick<KuotaPengajuan, "paketId" | "jenis" | "kuotaPengajuan">) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [jenis, setJenis] = useState(initialValue?.jenis ?? "");
  const [kuotaPengajuan, setKuotaPengajuan] = useState(initialValue?.kuotaPengajuan ?? "");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setJenis(initialValue?.jenis ?? "");
    setKuotaPengajuan(initialValue?.kuotaPengajuan ?? "");
    onClose();
  }, [initialValue?.jenis, initialValue?.kuotaPengajuan, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        handleClose();
      }
    },
    [handleClose]
  );

  const isValid = !!jenis.trim() && !!kuotaPengajuan.trim();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;

    const selectedPaket = paketOptions.find((paket) => paket.jenis === jenis.trim());
    if (!selectedPaket) return;

    onSubmit({
      paketId: selectedPaket.paketId,
      jenis: selectedPaket.jenis,
      kuotaPengajuan: kuotaPengajuan.trim(),
    });
    handleClose();
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleClose}
      onClick={handleBackdropClick}
      className="m-auto w-full max-w-[560px] rounded-[10px] bg-transparent p-0 backdrop:bg-black/50"
    >
      <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_8px_26px_0_rgba(38,43,67,0.18)]">
        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <h3 className="text-[18px] font-medium leading-7 text-[rgba(38,43,67,0.9)]">{title}</h3>
          </div>

          <div className="flex flex-col gap-4 px-5 pb-5">
            <label className="flex flex-col gap-2">
              <span className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">Jenis Paket</span>
              <SelectField
                placeholder="Pilih paket pengajuan"
                options={paketOptions.map((paket) => paket.jenis)}
                value={jenis}
                disabled={jenisDisabled}
                onChange={(e) => setJenis(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
                Kuota Pengajuan
              </span>
              <input
                type="text"
                value={kuotaPengajuan}
                onChange={(e) => setKuotaPengajuan(e.target.value)}
                className="h-11 rounded-lg border border-[rgba(38,43,67,0.18)] px-3 text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)] outline-none transition-colors placeholder:text-[rgba(38,43,67,0.35)] focus:border-[#c23513]"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-4 px-5 pb-5">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-lg border border-[#6d788d] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-[#6d788d] transition-colors hover:bg-[rgba(109,120,141,0.08)]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="inline-flex items-center justify-center rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10] disabled:cursor-not-allowed disabled:bg-[#d6a297]"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

// ─── Tab types ───────────────────────────────────────────

type TabId = "general" | "pentas" | "hibah";

type TabItem = {
  id: TabId;
  label: string;
  icon: React.ReactNode;
};

const tabs: TabItem[] = [
  { id: "general", label: "General", icon: <AppsIcon /> },
  { id: "pentas", label: "Pentas", icon: <CouponIcon /> },
  { id: "hibah", label: "Hibah", icon: <ShoppingBagIcon /> },
];

type JenisLembagaItem = {
  jenis_lembaga_id: number;
  nama: string;
  created_at: string;
};

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    if ("statusCode" in error && Number((error as { statusCode?: unknown }).statusCode) === 409) {
      return "Paket Fasilitasi sudah ada";
    }

    if ("message" in error) {
      const message = (error as { message: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  }

  return fallback;
}

function normalizeDuplicatePaketMessage(message: string): string {
  const normalized = message.toLocaleLowerCase("id-ID");
  if (normalized.includes("paket") && normalized.includes("sudah ada")) {
    return "Paket Fasilitasi sudah ada";
  }
  return message;
}

// ─── Sub-components ─────────────────────────────────────

function SettingsStepper({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-3 p-5 md:w-[300px]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[15px] font-medium leading-[22px] transition-colors ${
              isActive
                ? "bg-[rgba(194,53,19,0.08)] text-[#c23513]"
                : "text-[#c23513] hover:bg-[rgba(194,53,19,0.04)]"
            }`}
          >
            <span className="flex size-5 items-center justify-center">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function JenisLembagaTable({
  items,
  onEdit,
  onDelete,
  onAdd,
}: {
  items: JenisLembagaItem[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)]">
      {/* Header with title + add button */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-[18px] font-medium leading-7 text-[#c23513]">Jenis Lembaga</h3>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
        >
          <PlusIcon />
          <span>Tambah Jenis</span>
        </button>
      </div>

      {/* Table header */}
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
      <div className="flex items-center">
        <div className="flex flex-1 items-center bg-[#f5f5f7] p-5">
          <p className="flex-1 text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)]">Jenis</p>
          <div className="h-3.5 w-0.5 bg-[rgba(38,43,67,0.12)]" />
        </div>
        <div className="flex w-[200px] items-center justify-center bg-[#f5f5f7] p-5">
          <p className="text-[13px] font-medium uppercase leading-6 tracking-[0.2px] text-[rgba(38,43,67,0.9)]">
            Action
          </p>
        </div>
      </div>

      {/* Table rows */}
      {items.map((item, index) => (
        <div
          key={item.jenis_lembaga_id}
          className="flex h-[50px] items-center border-b border-[rgba(38,43,67,0.12)]"
        >
          <div className="flex flex-1 items-center px-5">
            <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
              {item.nama}
            </p>
          </div>
          <div className="flex w-[200px] items-center justify-center gap-2 px-5">
            <button
              type="button"
              onClick={() => onEdit(index)}
              className="inline-flex items-center gap-[6px] rounded-[6px] border border-[#fdb528] px-3 py-2 text-[13px] font-medium leading-[18px] text-[#fdb528] transition-colors hover:bg-[rgba(253,181,40,0.08)]"
            >
              <PencilIcon />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(index)}
              className="inline-flex items-center gap-[6px] rounded-[6px] border border-[#ff4d49] px-3 py-2 text-[13px] font-medium leading-[18px] text-[#ff4d49] transition-colors hover:bg-[rgba(255,77,73,0.08)]"
            >
              <DeleteIcon />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      ))}
        </div>
      </div>
    </div>
  );
}

// ─── General Tab Content ────────────────────────────────

function GeneralTabContent({
  data,
  onRefetch,
}: {
  data: ApiFasilitasi | null;
  onRefetch: () => Promise<void>;
}) {
  const { showToast } = useToast();
  const JENIS_ID = 1;
  const [jenisLembaga, setJenisLembaga] = useState<JenisLembagaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddJenisDialog, setShowAddJenisDialog] = useState(false);
  const [editingJenisIndex, setEditingJenisIndex] = useState<number | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<PdfPreviewState | null>(null);

  const closePdfPreview = useCallback(() => {
    setPdfPreview((current) => {
      releasePdfPreview(current);
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      releasePdfPreview(pdfPreview);
    };
  }, [pdfPreview]);

  const openPdfPreview = useCallback(async (url: string, filename: string) => {
    const previewState = await buildPdfPreviewState(url, filename);
    setPdfPreview((current) => {
      releasePdfPreview(current);
      return previewState;
    });
  }, []);

  const loadJenisLembaga = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFasilitasiApi.getJenisLembaga();
      setJenisLembaga(data);
    } catch (e: unknown) {
      const message =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "Gagal memuat jenis lembaga";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadJenisLembaga();
  }, [loadJenisLembaga]);

  const withSave = async (fn: () => Promise<unknown>, successMessage: string) => {
    setSaving(true);
    try {
      await fn();
      await loadJenisLembaga();
      showToast(successMessage, "success");
    } catch (e: unknown) {
      const message =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "Terjadi kesalahan";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (index: number) => {
    const target = jenisLembaga[index];
    if (!target) return;

    withSave(() => adminFasilitasiApi.deleteJenisLembaga(target.jenis_lembaga_id), "Jenis lembaga berhasil dihapus.");
  };

  const editingItem = editingJenisIndex !== null ? jenisLembaga[editingJenisIndex] : null;
  const panduanFilename = data?.panduan_file?.split("/").pop() ?? "Belum ada file panduan";
  const canPreviewPanduan = Boolean(data?.panduan_file);

  const handleUploadPanduan = async (file: File) => {
    if (file.type !== "application/pdf") {
      showToast("File panduan harus berformat PDF.", "error");
      return;
    }

    setSaving(true);
    try {
      await adminFasilitasiApi.uploadTemplatePanduan(JENIS_ID, file);
      await onRefetch();
      showToast("File panduan berhasil diunggah.", "success");
    } catch (e: unknown) {
      const message =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "Gagal mengunggah file panduan";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DocumentCard
        title="File Lihat Panduan"
        filename={panduanFilename}
        filePath={data?.panduan_file ?? undefined}
        actionLabel={saving ? "Menyimpan..." : "Upload Panduan"}
        onPreview={openPdfPreview}
        onUbah={() => setShowUploadDialog(true)}
      />
      {!canPreviewPanduan ? (
        <p className="-mt-2 text-[13px] leading-5 text-[rgba(38,43,67,0.7)]">
          File panduan belum diunggah. Upload PDF agar tombol Lihat Panduan di dashboard bisa dibuka pengguna.
        </p>
      ) : null}

      <JenisLembagaTable
        items={jenisLembaga}
        onEdit={(index) => setEditingJenisIndex(index)}
        onDelete={handleDelete}
        onAdd={() => setShowAddJenisDialog(true)}
      />

      <PdfPreviewModal preview={pdfPreview} onClose={closePdfPreview} />
      <UploadFileDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onFileSelected={handleUploadPanduan}
      />

      <JenisLembagaDialog
        open={showAddJenisDialog}
        onClose={() => setShowAddJenisDialog(false)}
        title="Tambah Jenis Lembaga"
        submitLabel="Tambah Jenis"
        onSubmit={(jenis) => {
          withSave(() => adminFasilitasiApi.createJenisLembaga({ nama: jenis }), "Jenis lembaga berhasil ditambahkan.");
        }}
      />
      {editingItem ? (
        <JenisLembagaDialog
          open
          onClose={() => setEditingJenisIndex(null)}
          title="Edit Jenis Lembaga"
          submitLabel="Simpan Jenis"
          initialValue={editingItem.nama}
          onSubmit={(jenis) => {
            withSave(() =>
              adminFasilitasiApi.updateJenisLembaga(editingItem.jenis_lembaga_id, {
                nama: jenis,
              }),
              "Jenis lembaga berhasil diperbarui.",
            );
          }}
        />
      ) : null}
    </>
  );
}

// ─── Pentas Tab Content ─────────────────────────────────

type LocalJenisFasilitasiRow = {
  jenis: string;
  danaPembinaan: string;
};

type KuotaPengajuan = {
  paketId: string;
  jenis: string;
  totalPengajuan: string;
  kuotaPengajuan: string;
};

type JenisFasilitasi = LocalJenisFasilitasiRow;

function JenisFasilitasiTable({
  items,
  onEdit,
  onDelete,
  onAdd,
  showDanaPembinaan = true,
}: {
  items: JenisFasilitasi[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
  showDanaPembinaan?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)]">
      {/* Header with title + add button */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-[18px] font-medium leading-7 text-[#c23513]">Jenis Fasilitasi</h3>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
        >
          <PlusIcon />
          <span>Tambah Jenis</span>
        </button>
      </div>

      {/* Table header */}
      <div className="overflow-x-auto">
        <div className={showDanaPembinaan ? "min-w-[560px]" : "min-w-[360px]"}>
      <div className="flex items-center">
        <div className={showDanaPembinaan ? "flex flex-1 items-center bg-[#f5f5f7] p-5" : "flex flex-[1.5] items-center bg-[#f5f5f7] p-5"}>
          <p className="flex-1 text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)]">Jenis</p>
          <div className="h-3.5 w-0.5 bg-[rgba(38,43,67,0.12)]" />
        </div>
        {showDanaPembinaan ? (
          <div className="flex w-[200px] items-center bg-[#f5f5f7] p-5">
            <p className="flex-1 text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)]">Dana Pembinaan</p>
            <div className="h-3.5 w-0.5 bg-[rgba(38,43,67,0.12)]" />
          </div>
        ) : null}
        <div className="flex w-[200px] items-center justify-center bg-[#f5f5f7] p-5">
          <p className="text-[13px] font-medium uppercase leading-6 tracking-[0.2px] text-[rgba(38,43,67,0.9)]">
            Action
          </p>
        </div>
      </div>

      {/* Table rows */}
      {items.map((item, index) => (
        <div
          key={`${item.jenis}-${index}`}
          className="flex h-[50px] items-center border-b border-[rgba(38,43,67,0.12)]"
        >
          <div className={showDanaPembinaan ? "flex flex-1 items-center px-5" : "flex flex-[1.5] items-center px-5"}>
            <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
              {item.jenis}
            </p>
          </div>
          {showDanaPembinaan ? (
            <div className="flex w-[200px] items-center px-5">
              <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
                {item.danaPembinaan}
              </p>
            </div>
          ) : null}
          <div className="flex w-[200px] items-center justify-center gap-2 px-5">
            <button
              type="button"
              onClick={() => onEdit(index)}
              className="inline-flex items-center gap-[6px] rounded-[6px] border border-[#fdb528] px-3 py-2 text-[13px] font-medium leading-[18px] text-[#fdb528] transition-colors hover:bg-[rgba(253,181,40,0.08)]"
            >
              <PencilIcon />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(index)}
              className="inline-flex items-center gap-[6px] rounded-[6px] border border-[#ff4d49] px-3 py-2 text-[13px] font-medium leading-[18px] text-[#ff4d49] transition-colors hover:bg-[rgba(255,77,73,0.08)]"
            >
              <DeleteIcon />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      ))}
        </div>
      </div>
    </div>
  );
}

function KuotaPengajuanTable({
  items,
  onEdit,
  onDelete,
  onAdd,
}: {
  items: KuotaPengajuan[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)]">
      {/* Header with title + edit button */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-[18px] font-medium leading-7 text-[#c23513]">Kuota Pengajuan 2026</h3>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
        >
          <PlusIcon />
          <span>Tambah Kuota</span>
        </button>
      </div>

      {/* Table header */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
      <div className="flex items-center">
        <div className="flex min-w-[200px] flex-1 items-center bg-[#f5f5f7] p-5">
          <p className="flex-1 text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)]">Jenis</p>
          <div className="h-3.5 w-0.5 bg-[rgba(38,43,67,0.12)]" />
        </div>
        <div className="flex w-[200px] items-center bg-[#f5f5f7] p-5">
          <p className="flex-1 text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)]">Total Pengajuan</p>
          <div className="h-3.5 w-0.5 bg-[rgba(38,43,67,0.12)]" />
        </div>
        <div className="flex w-[200px] items-center justify-center bg-[#f5f5f7] p-5">
          <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.9)]">Kuota Pengajuan</p>
        </div>
        <div className="flex w-[200px] items-center justify-center bg-[#f5f5f7] p-5">
          <p className="text-[13px] font-medium uppercase leading-6 tracking-[0.2px] text-[rgba(38,43,67,0.9)]">
            Action
          </p>
        </div>
      </div>

      {/* Table rows */}
      {items.map((item, index) => (
        <div
          key={`${item.jenis}-${index}`}
          className="flex min-h-[50px] items-center border-b border-[rgba(38,43,67,0.12)]"
        >
          <div className="flex min-w-[200px] flex-1 items-center px-5 py-3">
            <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">
              {item.jenis}
            </p>
          </div>
          <div className="flex w-[200px] items-center px-5">
            <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
              {item.totalPengajuan}
            </p>
          </div>
          <div className="flex w-[200px] items-center justify-center px-5">
            <p className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
              {item.kuotaPengajuan}
            </p>
          </div>
          <div className="flex w-[200px] items-center justify-center gap-2 px-5">
            <button
              type="button"
              onClick={() => onEdit(index)}
              className="inline-flex items-center gap-[6px] rounded-[6px] border border-[#fdb528] px-3 py-2 text-[13px] font-medium leading-[18px] text-[#fdb528] transition-colors hover:bg-[rgba(253,181,40,0.08)]"
            >
              <PencilIcon />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(index)}
              className="inline-flex items-center gap-[6px] rounded-[6px] border border-[#ff4d49] px-3 py-2 text-[13px] font-medium leading-[18px] text-[#ff4d49] transition-colors hover:bg-[rgba(255,77,73,0.08)]"
            >
              <DeleteIcon />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      ))}
        </div>
      </div>
    </div>
  );
}

function DocumentCard({
  title,
  filename,
  filePath,
  onPreview,
  onUbah,
  actionLabel = "Ubah",
}: {
  title: string;
  filename: string;
  filePath?: string;
  onPreview?: (url: string, filename: string) => void | Promise<void>;
  onUbah: () => void;
  actionLabel?: string;
}) {
  const fileUrl = filePath ? buildProtectedFileUrl(filePath) : null;

  return (
    <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)]">
      <div className="flex items-center justify-between p-5">
        <h3 className="text-[18px] font-medium leading-7 text-[#c23513]">{title}</h3>
        <button
          type="button"
          onClick={onUbah}
          className="inline-flex items-center gap-2 rounded-lg bg-[#c23513] px-[22px] py-2 text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
        >
          <SwapIcon />
          <span>{actionLabel}</span>
        </button>
      </div>
      <div className="px-5 pb-5">
        <div className="inline-flex items-center gap-[10px] rounded-lg bg-[rgba(38,43,67,0.06)] px-[10px] py-[5px]">
          <PdfIcon />
          {fileUrl ? (
            <button
              type="button"
              onClick={() => onPreview?.(fileUrl, filename)}
              className="text-[15px] font-medium leading-[22px] text-[#c23513] underline-offset-2 hover:underline"
            >
              {filename}
            </button>
          ) : (
            <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.7)]">{filename}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PdfPreviewModal({
  preview,
  onClose,
}: {
  preview: PdfPreviewState | null;
  onClose: () => void;
}) {
  if (!preview) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4 py-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Preview dokumen"
    >
      <div
        className="w-full max-w-5xl overflow-hidden rounded-[14px] bg-white shadow-[0_24px_64px_0_rgba(15,23,42,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[rgba(38,43,67,0.12)] px-5 py-4">
          <p className="truncate pr-4 text-[15px] font-medium text-[rgba(38,43,67,0.9)]">{preview.filename}</p>
          <div className="flex items-center gap-3">
            <a
              href={preview.rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[#c23513] px-3 py-1.5 text-[13px] font-medium text-[#c23513] transition-colors hover:bg-[rgba(194,53,19,0.08)]"
            >
              Buka Tab Baru
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#c23513] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#a62c10]"
            >
              Tutup
            </button>
          </div>
        </div>
        <iframe
          src={preview.url}
          title={`Preview ${preview.filename}`}
          className="h-[72vh] w-full"
        />
      </div>
    </div>
  );
}

function PentasTabContent({
  data,
  onRefetch,
}: {
  data: ApiFasilitasi | null;
  onRefetch: () => void;
}) {
  const { showToast } = useToast();
  const JENIS_ID = 1;

  const [showAddJenisDialog, setShowAddJenisDialog] = useState(false);
  const [showAddKuotaDialog, setShowAddKuotaDialog] = useState(false);
  const [editingJenisIndex, setEditingJenisIndex] = useState<number | null>(null);
  const [editingKuotaIndex, setEditingKuotaIndex] = useState<number | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<"proposal" | "laporan">("proposal");
  const [saving, setSaving] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<PdfPreviewState | null>(null);

  const closePdfPreview = useCallback(() => {
    setPdfPreview((current) => {
      releasePdfPreview(current);
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      releasePdfPreview(pdfPreview);
    };
  }, [pdfPreview]);

  const openPdfPreview = useCallback(async (url: string, filename: string) => {
    const previewState = await buildPdfPreviewState(url, filename);
    setPdfPreview((current) => {
      releasePdfPreview(current);
      return previewState;
    });
  }, []);

  const pakets = data?.paket_fasilitasi ?? [];
  const paketOptions = pakets.map((paket) => ({ paketId: paket.paket_id, jenis: paket.nama_paket }));

  const formatRupiah = (v: string | null) => {
    if (!v) return "-";
    const n = Number(v);
    return isNaN(n) ? v : `Rp. ${n.toLocaleString("id-ID")}`;
  };

  const jenisFasilitasiItems: JenisFasilitasi[] = pakets.map((p) => ({
    jenis: p.nama_paket,
    danaPembinaan: formatRupiah(p.nilai_bantuan),
  }));

  const kuotaItems: KuotaPengajuan[] = pakets.map((p) => ({
    paketId: p.paket_id,
    jenis: p.nama_paket,
    totalPengajuan: `${p._count.pengajuan}`,
    kuotaPengajuan: `${p.kuota}`,
  }));

  const isDuplicatePaket = (namaPaket: string, excludePaketId?: string) => {
    const normalizedNewPaket = namaPaket.trim().toLocaleLowerCase("id-ID");
    return pakets.some(
      (paket) =>
        paket.paket_id !== excludePaketId &&
        paket.nama_paket.trim().toLocaleLowerCase("id-ID") === normalizedNewPaket,
    );
  };

  const parseNilai = (display: string) => display.replace(/[^\d]/g, "") || "0";

  const withSave = async (fn: () => Promise<unknown>, successMessage: string) => {
      setSaving(true);
      try {
        await fn();
        onRefetch();
        showToast(successMessage, "success");
      } catch (e: unknown) {
        const msg = normalizeDuplicatePaketMessage(extractApiErrorMessage(e, "Terjadi kesalahan"));
        showToast(msg, "error");
      } finally {
        setSaving(false);
      }
    };

  const handleAddJenis = (payload: { jenis: string; danaPembinaan?: string }) => {
    if (isDuplicatePaket(payload.jenis)) {
      showToast("Paket Fasilitasi sudah ada", "error");
      return;
    }

    withSave(() =>
      adminFasilitasiApi.createKuota(JENIS_ID, {
        nama_paket: payload.jenis,
        kuota: 0,
        nilai_bantuan: parseNilai(payload.danaPembinaan ?? "0"),
      }),
      "Jenis fasilitasi berhasil ditambahkan.",
    );
  };

  const handleEditJenis = (payload: JenisFasilitasi) => {
    if (editingJenisIndex === null) return;
    const paket = pakets[editingJenisIndex];
    if (!paket) return;

    if (isDuplicatePaket(payload.jenis, paket.paket_id)) {
      showToast("Paket Fasilitasi sudah ada", "error");
      return;
    }

    withSave(() =>
      adminFasilitasiApi.updateKuota(paket.paket_id, {
        nama_paket: payload.jenis,
        nilai_bantuan: parseNilai(payload.danaPembinaan),
      }),
      "Jenis fasilitasi berhasil diperbarui.",
    );
    setEditingJenisIndex(null);
  };

  const handleDeleteJenis = (index: number) => {
    const paket = pakets[index];
    if (!paket) return;
    withSave(() => adminFasilitasiApi.deleteKuota(paket.paket_id), "Jenis fasilitasi berhasil dihapus.");
  };

  const handleAddKuota = (payload: Pick<KuotaPengajuan, "paketId" | "jenis" | "kuotaPengajuan">) => {
    withSave(() =>
      adminFasilitasiApi.updateKuota(payload.paketId, {
        kuota: parseInt(payload.kuotaPengajuan) || 0,
      }),
      "Kuota pengajuan berhasil ditambahkan.",
    );
  };

  const handleEditKuota = (payload: Pick<KuotaPengajuan, "paketId" | "jenis" | "kuotaPengajuan">) => {
    if (editingKuotaIndex === null) return;
    const paket = pakets.find((item) => item.paket_id === payload.paketId) ?? pakets[editingKuotaIndex];
    if (!paket) return;
    withSave(() =>
      adminFasilitasiApi.updateKuota(paket.paket_id, {
        kuota: parseInt(payload.kuotaPengajuan) || 0,
      }),
      "Kuota pengajuan berhasil diperbarui.",
    );
    setEditingKuotaIndex(null);
  };

  const handleDeleteKuota = (index: number) => handleDeleteJenis(index);

  const handleUpload = (file: File) => {
    withSave(() =>
      uploadTarget === "proposal"
        ? adminFasilitasiApi.uploadTemplateProposal(JENIS_ID, file)
        : adminFasilitasiApi.uploadTemplateLaporan(JENIS_ID, file)
      ,
      uploadTarget === "proposal"
        ? "Template proposal berhasil diunggah."
        : "Template laporan berhasil diunggah."
    );
  };

  const proposalFilename = data?.template_proposal_file
    ? data.template_proposal_file.split("/").pop()!
    : "Belum ada template proposal";
  const laporanFilename = data?.template_laporan_file
    ? data.template_laporan_file.split("/").pop()!
    : "Belum ada template laporan";

  return (
    <>
      {/* 1. Jenis Fasilitasi table */}
      <JenisFasilitasiTable
        items={jenisFasilitasiItems}
        onEdit={(index) => setEditingJenisIndex(index)}
        onDelete={handleDeleteJenis}
        onAdd={() => setShowAddJenisDialog(true)}
      />

      {/* 2. Kuota Pengajuan table */}
      <KuotaPengajuanTable
        items={kuotaItems}
        onAdd={() => setShowAddKuotaDialog(true)}
        onEdit={(index) => setEditingKuotaIndex(index)}
        onDelete={handleDeleteKuota}
      />

      {/* 3. Contoh Proposal */}
      <DocumentCard
        title="Contoh Proposal"
        filename={proposalFilename}
        filePath={data?.template_proposal_file ?? undefined}
        onPreview={openPdfPreview}
        onUbah={() => {
          setUploadTarget("proposal");
          setShowUploadDialog(true);
        }}
      />

      {/* 4. Contoh Laporan */}
      <DocumentCard
        title="Contoh Laporan"
        filename={laporanFilename}
        filePath={data?.template_laporan_file ?? undefined}
        onPreview={openPdfPreview}
        onUbah={() => {
          setUploadTarget("laporan");
          setShowUploadDialog(true);
        }}
      />

      <PdfPreviewModal preview={pdfPreview} onClose={closePdfPreview} />

      <UploadFileDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onFileSelected={handleUpload}
      />
      <AddJenisDialog
        open={showAddJenisDialog}
        onClose={() => setShowAddJenisDialog(false)}
        title="Tambah Jenis Fasilitasi"
        includeDanaPembinaan
        onSubmit={handleAddJenis}
      />
      {editingJenisIndex !== null && jenisFasilitasiItems[editingJenisIndex] ? (
        <EditJenisFasilitasiDialog
          title="Edit Jenis Fasilitasi"
          initialValue={jenisFasilitasiItems[editingJenisIndex]}
          onClose={() => setEditingJenisIndex(null)}
          onSubmit={handleEditJenis}
        />
      ) : null}
      <KuotaPengajuanDialog
        open={showAddKuotaDialog}
        onClose={() => setShowAddKuotaDialog(false)}
        title="Tambah Kuota Pengajuan 2026"
        submitLabel="Tambah Kuota"
        paketOptions={paketOptions}
        onSubmit={handleAddKuota}
      />
      {editingKuotaIndex !== null && kuotaItems[editingKuotaIndex] ? (
        <KuotaPengajuanDialog
          open
          onClose={() => setEditingKuotaIndex(null)}
          title="Edit Kuota Pengajuan 2026"
          submitLabel="Simpan Kuota"
          initialValue={kuotaItems[editingKuotaIndex]}
          paketOptions={paketOptions}
          jenisDisabled
          onSubmit={handleEditKuota}
        />
      ) : null}
    </>
  );
}

// ─── Sarana Prasarana (Fasilitasi Hibah) default data ───

function SaranaPrasaranaTabContent({
  data,
  onRefetch,
}: {
  data: ApiFasilitasi | null;
  onRefetch: () => void;
}) {
  const { showToast } = useToast();
  const JENIS_ID = 2;

  const [showAddJenisDialog, setShowAddJenisDialog] = useState(false);
  const [editingJenisIndex, setEditingJenisIndex] = useState<number | null>(null);
  const [showAddKuotaDialog, setShowAddKuotaDialog] = useState(false);
  const [editingKuotaIndex, setEditingKuotaIndex] = useState<number | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<"proposal" | "laporan">("proposal");
  const [saving, setSaving] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<PdfPreviewState | null>(null);

  const closePdfPreview = useCallback(() => {
    setPdfPreview((current) => {
      releasePdfPreview(current);
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      releasePdfPreview(pdfPreview);
    };
  }, [pdfPreview]);

  const openPdfPreview = useCallback(async (url: string, filename: string) => {
    const previewState = await buildPdfPreviewState(url, filename);
    setPdfPreview((current) => {
      releasePdfPreview(current);
      return previewState;
    });
  }, []);

  const pakets = data?.paket_fasilitasi ?? [];
  const paketOptions = pakets.map((paket) => ({ paketId: paket.paket_id, jenis: paket.nama_paket }));

  const jenisFasilitasiItems: JenisFasilitasi[] = pakets.map((p) => ({
    jenis: p.nama_paket,
    danaPembinaan: "-",
  }));

  const kuotaItems: KuotaPengajuan[] = pakets.map((p) => ({
    paketId: p.paket_id,
    jenis: p.nama_paket,
    totalPengajuan: `${p._count.pengajuan}`,
    kuotaPengajuan: `${p.kuota}`,
  }));

  const isDuplicatePaket = (namaPaket: string, excludePaketId?: string) => {
    const normalizedNewPaket = namaPaket.trim().toLocaleLowerCase("id-ID");
    return pakets.some(
      (paket) =>
        paket.paket_id !== excludePaketId &&
        paket.nama_paket.trim().toLocaleLowerCase("id-ID") === normalizedNewPaket,
    );
  };

  const withSave = async (fn: () => Promise<unknown>, successMessage: string) => {
    setSaving(true);
    try {
      await fn();
      onRefetch();
      showToast(successMessage, "success");
    } catch (e: unknown) {
      const msg = normalizeDuplicatePaketMessage(extractApiErrorMessage(e, "Terjadi kesalahan"));
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddKuota = (payload: Pick<KuotaPengajuan, "paketId" | "jenis" | "kuotaPengajuan">) => {
    withSave(() =>
      adminFasilitasiApi.updateKuota(payload.paketId, {
        kuota: parseInt(payload.kuotaPengajuan) || 0,
      }),
      "Paket sarana prasarana berhasil ditambahkan.",
    );
  };

  const handleAddJenis = (payload: { jenis: string; danaPembinaan?: string }) => {
    if (isDuplicatePaket(payload.jenis)) {
      showToast("Paket Fasilitasi sudah ada", "error");
      return;
    }

    withSave(() =>
      adminFasilitasiApi.createKuota(JENIS_ID, {
        nama_paket: payload.jenis,
        kuota: 0,
      }),
      "Jenis fasilitasi hibah berhasil ditambahkan.",
    );
  };

  const handleEditJenis = (jenis: string) => {
    if (editingJenisIndex === null) return;
    const paket = pakets[editingJenisIndex];
    if (!paket) return;

    if (isDuplicatePaket(jenis, paket.paket_id)) {
      showToast("Paket Fasilitasi sudah ada", "error");
      return;
    }

    withSave(() =>
      adminFasilitasiApi.updateKuota(paket.paket_id, {
        nama_paket: jenis,
      }),
      "Jenis fasilitasi hibah berhasil diperbarui.",
    );
    setEditingJenisIndex(null);
  };

  const handleDeleteJenis = (index: number) => {
    const paket = pakets[index];
    if (!paket) return;
    withSave(() => adminFasilitasiApi.deleteKuota(paket.paket_id), "Jenis fasilitasi hibah berhasil dihapus.");
  };

  const handleEditKuota = (payload: Pick<KuotaPengajuan, "paketId" | "jenis" | "kuotaPengajuan">) => {
    if (editingKuotaIndex === null) return;
    const paket = pakets.find((item) => item.paket_id === payload.paketId) ?? pakets[editingKuotaIndex];
    if (!paket) return;

    withSave(() =>
      adminFasilitasiApi.updateKuota(paket.paket_id, {
        kuota: parseInt(payload.kuotaPengajuan) || 0,
      }),
      "Paket sarana prasarana berhasil diperbarui.",
    );
    setEditingKuotaIndex(null);
  };

  const handleDeleteKuota = (index: number) => {
    const paket = pakets[index];
    if (!paket) return;
    withSave(() => adminFasilitasiApi.deleteKuota(paket.paket_id), "Paket sarana prasarana berhasil dihapus.");
  };

  const handleUpload = (file: File) => {
    withSave(() =>
      uploadTarget === "proposal"
        ? adminFasilitasiApi.uploadTemplateProposal(JENIS_ID, file)
        : adminFasilitasiApi.uploadTemplateLaporan(JENIS_ID, file)
      ,
      uploadTarget === "proposal"
        ? "Template proposal berhasil diunggah."
        : "Template laporan berhasil diunggah."
    );
  };

  const proposalFilename = data?.template_proposal_file
    ? data.template_proposal_file.split("/").pop()!
    : "Belum ada template proposal";
  const laporanFilename = data?.template_laporan_file
    ? data.template_laporan_file.split("/").pop()!
    : "Belum ada template laporan";

  return (
    <>
      {/* 1. Jenis Fasilitasi table */}
      <JenisFasilitasiTable
        items={jenisFasilitasiItems}
        onAdd={() => setShowAddJenisDialog(true)}
        onEdit={(index) => setEditingJenisIndex(index)}
        onDelete={handleDeleteJenis}
        showDanaPembinaan={false}
      />

      {/* 2. Kuota Pengajuan table */}
      <KuotaPengajuanTable
        items={kuotaItems}
        onAdd={() => setShowAddKuotaDialog(true)}
        onEdit={(index) => setEditingKuotaIndex(index)}
        onDelete={handleDeleteKuota}
      />

      {/* 3. Contoh Proposal */}
      <DocumentCard
        title="Contoh Proposal"
        filename={proposalFilename}
        filePath={data?.template_proposal_file ?? undefined}
        onPreview={openPdfPreview}
        onUbah={() => {
          setUploadTarget("proposal");
          setShowUploadDialog(true);
        }}
      />

      {/* 4. Contoh Laporan */}
      <DocumentCard
        title="Contoh Laporan"
        filename={laporanFilename}
        filePath={data?.template_laporan_file ?? undefined}
        onPreview={openPdfPreview}
        onUbah={() => {
          setUploadTarget("laporan");
          setShowUploadDialog(true);
        }}
      />

      <PdfPreviewModal preview={pdfPreview} onClose={closePdfPreview} />

      <UploadFileDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onFileSelected={handleUpload}
      />
      <AddJenisDialog
        open={showAddJenisDialog}
        onClose={() => setShowAddJenisDialog(false)}
        title="Tambah Jenis Fasilitasi Hibah"
        onSubmit={handleAddJenis}
      />
      {editingJenisIndex !== null && pakets[editingJenisIndex] ? (
        <JenisLembagaDialog
          open
          onClose={() => setEditingJenisIndex(null)}
          title="Edit Jenis Fasilitasi Hibah"
          submitLabel="Simpan Jenis"
          initialValue={pakets[editingJenisIndex].nama_paket}
          onSubmit={handleEditJenis}
        />
      ) : null}
      <KuotaPengajuanDialog
        open={showAddKuotaDialog}
        onClose={() => setShowAddKuotaDialog(false)}
        title="Tambah Paket Sarana Prasarana 2026"
        submitLabel="Tambah Paket"
        paketOptions={paketOptions}
        onSubmit={handleAddKuota}
      />
      {editingKuotaIndex !== null && kuotaItems[editingKuotaIndex] ? (
        <KuotaPengajuanDialog
          open
          onClose={() => setEditingKuotaIndex(null)}
          title="Edit Paket Sarana Prasarana 2026"
          submitLabel="Simpan Paket"
          initialValue={kuotaItems[editingKuotaIndex]}
          paketOptions={paketOptions}
          jenisDisabled
          onSubmit={handleEditKuota}
        />
      ) : null}
    </>
  );
}

// ─── Page Component ─────────────────────────────────────

export default function PengaturanFasilitasiPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [fasilitasiData, setFasilitasiData] = useState<ApiFasilitasi[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const data = await adminFasilitasiApi.getAll();
      setFasilitasiData(data);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pentas = fasilitasiData.find((j) => j.jenis_fasilitasi_id === 1) ?? null;
  const hibah = fasilitasiData.find((j) => j.jenis_fasilitasi_id === 2) ?? null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTabContent data={pentas} onRefetch={loadData} />;
      case "pentas":
        return <PentasTabContent data={pentas} onRefetch={loadData} />;
      case "hibah":
        return <SaranaPrasaranaTabContent data={hibah} onRefetch={loadData} />;
    }
  };

  const tabTitle = (() => {
    switch (activeTab) {
      case "general":
        return "General";
      case "pentas":
        return "Fasilitasi Pentas";
      case "hibah":
        return "Fasilitasi Hibah";
    }
  })();

  return (
    <section className="h-full overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-237.5 pb-10 pt-6 lg:pt-7">
        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-[28px] font-bold leading-10.5 text-[rgba(38,43,67,0.9)]">
            Pengaturan Fasilitasi
          </h1>
          <p className="mt-4 max-w-157.75 text-[13px] leading-5 text-[rgba(38,43,67,0.9)]">
            Pantau perkembangan pengajuan fasilitasi pentas dan hibah yang telah diajukan.
          </p>
        </div>

        {/* Card with tabs + content */}
        <div className="flex flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_4px_14px_0_rgba(38,43,67,0.16)] md:flex-row">
          {/* Left: stepper/tabs */}
          <SettingsStepper activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Divider */}
          <div className="h-px bg-[rgba(38,43,67,0.12)] md:h-auto md:w-px" />

          {/* Right: content area */}
          <div className="flex min-w-0 flex-1 flex-col gap-6 p-5">
            <h2 className="text-[24px] font-medium leading-9.5 text-[#c23513]">{tabTitle}</h2>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </section>
  );
}
