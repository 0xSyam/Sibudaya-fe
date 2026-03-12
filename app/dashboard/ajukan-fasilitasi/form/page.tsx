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
  SelectField,
  TextInput,
} from "@/app/dashboard/components/forms/fields";
import { FormPageHeader } from "@/app/dashboard/components/forms/page-header";
import { FormStepper, type FormStep } from "@/app/dashboard/components/forms/stepper";
import { lembagaApi, fasilitasiApi } from "@/app/lib/api";
import type { Lembaga, PaketFasilitasi } from "@/app/lib/types";

const FORM_STORAGE_KEY = "pengajuan_form_data";

const stepOneProgress: FormStep[] = [
  {
    number: "01",
    title: "Identitas Lembaga",
    subtitle: "Lengkapi informasi dasar lembaga",
    state: "current",
  },
  {
    number: "02",
    title: "Detail Kegiatan",
    subtitle: "Informasi kegiatan",
    state: "upcoming",
  },
  {
    number: "03",
    title: "Administrasi & Dokumen",
    subtitle: "Lengkapi data administratif",
    state: "upcoming",
  },
];

export default function AjukanFasilitasiFormPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jenisId = Number(searchParams.get("jenis") ?? "1");

  const [lembaga, setLembaga] = useState<Lembaga | null>(null);
  const [paketList, setPaketList] = useState<PaketFasilitasi[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [namaLembaga, setNamaLembaga] = useState("");
  const [jenisKesenian, setJenisKesenian] = useState("");
  const [nik, setNik] = useState("");
  const [selectedPaket, setSelectedPaket] = useState("");
  const [sertifikatFile, setSertifikatFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [lem, paket] = await Promise.all([
          lembagaApi.getMe().catch(() => null),
          fasilitasiApi.getPaketByJenis(jenisId).catch(() => []),
        ]);

        if (lem) {
          setLembaga(lem);
          setNamaLembaga(lem.nama_lembaga);
          setJenisKesenian(lem.jenis_kesenian);
          if (lem.sertifikat_nik) {
            setNik(lem.sertifikat_nik.nomor_nik);
          }
        }
        setPaketList(paket);

        // Restore from localStorage
        const saved = localStorage.getItem(FORM_STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          if (data.namaLembaga) setNamaLembaga(data.namaLembaga);
          if (data.jenisKesenian) setJenisKesenian(data.jenisKesenian);
          if (data.nik) setNik(data.nik);
          if (data.selectedPaket) setSelectedPaket(data.selectedPaket);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [jenisId]);

  function handleSave() {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    const existing = saved ? JSON.parse(saved) : {};
    const formData = {
      ...existing,
      jenisId,
      namaLembaga,
      jenisKesenian,
      nik,
      selectedPaket,
      lembagaId: lembaga?.lembaga_id ?? existing.lembagaId,
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));

    // Store sertifikat file reference info (can't store File in localStorage)
    if (sertifikatFile) {
      sessionStorage.setItem("sertifikat_file_name", sertifikatFile.name);
    }

    router.push(`/dashboard/ajukan-fasilitasi/form/step-2?jenis=${jenisId}`);
  }

  if (loading) {
    return (
      <section className="flex h-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-[#c23513] border-t-transparent" />
      </section>
    );
  }

  return (
    <section className="h-full overflow-y-auto px-4 pb-10 pt-8 sm:px-6 lg:pt-[84px]">
      <div className="mx-auto w-full max-w-[920px]">
        <FormPageHeader
          title="Identitas Lembaga & Jenis Fasilitasi"
          description="Lengkapi informasi dasar lembaga budaya dan jenis fasilitasi yang diajukan."
        />

        <FormStepper steps={stepOneProgress} />

        <form
          className="mt-6 rounded-[10px] bg-white px-5 pb-5 pt-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="grid gap-x-[10px] gap-y-6 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="namaLembaga">Nama Lembaga Budaya</FieldLabel>
              <TextInput
                id="namaLembaga"
                name="namaLembaga"
                type="text"
                placeholder="Masukan nama lembaga"
                value={namaLembaga}
                onChange={(e) => setNamaLembaga(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="jenisKesenian">Jenis Kesenian</FieldLabel>
              <SelectField
                id="jenisKesenian"
                name="jenisKesenian"
                placeholder="Pilih jenis kesenian lembaga"
                options={["Tari", "Musik", "Teater", "Seni Rupa", "Sastra", "Lainnya"]}
                value={jenisKesenian}
                onChange={(e) => setJenisKesenian(e.target.value)}
              />
            </div>

            <div>
              <FieldLabel htmlFor="nik">Nomor Induk Kebudayaan(NIK)</FieldLabel>
              <TextInput
                id="nik"
                name="nik"
                type="text"
                placeholder="Masukan NIK"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
              />
              <HelperText>NIK yang diinput harus masih berlaku dan telah terdaftar</HelperText>
            </div>
            <div>
              <FieldLabel htmlFor="sertifikatNik">Sertifikat NIK</FieldLabel>
              <FileInputField
                id="sertifikatNik"
                name="sertifikatNik"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
                  setSertifikatFile(f);
                }}
              />
              <HelperText>Format file PDF dengan ukuran maksimal 10mb</HelperText>
            </div>
          </div>

          <div className="mt-6">
            <FieldLabel htmlFor="jenisPaketFasilitasi">
              {jenisId === 1 ? "Jenis Paket Fasilitasi Pentas" : "Jenis Paket Fasilitasi Hibah"}
            </FieldLabel>
            <SelectField
              id="jenisPaketFasilitasi"
              name="jenisPaketFasilitasi"
              placeholder="Pilih jenis fasilitasi"
              options={paketList.length > 0 ? paketList.map((p) => p.nama_paket) : ["Pembinaan Sanggar", "Pentas Seni", "Workshop", "Festival Budaya"]}
              value={selectedPaket}
              onChange={(e) => setSelectedPaket(e.target.value)}
            />
            <HelperText>
              Setiap lembaga budaya hanya dapat mengajukan satu paket fasilitasi dalam satu tahun
            </HelperText>
          </div>
        </form>

        <FormActionBar>
          <SecondaryLinkButton href="/dashboard/ajukan-fasilitasi">Kembali</SecondaryLinkButton>
          <PrimaryButton onClick={handleSave}>
            Simpan Dan Lanjutkan
          </PrimaryButton>
        </FormActionBar>
      </div>
    </section>
  );
}
