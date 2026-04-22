"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { get, trim } from "lodash";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  FormActionBar,
  PrimaryButton,
  SecondaryLinkButton,
} from "@/app/dashboard/components/forms/actions";
import {
  ErrorText,
  FieldLabel,
  FileInputField,
  HelperText,
  SearchableBankSelectField,
  TextAreaField,
  TextInput,
} from "@/app/dashboard/components/forms/fields";
import { FormPageHeader } from "@/app/dashboard/components/forms/page-header";
import { SamplePdfChip } from "@/app/dashboard/components/forms/sample-pdf-chip";
import {
  FormStepper,
  type FormStep,
} from "@/app/dashboard/components/forms/stepper";
import { pengajuanApi, lembagaApi, fasilitasiApi } from "@/app/lib/api";
import {
  pdfUploadValidation,
  validateUploadFile,
} from "@/app/lib/file-validation";
import {
  clearPendingPengajuanDraftFiles,
  getPendingSertifikatNikFile,
} from "@/app/lib/pengajuan-draft-store";
import { buildProtectedFileUrl } from "@/app/lib/file-url";
import { useToast } from "@/app/lib/toast-context";
import type {
  CreatePengajuanPentasDto,
  CreatePengajuanHibahDto,
  PaketFasilitasi,
} from "@/app/lib/types";
import bankList from "@/list_banks.json";

const FORM_STORAGE_KEY = "pengajuan_form_data";
const SUBMIT_SUCCESS_NOTICE_KEY = "pengajuan_submit_notice";

const stepThreeBaseSchema = z.object({
  nomorHp: z
    .string()
    .trim(),
  email: z.string().trim(),
  namaBank: z.string().trim(),
  nomorRekening: z.string().trim(),
  namaPemegangRekening: z.string().trim(),
  totalDana: z.string(),
  alamatLembaga: z.string().trim(),
});

function createStepThreeSchema(jenisId: number) {
  return stepThreeBaseSchema.superRefine((data, ctx) => {
    if (jenisId !== 1) {
      return;
    }

    if (!data.nomorHp.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["nomorHp"], message: "Nomor HP wajib diisi" });
    } else if (!/^[0-9+\-\s]{8,15}$/.test(data.nomorHp.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["nomorHp"], message: "Format nomor HP tidak valid" });
    }

    if (!data.email.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Email wajib diisi" });
    } else if (!z.string().email().safeParse(data.email.trim()).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Format email tidak valid" });
    }

    if (!data.namaBank.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["namaBank"], message: "Nama bank wajib diisi" });
    }

    if (!data.nomorRekening.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["nomorRekening"], message: "Nomor rekening wajib diisi" });
    } else if (!/^\d{8,30}$/.test(data.nomorRekening.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["nomorRekening"], message: "Format nomor rekening tidak valid" });
    }

    if (!data.namaPemegangRekening.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["namaPemegangRekening"], message: "Nama pemegang rekening wajib diisi" });
    }

    if (!data.totalDana.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["totalDana"], message: "Total dana harus lebih dari 0" });
    } else if (Number(data.totalDana) <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["totalDana"], message: "Total dana harus lebih dari 0" });
    }

    if (!data.alamatLembaga.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["alamatLembaga"], message: "Alamat lembaga wajib diisi" });
    }
  });
}

const stepThreeProgress: FormStep[] = [
  {
    number: "01",
    title: "Identitas Lembaga",
    subtitle: "Lengkapi informasi dasar lembaga",
    state: "completed",
  },
  {
    number: "02",
    title: "Detail Kegiatan",
    subtitle: "Informasi kegiatan",
    state: "completed",
  },
  {
    number: "03",
    title: "Administrasi & Dokumen",
    subtitle: "Lengkapi data administratif",
    state: "current",
  },
];

type StepThreeFormValues = {
  nomorHp: string;
  email: string;
  namaBank: string;
  nomorRekening: string;
  namaPemegangRekening: string;
  totalDana: string;
  alamatLembaga: string;
};

