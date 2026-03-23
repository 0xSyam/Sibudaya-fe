"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { pengajuanApi, lembagaApi } from "@/app/lib/api";
import {
  pdfUploadValidation,
  validateUploadFile,
} from "@/app/lib/file-validation";
import {
  clearPendingPengajuanDraftFiles,
  getPendingSertifikatNikFile,
} from "@/app/lib/pengajuan-draft-store";
import type {
  CreatePengajuanPentasDto,
  CreatePengajuanHibahDto,
} from "@/app/lib/types";
import bankList from "@/list_banks.json";

const FORM_STORAGE_KEY = "pengajuan_form_data";

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

export default function AjukanFasilitasiFormStep3Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jenisId = Number(searchParams.get("jenis") ?? "1");

  const [nomorHp, setNomorHp] = useState("");
  const [email, setEmail] = useState("");
  const [namaBank, setNamaBank] = useState("");
  const [nomorRekening, setNomorRekening] = useState("");
  const [namaPemegangRekening, setNamaPemegangRekening] = useState("");
  const [totalDana, setTotalDana] = useState("");
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [alamatLembaga, setAlamatLembaga] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  function validate() {
    const newErrors: Record<string, string> = {};
    if (jenisId === 1) {
      if (!nomorHp.trim()) newErrors.nomorHp = "Nomor HP wajib diisi";
      else if (!/^[0-9+\-\s]{8,15}$/.test(nomorHp.trim()))
        newErrors.nomorHp = "Format nomor HP tidak valid";
      if (!email.trim()) newErrors.email = "Email wajib diisi";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
        newErrors.email = "Format email tidak valid";
      if (!namaBank.trim()) newErrors.namaBank = "Nama bank wajib diisi";
      if (!nomorRekening.trim())
        newErrors.nomorRekening = "Nomor rekening wajib diisi";
      else if (!/^\d{8,30}$/.test(nomorRekening.trim()))
        newErrors.nomorRekening = "Format nomor rekening tidak valid";
      if (!totalDana || Number(totalDana) <= 0)
        newErrors.totalDana = "Total dana harus lebih dari 0";
      if (!namaPemegangRekening.trim())
        newErrors.namaPemegangRekening = "Nama pemegang rekening wajib diisi";
      if (!alamatLembaga.trim())
        newErrors.alamatLembaga = "Alamat lembaga wajib diisi";
    }
    if (!proposalFile) newErrors.proposalFile = "File proposal wajib diunggah";
    else {
      const proposalError = validateUploadFile(proposalFile, {
        ...pdfUploadValidation,
        label: "Proposal",
      });
      if (proposalError) newErrors.proposalFile = proposalError;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  useEffect(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.nomorHp) setNomorHp(data.nomorHp);
      if (data.email) setEmail(data.email);
      if (data.namaBank) setNamaBank(data.namaBank);
      if (data.nomorRekening) setNomorRekening(data.nomorRekening);
      if (data.namaPemegangRekening)
        setNamaPemegangRekening(data.namaPemegangRekening);
      if (data.totalDana) setTotalDana(data.totalDana);
      if (data.alamatLembaga) setAlamatLembaga(data.alamatLembaga);
    }
  }, []);

  async function handleSubmit() {
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      const formData = saved ? JSON.parse(saved) : {};
      const lembagaPayload = {
        nama_lembaga: formData.namaLembaga || "",
        jenis_kesenian: formData.jenisKesenian || "",
        alamat: jenisId === 1 ? alamatLembaga : formData.alamatLengkap || "",
        no_hp: jenisId === 1 ? nomorHp : formData.nomorHp || "",
        email: jenisId === 1 ? email : formData.email || "",
      };
      const pendingSertifikatNikFile = getPendingSertifikatNikFile();

      if (!formData.lembagaId) {
        const newLembaga = await lembagaApi.create(lembagaPayload);
        formData.lembagaId = newLembaga.lembaga_id;
      } else {
        await lembagaApi.updateMe(lembagaPayload);
      }

      if (pendingSertifikatNikFile) {
        if (!formData.nik?.trim()) {
          throw {
            message:
              "Nomor NIK belum lengkap. Kembali ke langkah identitas lembaga.",
          };
        }
        if (!formData.nikTanggalTerbit || !formData.nikTanggalBerlakuSampai) {
          throw {
            message:
              "Tanggal sertifikat NIK belum lengkap. Kembali ke langkah identitas lembaga.",
          };
        }

        await lembagaApi.uploadSertifikatNik(
          {
            nomor_nik: formData.nik,
            tanggal_terbit: formData.nikTanggalTerbit,
            tanggal_berlaku_sampai: formData.nikTanggalBerlakuSampai,
          },
          pendingSertifikatNikFile,
        );
      } else if (!formData.hasExistingSertifikat) {
        throw {
          message:
            "File sertifikat NIK belum tersedia. Pilih ulang file sertifikat pada langkah identitas lembaga.",
        };
      }

      localStorage.setItem(
        FORM_STORAGE_KEY,
        JSON.stringify({
          ...formData,
          namaBank: jenisId === 1 ? namaBank : formData.namaBank,
        }),
      );

      if (jenisId === 1) {
        // Pentas submission
        const dto: CreatePengajuanPentasDto = {
          jenis_kegiatan: formData.selectedPaket || formData.namaKegiatan || "",
          judul_kegiatan: formData.namaKegiatan || "",
          tujuan_kegiatan: formData.tujuanKegiatan || "",
          lokasi_kegiatan: formData.alamatLokasi || "",
          tanggal_mulai: formData.tanggalMulai || "",
          tanggal_selesai: formData.tanggalSelesai || "",
          total_pengajuan_dana: Number(totalDana) || 0,
          nama_bank: namaBank,
          nomor_rekening: nomorRekening,
          nama_pemegang_rekening: namaPemegangRekening,
          alamat_lembaga: alamatLembaga,
        };
        await pengajuanApi.submitPentas(dto, proposalFile!);
      } else {
        // Hibah submission
        const dto: CreatePengajuanHibahDto = {
          jenis_kegiatan: formData.selectedPaket || formData.namaKegiatan || "",
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
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="h-full overflow-y-auto px-4 pb-10 pt-8 sm:px-6 lg:pt-[84px]">
      <div className="mx-auto w-full max-w-[920px]">
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

        {submitError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <form
          className="mt-6 rounded-[10px] bg-white px-7 pb-8 pt-11"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {jenisId === 1 && (
            <>
              <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="nomorHp">Nomor Hp.</FieldLabel>
                  <TextInput
                    id="nomorHp"
                    name="nomorHp"
                    type="tel"
                    placeholder="Masukan nomor Hp."
                    value={nomorHp}
                    isError={!!errors.nomorHp}
                    onChange={(e) => {
                      setNomorHp(e.target.value);
                      setErrors((p) => ({ ...p, nomorHp: "" }));
                    }}
                  />
                  {errors.nomorHp && <ErrorText>{errors.nomorHp}</ErrorText>}
                </div>
                <div>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <TextInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Masukan email"
                    value={email}
                    isError={!!errors.email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((p) => ({ ...p, email: "" }));
                    }}
                  />
                  {errors.email && <ErrorText>{errors.email}</ErrorText>}
                </div>
                <div>
                  <FieldLabel htmlFor="namaBank">Nama Bank</FieldLabel>
                  <SearchableBankSelectField
                    id="namaBank"
                    name="namaBank"
                    banks={bankOptions}
                    value={namaBank}
                    isError={!!errors.namaBank}
                    searchPlaceholder="Cari nama bank"
                    selectPlaceholder="Pilih bank"
                    onValueChange={(value) => {
                      setNamaBank(value);
                      setErrors((p) => ({ ...p, namaBank: "" }));
                    }}
                  />
                  {errors.namaBank && <ErrorText>{errors.namaBank}</ErrorText>}
                </div>
                <div>
                  <FieldLabel htmlFor="nomorRekening">
                    Nomor Rekening
                  </FieldLabel>
                  <TextInput
                    id="nomorRekening"
                    name="nomorRekening"
                    type="text"
                    placeholder="Masukan nomor rekening"
                    value={nomorRekening}
                    isError={!!errors.nomorRekening}
                    onChange={(e) => {
                      setNomorRekening(e.target.value);
                      setErrors((p) => ({ ...p, nomorRekening: "" }));
                    }}
                  />
                  {errors.nomorRekening && (
                    <ErrorText>{errors.nomorRekening}</ErrorText>
                  )}
                </div>
                <div>
                  <FieldLabel htmlFor="namaPemegangRekening">
                    Nama Pemegang Rekening
                  </FieldLabel>
                  <TextInput
                    id="namaPemegangRekening"
                    name="namaPemegangRekening"
                    type="text"
                    placeholder="Masukan nama pemegang rekening"
                    value={namaPemegangRekening}
                    isError={!!errors.namaPemegangRekening}
                    onChange={(e) => {
                      setNamaPemegangRekening(e.target.value);
                      setErrors((p) => ({ ...p, namaPemegangRekening: "" }));
                    }}
                  />
                  {errors.namaPemegangRekening && (
                    <ErrorText>{errors.namaPemegangRekening}</ErrorText>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <FieldLabel htmlFor="totalDanaDiajukan">
                  Total Dana yang Diajukan
                </FieldLabel>
                <TextInput
                  id="totalDanaDiajukan"
                  name="totalDanaDiajukan"
                  type="number"
                  placeholder="Rp. xx.xxx.xxx"
                  italicPlaceholder
                  value={totalDana}
                  isError={!!errors.totalDana}
                  onChange={(e) => {
                    setTotalDana(e.target.value);
                    setErrors((p) => ({ ...p, totalDana: "" }));
                  }}
                />
                {errors.totalDana && <ErrorText>{errors.totalDana}</ErrorText>}
              </div>
            </>
          )}

          <div className="mt-6 grid gap-x-5 gap-y-6 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="contohProposal">Contoh Proposal</FieldLabel>
              <SamplePdfChip filename="Contoh Proposal.pdf" />
            </div>
            <div>
              <FieldLabel htmlFor="proposal">Proposal</FieldLabel>
              <FileInputField
                id="proposal"
                name="proposal"
                accept=".pdf,application/pdf"
                isError={!!errors.proposalFile}
                onChange={(e) => {
                  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
                  if (f) {
                    const validationMessage = validateUploadFile(f, {
                      ...pdfUploadValidation,
                      label: "Proposal",
                    });
                    if (validationMessage) {
                      setProposalFile(null);
                      setErrors((p) => ({
                        ...p,
                        proposalFile: validationMessage,
                      }));
                      e.currentTarget.value = "";
                      return;
                    }
                  }
                  setProposalFile(f);
                  setErrors((p) => ({ ...p, proposalFile: "" }));
                }}
              />
              {errors.proposalFile ? (
                <ErrorText>{errors.proposalFile}</ErrorText>
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
              <TextAreaField
                id="alamatLembaga"
                name="alamatLembaga"
                placeholder="Masukan alamat lembaga"
                className="h-[68px]"
                value={alamatLembaga}
                isError={!!errors.alamatLembaga}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setAlamatLembaga(e.target.value);
                  setErrors((p) => ({ ...p, alamatLembaga: "" }));
                }}
              />
              {errors.alamatLembaga && (
                <ErrorText>{errors.alamatLembaga}</ErrorText>
              )}
            </div>
          )}
        </form>

        <FormActionBar>
          <SecondaryLinkButton
            href={`/dashboard/ajukan-fasilitasi/form/step-2?jenis=${jenisId}`}
          >
            Kembali
          </SecondaryLinkButton>
          <PrimaryButton onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Mengirim..." : "Kirim Pengajuan"}
          </PrimaryButton>
        </FormActionBar>
      </div>
    </section>
  );
}
