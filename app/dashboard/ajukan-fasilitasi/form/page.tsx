"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  DateInput,
  ErrorText,
  FieldLabel,
  FileInputField,
  HelperText,
  SelectField,
  TextInput,
} from "@/app/dashboard/components/forms/fields";
import { FormPageHeader } from "@/app/dashboard/components/forms/page-header";
import { FormStepper, type FormStep } from "@/app/dashboard/components/forms/stepper";
import { lembagaApi, fasilitasiApi } from "@/app/lib/api";
import { pdfUploadValidation, validateUploadFile } from "@/app/lib/file-validation";
import { setPendingSertifikatNikFile } from "@/app/lib/pengajuan-draft-store";
import type { Lembaga, PaketFasilitasi } from "@/app/lib/types";

const FORM_STORAGE_KEY = "pengajuan_form_data";

type StepOneFormValues = {
  namaLembaga: string;
  jenisKesenian: string;
  nik: string;
  nikTanggalTerbit: string;
  nikTanggalBerlakuSampai: string;
  selectedPaket: string;
};

const stepOneSchema = z
  .object({
    namaLembaga: z.string().trim().min(1, "Nama lembaga wajib diisi"),
    jenisKesenian: z.string().trim().min(1, "Jenis kesenian wajib dipilih"),
    nik: z.string().trim().regex(/^\d{16}$/, "Format NIK harus 16 digit angka"),
    nikTanggalTerbit: z.string().min(1, "Tanggal terbit sertifikat wajib diisi"),
    nikTanggalBerlakuSampai: z.string().min(1, "Tanggal berlaku sertifikat wajib diisi"),
    selectedPaket: z.string().min(1, "Jenis paket fasilitasi wajib dipilih"),
  })
  .refine((data) => data.nikTanggalBerlakuSampai >= data.nikTanggalTerbit, {
    message: "Tanggal berlaku harus setelah tanggal terbit",
    path: ["nikTanggalBerlakuSampai"],
  });

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
  const [jenisKesenianOptions, setJenisKesenianOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sertifikatFile, setSertifikatFile] = useState<File | null>(null);
  const [sertifikatError, setSertifikatError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StepOneFormValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      namaLembaga: "",
      jenisKesenian: "",
      nik: "",
      nikTanggalTerbit: "",
      nikTanggalBerlakuSampai: "",
      selectedPaket: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const placeholderPaketOptions = useMemo(
    () => ["Pembinaan Sanggar", "Pentas Seni", "Workshop", "Festival Budaya"],
    [],
  );

  const fallbackJenisKesenianOptions = useMemo(
    () => ["Tari", "Musik", "Teater", "Seni Rupa", "Sastra", "Lainnya"],
    [],
  );

  useEffect(() => {
    async function load() {
      try {
        const [lem, paket] = await Promise.all([
          lembagaApi.getMe().catch(() => null),
          fasilitasiApi.getPaketByJenis(jenisId).catch(() => []),
        ]);

        const jenisLembaga = await fasilitasiApi.getJenisLembaga().catch(() => []);
        const dynamicOptions = jenisLembaga
          .map((item) => trim(item.nama))
          .filter((name) => name.length > 0);

        const draftRaw = localStorage.getItem(FORM_STORAGE_KEY);
        const draft = draftRaw ? (JSON.parse(draftRaw) as Partial<StepOneFormValues>) : {};

        const nextValues: StepOneFormValues = {
          namaLembaga: String(get(draft, "namaLembaga", "")),
          jenisKesenian: String(get(draft, "jenisKesenian", "")),
          nik: String(get(draft, "nik", "")),
          nikTanggalTerbit: String(get(draft, "nikTanggalTerbit", "")),
          nikTanggalBerlakuSampai: String(get(draft, "nikTanggalBerlakuSampai", "")),
          selectedPaket: String(get(draft, "selectedPaket", "")),
        };

        if (lem) {
          setLembaga(lem);
          nextValues.namaLembaga = nextValues.namaLembaga || lem.nama_lembaga;
          nextValues.jenisKesenian = nextValues.jenisKesenian || lem.jenis_kesenian;
          if (lem.sertifikat_nik) {
            nextValues.nik = nextValues.nik || lem.sertifikat_nik.nomor_nik;
            nextValues.nikTanggalTerbit = nextValues.nikTanggalTerbit || (lem.sertifikat_nik.tanggal_terbit.split("T")[0] ?? "");
            nextValues.nikTanggalBerlakuSampai = nextValues.nikTanggalBerlakuSampai || (lem.sertifikat_nik.tanggal_berlaku_sampai.split("T")[0] ?? "");
          }
        }

        reset(nextValues);
        setPaketList(paket);
        setJenisKesenianOptions(dynamicOptions);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [jenisId, reset]);

  const saveStep = handleSubmit((values) => {
    const existingSertifikat = lembaga?.sertifikat_nik;
    const isUpdatingExistingCertificate = Boolean(sertifikatFile);

    if (!existingSertifikat && !sertifikatFile) {
      setSertifikatError("Sertifikat NIK wajib diunggah");
      return;
    }

    if (
      existingSertifikat &&
      !sertifikatFile &&
      (trim(values.nik) !== existingSertifikat.nomor_nik ||
        values.nikTanggalTerbit !== (existingSertifikat.tanggal_terbit.split("T")[0] ?? "") ||
        values.nikTanggalBerlakuSampai !== (existingSertifikat.tanggal_berlaku_sampai.split("T")[0] ?? ""))
    ) {
      setSertifikatError("Unggah sertifikat baru untuk memperbarui data NIK");
      return;
    }

    if (!(isUpdatingExistingCertificate || !existingSertifikat) && sertifikatError) {
      setSertifikatError(null);
    }

    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    const existing = saved ? JSON.parse(saved) : {};
    const formData = {
      ...existing,
      jenisId,
      namaLembaga: trim(values.namaLembaga),
      jenisKesenian: trim(values.jenisKesenian),
      nik: trim(values.nik),
      nikTanggalTerbit: values.nikTanggalTerbit,
      nikTanggalBerlakuSampai: values.nikTanggalBerlakuSampai,
      selectedPaket: values.selectedPaket,
      lembagaId: lembaga?.lembaga_id ?? existing.lembagaId,
      hasExistingSertifikat: Boolean(lembaga?.sertifikat_nik),
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));

    setPendingSertifikatNikFile(sertifikatFile);

    if (sertifikatFile) {
      sessionStorage.setItem("sertifikat_file_name", sertifikatFile.name);
    } else {
      sessionStorage.removeItem("sertifikat_file_name");
    }

    router.push(`/dashboard/ajukan-fasilitasi/form/step-2?jenis=${jenisId}`);
  });

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
            void saveStep();
          }}
        >
          <div className="grid gap-x-[10px] gap-y-6 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="namaLembaga">Nama Lembaga Budaya</FieldLabel>
              <Controller
                name="namaLembaga"
                control={control}
                render={({ field }) => (
                  <TextInput
                    id="namaLembaga"
                    name={field.name}
                    type="text"
                    placeholder="Masukan nama lembaga"
                    value={field.value}
                    isError={!!errors.namaLembaga}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setSertifikatError(null);
                    }}
                  />
                )}
              />
              {errors.namaLembaga && <ErrorText>{String(errors.namaLembaga.message)}</ErrorText>}
            </div>
            <div>
              <FieldLabel htmlFor="jenisKesenian">Jenis Kesenian</FieldLabel>
              <Controller
                name="jenisKesenian"
                control={control}
                render={({ field }) => (
                  <SelectField
                    id="jenisKesenian"
                    name={field.name}
                    placeholder="Pilih jenis kesenian lembaga"
                    options={jenisKesenianOptions.length > 0 ? jenisKesenianOptions : fallbackJenisKesenianOptions}
                    value={field.value}
                    isError={!!errors.jenisKesenian}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setSertifikatError(null);
                    }}
                  />
                )}
              />
              {errors.jenisKesenian && <ErrorText>{String(errors.jenisKesenian.message)}</ErrorText>}
            </div>

            <div>
              <FieldLabel htmlFor="nik">Nomor Induk Kebudayaan(NIK)</FieldLabel>
              <Controller
                name="nik"
                control={control}
                render={({ field }) => (
                  <TextInput
                    id="nik"
                    name={field.name}
                    type="text"
                    placeholder="Masukan NIK"
                    value={field.value}
                    isError={!!errors.nik}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setSertifikatError(null);
                    }}
                  />
                )}
              />
              {errors.nik ? <ErrorText>{String(errors.nik.message)}</ErrorText> : <HelperText>NIK yang diinput harus masih berlaku dan telah terdaftar</HelperText>}
            </div>
            <div>
              <FieldLabel htmlFor="sertifikatNik">Sertifikat NIK</FieldLabel>
              <FileInputField
                id="sertifikatNik"
                name="sertifikatNik"
                accept=".pdf,application/pdf"
                isError={!!sertifikatError}
                onChange={(e) => {
                  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
                  if (f) {
                    const validationMessage = validateUploadFile(f, {
                      ...pdfUploadValidation,
                      label: "Sertifikat NIK",
                    });
                    if (validationMessage) {
                      setSertifikatFile(null);
                      setSertifikatError(validationMessage);
                      e.currentTarget.value = "";
                      return;
                    }
                  }
                  setSertifikatFile(f);
                  setSertifikatError(null);
                }}
              />
              {sertifikatError ? <ErrorText>{sertifikatError}</ErrorText> : <HelperText>{lembaga?.sertifikat_nik ? "Biarkan kosong jika tidak mengganti sertifikat yang sudah terdaftar" : "Format file PDF dengan ukuran maksimal 10mb"}</HelperText>}
            </div>

            <div>
              <FieldLabel htmlFor="nikTanggalTerbit">Tanggal Terbit Sertifikat NIK</FieldLabel>
              <Controller
                name="nikTanggalTerbit"
                control={control}
                render={({ field }) => (
                  <DateInput
                    id="nikTanggalTerbit"
                    name={field.name}
                    value={field.value}
                    isError={!!errors.nikTanggalTerbit}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setSertifikatError(null);
                    }}
                  />
                )}
              />
              {errors.nikTanggalTerbit ? <ErrorText>{String(errors.nikTanggalTerbit.message)}</ErrorText> : <HelperText>Isi sesuai tanggal terbit pada sertifikat</HelperText>}
            </div>

            <div>
              <FieldLabel htmlFor="nikTanggalBerlakuSampai">Tanggal Berlaku Sertifikat NIK</FieldLabel>
              <Controller
                name="nikTanggalBerlakuSampai"
                control={control}
                render={({ field }) => (
                  <DateInput
                    id="nikTanggalBerlakuSampai"
                    name={field.name}
                    value={field.value}
                    isError={!!errors.nikTanggalBerlakuSampai}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setSertifikatError(null);
                    }}
                  />
                )}
              />
              {errors.nikTanggalBerlakuSampai ? <ErrorText>{String(errors.nikTanggalBerlakuSampai.message)}</ErrorText> : <HelperText>Isi sesuai masa berlaku pada sertifikat</HelperText>}
            </div>
          </div>

          <div className="mt-6">
            <FieldLabel htmlFor="jenisPaketFasilitasi">
              {jenisId === 1 ? "Jenis Paket Fasilitasi Pentas" : "Jenis Paket Fasilitasi Hibah"}
            </FieldLabel>
            <Controller
              name="selectedPaket"
              control={control}
              render={({ field }) => (
                <SelectField
                  id="jenisPaketFasilitasi"
                  name={field.name}
                  placeholder="Pilih jenis fasilitasi"
                  options={paketList.length > 0 ? paketList.map((p) => p.nama_paket) : placeholderPaketOptions}
                  value={field.value}
                  isError={!!errors.selectedPaket}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setSertifikatError(null);
                  }}
                />
              )}
            />
            {errors.selectedPaket && <ErrorText>{String(errors.selectedPaket.message)}</ErrorText>}
            <HelperText>
              Setiap lembaga budaya hanya dapat mengajukan satu paket fasilitasi dalam satu tahun
            </HelperText>
          </div>
        </form>

        <FormActionBar>
          <SecondaryLinkButton href="/dashboard/ajukan-fasilitasi">Kembali</SecondaryLinkButton>
          <PrimaryButton onClick={() => void saveStep()}>
            Simpan Dan Lanjutkan
          </PrimaryButton>
        </FormActionBar>
      </div>
    </section>
  );
}
