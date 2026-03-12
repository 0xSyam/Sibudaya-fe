"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FormActionBar,
  PrimaryButton,
  SecondaryLinkButton,
} from "@/app/dashboard/components/forms/actions";
import {
  FieldLabel,
  FileInputField,
  HelperText,
  TextAreaField,
  TextInput,
} from "@/app/dashboard/components/forms/fields";
import { FormPageHeader } from "@/app/dashboard/components/forms/page-header";
import { SamplePdfChip } from "@/app/dashboard/components/forms/sample-pdf-chip";
import { FormStepper, type FormStep } from "@/app/dashboard/components/forms/stepper";
import { pengajuanApi } from "@/app/lib/api";
import type { CreatePengajuanPentasDto, CreatePengajuanHibahDto } from "@/app/lib/types";

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
  const [nomorRekening, setNomorRekening] = useState("");
  const [namaPemegangRekening, setNamaPemegangRekening] = useState("");
  const [totalDana, setTotalDana] = useState("");
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [alamatLembaga, setAlamatLembaga] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.nomorHp) setNomorHp(data.nomorHp);
      if (data.email) setEmail(data.email);
      if (data.nomorRekening) setNomorRekening(data.nomorRekening);
      if (data.namaPemegangRekening) setNamaPemegangRekening(data.namaPemegangRekening);
      if (data.totalDana) setTotalDana(data.totalDana);
      if (data.alamatLembaga) setAlamatLembaga(data.alamatLembaga);
    }
  }, []);

  async function handleSubmit() {
    if (!proposalFile) {
      setError("Harap unggah file proposal terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      const formData = saved ? JSON.parse(saved) : {};

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
          nomor_rekening: nomorRekening,
          nama_pemegang_rekening: namaPemegangRekening,
          alamat_lembaga: alamatLembaga,
        };
        await pengajuanApi.submitPentas(dto, proposalFile);
      } else {
        // Hibah submission
        const dto: CreatePengajuanHibahDto = {
          jenis_kegiatan: formData.selectedPaket || formData.namaKegiatan || "",
          nama_penerima: namaPemegangRekening,
          email_penerima: email,
          no_hp_penerima: nomorHp,
          alamat_pengiriman: formData.alamatLokasi || alamatLembaga,
          provinsi: "",
          kabupaten_kota: "",
          kecamatan: "",
          kelurahan_desa: "",
          kode_pos: "",
          catatan: formData.tujuanKegiatan || "",
        };
        await pengajuanApi.submitHibah(dto, proposalFile);
      }

      // Clear form data on success
      localStorage.removeItem(FORM_STORAGE_KEY);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim pengajuan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="h-full overflow-y-auto px-4 pb-10 pt-8 sm:px-6 lg:pt-[84px]">
      <div className="mx-auto w-full max-w-[920px]">
        <FormPageHeader
          title="Administrasi & Dokumen Pendukung"
          description="Lengkapi data administratif dan unggah dokumen pendukung pengajuan."
        />

        <FormStepper steps={stepThreeProgress} />

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          className="mt-6 rounded-[10px] bg-white px-7 pb-8 pt-11"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="nomorHp">Nomor Hp.</FieldLabel>
              <TextInput
                id="nomorHp"
                name="nomorHp"
                type="tel"
                placeholder="Masukan nomor Hp."
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <TextInput
                id="email"
                name="email"
                type="email"
                placeholder="Masukan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="nomorRekening">Nomor Rekening</FieldLabel>
              <TextInput
                id="nomorRekening"
                name="nomorRekening"
                type="text"
                placeholder="Masukan nomor rekening"
                value={nomorRekening}
                onChange={(e) => setNomorRekening(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="namaPemegangRekening">Nama Pemegang Rekening</FieldLabel>
              <TextInput
                id="namaPemegangRekening"
                name="namaPemegangRekening"
                type="text"
                placeholder="Masukan nama pemegang rekening"
                value={namaPemegangRekening}
                onChange={(e) => setNamaPemegangRekening(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6">
            <FieldLabel htmlFor="totalDanaDiajukan">Total Dana yang Diajukan</FieldLabel>
            <TextInput
              id="totalDanaDiajukan"
              name="totalDanaDiajukan"
              type="number"
              placeholder="Rp. xx.xxx.xxx"
              italicPlaceholder
              value={totalDana}
              onChange={(e) => setTotalDana(e.target.value)}
            />
          </div>

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
                onChange={(e) => {
                  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
                  setProposalFile(f);
                }}
              />
              <HelperText>Format file PDF dengan ukuran maksimal 10mb</HelperText>
            </div>
          </div>

          <div className="mt-6">
            <FieldLabel htmlFor="alamatLembaga">Alamat Lembaga</FieldLabel>
            <TextAreaField
              id="alamatLembaga"
              name="alamatLembaga"
              placeholder="Masukan alamat lembaga"
              className="h-[68px]"
              value={alamatLembaga}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAlamatLembaga(e.target.value)}
            />
          </div>
        </form>

        <FormActionBar>
          <SecondaryLinkButton href={`/dashboard/ajukan-fasilitasi/form/step-2?jenis=${jenisId}`}>
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