export default function AjukanFasilitasiFormStep3Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const jenisId = Number(searchParams.get("jenis") ?? "1");
  const stepThreeSchema = useMemo(() => createStepThreeSchema(jenisId), [jenisId]);

  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{
    url: string;
    title: string;
    fromObjectUrl: boolean;
  } | null>(null);
  const [templateProposalUrl, setTemplateProposalUrl] = useState<string | null>(null);
  const [paketList, setPaketList] = useState<PaketFasilitasi[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit: handleRHFSubmit,
    formState: { errors },
    reset,
  } = useForm<StepThreeFormValues>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: {
      nomorHp: "",
      email: "",
      namaBank: "",
      nomorRekening: "",
      namaPemegangRekening: "",
      totalDana: "",
      alamatLembaga: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const bankOptions = useMemo(
    () =>
      bankList.data
        .filter((bank) => bank.is_active)
        .map((bank) => ({
          id: bank.id,
          label: bank.label,
          bank_code: bank.bank_code,
        })),
    [],
  );

  function buildUploadUrl(path: string): string {
    return buildProtectedFileUrl(path);
  }

  function closePdfPreview() {
    if (pdfPreview?.fromObjectUrl) {
      URL.revokeObjectURL(pdfPreview.url);
    }
    setPdfPreview(null);
  }

  function openPdfPreview(url: string, title: string, fromObjectUrl = false) {
    if (pdfPreview?.fromObjectUrl) {
      URL.revokeObjectURL(pdfPreview.url);
    }

    setPdfPreview({
      url,
      title,
      fromObjectUrl,
    });
  }

  function validate(values: StepThreeFormValues) {
    if (jenisId === 1) {
      const parsed = stepThreeSchema.safeParse({
        nomorHp: values.nomorHp,
        email: values.email,
        namaBank: values.namaBank,
        nomorRekening: values.nomorRekening,
        namaPemegangRekening: values.namaPemegangRekening,
        totalDana: values.totalDana,
        alamatLembaga: values.alamatLembaga,
      });

      if (!parsed.success) {
        setSubmitError(parsed.error.issues[0]?.message ?? "Data administrasi belum valid");
        return false;
      }
    }

    if (!proposalFile) {
      setSubmitError("File proposal wajib diunggah");
      return false;
    }

    const proposalError = validateUploadFile(proposalFile, {
      ...pdfUploadValidation,
      label: "Proposal",
    });

    if (proposalError) {
      setSubmitError(proposalError);
      return false;
    }

    return true;
  }

  useEffect(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
      const defaults = {
        nomorHp: String(get(data, "nomorHp", "")),
        email: String(get(data, "email", "")),
        namaBank: String(get(data, "namaBank", "")),
        nomorRekening: String(get(data, "nomorRekening", "")),
        namaPemegangRekening: String(get(data, "namaPemegangRekening", "")),
        totalDana: String(get(data, "totalDana", "")),
        alamatLembaga: String(get(data, "alamatLembaga", "")),
      };
      reset(defaults);
    }
  }, [reset]);

  useEffect(() => {
    let mounted = true;

    Promise.all([fasilitasiApi.getAll(), fasilitasiApi.getPaketByJenis(jenisId)])
      .then(([list, paket]) => {
        if (!mounted) return;
        const currentJenis = list.find((j) => j.jenis_fasilitasi_id === jenisId);
        setTemplateProposalUrl(currentJenis?.template_proposal_file ?? null);
        setPaketList(paket);
      })
      .catch(() => {
        if (!mounted) return;
        setTemplateProposalUrl(null);
        setPaketList([]);
      });

    return () => {
      mounted = false;
    };
  }, [jenisId]);

  useEffect(() => {
    return () => {
      if (pdfPreview?.fromObjectUrl) {
        URL.revokeObjectURL(pdfPreview.url);
      }
    };
  }, [pdfPreview]);

  const onSubmit = handleRHFSubmit(async (values) => {
    if (!validate(values)) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      const formData = saved ? JSON.parse(saved) : {};
      const selectedPaketId =
        String(get(formData, "selectedPaketId", "")) ||
        paketList.find((paket) => paket.nama_paket === get(formData, "selectedPaket", ""))?.paket_id ||
        "";

      if (!selectedPaketId) {
        throw new Error("Jenis paket fasilitasi belum valid. Kembali ke langkah identitas lembaga dan pilih ulang paket.");
      }

      const lembagaPayload = {
        nama_lembaga: get(formData, "namaLembaga", ""),
        jenis_kesenian: get(formData, "jenisKesenian", ""),
        alamat: jenisId === 1 ? values.alamatLembaga : get(formData, "alamatLengkap", ""),
        no_hp: jenisId === 1 ? values.nomorHp : get(formData, "nomorHp", ""),
        email: jenisId === 1 ? values.email : get(formData, "email", ""),
      };
      const pendingSertifikatNikFile = getPendingSertifikatNikFile();

      if (!formData.lembagaId) {
        const newLembaga = await lembagaApi.create(lembagaPayload);
        formData.lembagaId = newLembaga.lembaga_id;
      } else {
        try {
          await lembagaApi.updateMe(lembagaPayload);
        } catch (error) {
          const apiError = error as { statusCode?: number };

          // Draft lokal bisa menyimpan lembagaId lama walau record lembaga sudah tidak ada.
          if (apiError.statusCode === 404) {
            const newLembaga = await lembagaApi.create(lembagaPayload);
            formData.lembagaId = newLembaga.lembaga_id;
          } else {
            throw error;
          }
        }
      }

      if (pendingSertifikatNikFile) {
        if (!trim(get(formData, "nik", ""))) {
          throw new Error("Nomor NIK belum lengkap. Kembali ke langkah identitas lembaga.");
        }
        if (!get(formData, "nikTanggalTerbit") || !get(formData, "nikTanggalBerlakuSampai")) {
          throw new Error("Tanggal sertifikat NIK belum lengkap. Kembali ke langkah identitas lembaga.");
        }

        await lembagaApi.uploadSertifikatNik(
          {
            nomor_nik: get(formData, "nik", ""),
            tanggal_terbit: get(formData, "nikTanggalTerbit", ""),
            tanggal_berlaku_sampai: get(formData, "nikTanggalBerlakuSampai", ""),
          },
          pendingSertifikatNikFile,
        );
      } else if (!formData.hasExistingSertifikat) {
        throw new Error("File sertifikat NIK belum tersedia. Pilih ulang file sertifikat pada langkah identitas lembaga.");
      }

      localStorage.setItem(
        FORM_STORAGE_KEY,
        JSON.stringify({
          ...formData,
          namaBank: jenisId === 1 ? values.namaBank : get(formData, "namaBank"),
        }),
      );

      if (jenisId === 1) {
        // Pentas submission
        const dto: CreatePengajuanPentasDto = {
          jenis_kegiatan: formData.selectedPaket || formData.namaKegiatan || "",
          paket_id: selectedPaketId,
          judul_kegiatan: formData.namaKegiatan || "",
          tujuan_kegiatan: formData.tujuanKegiatan || "",
          lokasi_kegiatan: formData.alamatLokasi || "",
          tanggal_mulai: formData.tanggalMulai || "",
          tanggal_selesai: formData.tanggalSelesai || "",
          total_pengajuan_dana: Number(values.totalDana) || 0,
          nama_bank: values.namaBank,
          nomor_rekening: values.nomorRekening,
          nama_pemegang_rekening: values.namaPemegangRekening,
          alamat_lembaga: values.alamatLembaga,
        };
        await pengajuanApi.submitPentas(dto, proposalFile!);
      } else {
        // Hibah submission
        const dto: CreatePengajuanHibahDto = {
          jenis_kegiatan: formData.selectedPaket || formData.namaKegiatan || "",
          paket_id: selectedPaketId,
          nama_penerima: formData.namaPenerima || "",
          email_penerima: formData.email || "",
          no_hp_penerima: formData.nomorHp || "",
          alamat_pengiriman: formData.alamatLengkap || "",
          provinsi: formData.provinsi || "",
          kabupaten_kota: formData.kabupatenKota || "",
          kecamatan: formData.kecamatan || "",
          kelurahan_desa: formData.kelurahanDesa || "",
          kode_pos: formData.kodePos || "",
          catatan: formData.tujuanKegiatan || "",
        };
        await pengajuanApi.submitHibah(dto, proposalFile!);
      }

      // Clear form data on success
      localStorage.removeItem(FORM_STORAGE_KEY);
      clearPendingPengajuanDraftFiles();
      sessionStorage.removeItem("sertifikat_file_name");
      sessionStorage.setItem(SUBMIT_SUCCESS_NOTICE_KEY, "Pengajuan berhasil dikirim.");
      router.push("/dashboard");
    } catch (err: unknown) {
      const apiError = err as {
        message?: string | string[];
        statusCode?: number;
      };
      const msg = Array.isArray(apiError?.message)
        ? apiError.message.join(", ")
        : (apiError?.message ?? "Gagal mengirim pengajuan. Silakan coba lagi.");
      setSubmitError(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <section className="h-full overflow-y-auto px-4 pb-10 pt-8 sm:px-6 lg:pt-21">
      <div className="mx-auto w-full max-w-230">
        <FormPageHeader
          title={
            jenisId === 1
              ? "Administrasi & Dokumen Pendukung"
              : "Dokumen Pendukung"
          }
          description={
            jenisId === 1
              ? "Lengkapi data administratif dan unggah dokumen pendukung pengajuan."
              : "Unggah dokumen pendukung untuk proses verifikasi pengajuan."
          }
        />

        <FormStepper steps={stepThreeProgress} />

        <form
          className="mt-6 rounded-[10px] bg-white px-7 pb-8 pt-11"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          {jenisId === 1 && (
            <>
              <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="nomorHp">Nomor Hp.</FieldLabel>
                  <Controller
                    name="nomorHp"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        id="nomorHp"
                        name={field.name}
                        type="tel"
                        placeholder="Masukan nomor Hp."
                        value={field.value}
                        isError={!!errors.nomorHp}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setSubmitError(null);
                        }}
                      />
                    )}
                  />
                  {errors.nomorHp && <ErrorText>{String(errors.nomorHp.message)}</ErrorText>}
                </div>
                <div>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        id="email"
                        name={field.name}
                        type="email"
                        placeholder="Masukan email"
                        value={field.value}
                        isError={!!errors.email}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setSubmitError(null);
                        }}
                      />
                    )}
                  />
                  {errors.email && <ErrorText>{String(errors.email.message)}</ErrorText>}
                </div>
                <div>
                  <FieldLabel htmlFor="namaBank">Nama Bank</FieldLabel>
                  <Controller
                    name="namaBank"
                    control={control}
                    render={({ field }) => (
                      <SearchableBankSelectField
                        id="namaBank"
                        name={field.name}
                        banks={bankOptions}
                        value={field.value}
                        isError={!!errors.namaBank}
                        searchPlaceholder="Cari nama bank"
                        selectPlaceholder="Pilih bank"
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSubmitError(null);
                        }}
                      />
                    )}
                  />
                  {errors.namaBank && <ErrorText>{String(errors.namaBank.message)}</ErrorText>}
                </div>
                <div>
                  <FieldLabel htmlFor="nomorRekening">
                    Nomor Rekening
                  </FieldLabel>
                  <Controller
                    name="nomorRekening"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        id="nomorRekening"
                        name={field.name}
                        type="text"
                        placeholder="Masukan nomor rekening"
                        value={field.value}
                        isError={!!errors.nomorRekening}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setSubmitError(null);
                        }}
                      />
                    )}
                  />
                  {errors.nomorRekening && <ErrorText>{String(errors.nomorRekening.message)}</ErrorText>}
                </div>
                <div>
                  <FieldLabel htmlFor="namaPemegangRekening">
                    Nama Pemegang Rekening
                  </FieldLabel>
                  <Controller
                    name="namaPemegangRekening"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        id="namaPemegangRekening"
                        name={field.name}
                        type="text"
                        placeholder="Masukan nama pemegang rekening"
                        value={field.value}
                        isError={!!errors.namaPemegangRekening}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setSubmitError(null);
                        }}
                      />
                    )}
                  />
                  {errors.namaPemegangRekening && <ErrorText>{String(errors.namaPemegangRekening.message)}</ErrorText>}
                </div>
              </div>

              <div className="mt-6">
                <FieldLabel htmlFor="totalDanaDiajukan">
                  Total Dana yang Diajukan
                </FieldLabel>
                <Controller
                  name="totalDana"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      id="totalDanaDiajukan"
                      name={field.name}
                      type="number"
                      placeholder="Rp. xx.xxx.xxx"
                      italicPlaceholder
                      value={field.value}
                      isError={!!errors.totalDana}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setSubmitError(null);
                      }}
                    />
                  )}
                />
                {errors.totalDana && <ErrorText>{String(errors.totalDana.message)}</ErrorText>}
              </div>
            </>
          )}

          <div className="mt-6 grid gap-x-5 gap-y-6 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="contohProposal">Contoh Proposal</FieldLabel>
              {templateProposalUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    openPdfPreview(
                      buildUploadUrl(templateProposalUrl),
                      templateProposalUrl.split("/").pop() ?? "Contoh Proposal.pdf",
                    );
                  }}
                  className="inline-flex cursor-pointer"
                >
                  <SamplePdfChip
                    filename={templateProposalUrl.split("/").pop() ?? "Contoh Proposal.pdf"}
                  />
                </button>
              ) : (
                <SamplePdfChip filename="Contoh Proposal.pdf" />
              )}
            </div>
            <div>
              <FieldLabel htmlFor="proposal">Proposal</FieldLabel>
              <FileInputField
                id="proposal"
                name="proposal"
                accept=".pdf,application/pdf"
                isError={submitError?.toLowerCase().includes("proposal")}
                onChange={(e) => {
                  closePdfPreview();
                  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
                  if (f) {
                    const validationMessage = validateUploadFile(f, {
                      ...pdfUploadValidation,
                      label: "Proposal",
                    });
                    if (validationMessage) {
                      setProposalFile(null);
                      setSubmitError(validationMessage);
                      e.currentTarget.value = "";
                      return;
                    }
                  }
                  setProposalFile(f);
                  setSubmitError(null);
                }}
              />
              {proposalFile ? (
                <button
                  type="button"
                  onClick={() => {
                    openPdfPreview(
                      URL.createObjectURL(proposalFile),
                      proposalFile.name,
                      true,
                    );
                  }}
                  className="mt-2 inline-flex items-center rounded-lg border border-[rgba(194,53,19,0.35)] px-3 py-1.5 text-[13px] font-medium text-[#a42e12] hover:bg-[rgba(194,53,19,0.08)]"
                >
                  Review PDF
                </button>
              ) : null}
              {submitError?.toLowerCase().includes("proposal") ? (
                <ErrorText>{submitError}</ErrorText>
              ) : (
                <HelperText>
                  Format file PDF dengan ukuran maksimal 10mb
                </HelperText>
              )}
            </div>
          </div>

          {jenisId === 1 && (
            <div className="mt-6">
              <FieldLabel htmlFor="alamatLembaga">Alamat Lembaga</FieldLabel>
              <Controller
                name="alamatLembaga"
                control={control}
                render={({ field }) => (
                  <TextAreaField
                    id="alamatLembaga"
                    name={field.name}
                    placeholder="Masukan alamat lembaga"
                    className="h-17"
                    value={field.value}
                    isError={!!errors.alamatLembaga}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setSubmitError(null);
                    }}
                  />
                )}
              />
              {errors.alamatLembaga && <ErrorText>{String(errors.alamatLembaga.message)}</ErrorText>}
            </div>
          )}
        </form>

        <FormActionBar>
          <SecondaryLinkButton
            href={`/dashboard/ajukan-fasilitasi/form/step-2?jenis=${jenisId}`}
          >
            Kembali
          </SecondaryLinkButton>
          <PrimaryButton onClick={() => void onSubmit()} disabled={submitting}>
            {submitting ? "Mengirim..." : "Kirim Pengajuan"}
          </PrimaryButton>
        </FormActionBar>
      </div>

      {pdfPreview ? (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-[rgba(16,23,40,0.56)] px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="Preview PDF"
        >
          <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-[0_20px_64px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between border-b border-[rgba(38,43,67,0.14)] px-5 py-3">
              <p className="line-clamp-1 text-[15px] font-medium text-[rgba(38,43,67,0.92)]">
                {pdfPreview.title}
              </p>
              <button
                type="button"
                onClick={closePdfPreview}
                className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-[rgba(38,43,67,0.75)] hover:bg-[rgba(38,43,67,0.08)]"
              >
                Tutup
              </button>
            </div>

            <div className="h-[75vh] w-full bg-[rgba(38,43,67,0.04)]">
              <iframe title={pdfPreview.title} src={pdfPreview.url} className="h-full w-full" />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
