"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trim } from "lodash";
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
  HelperText,
  TextAreaField,
  TextInput,
} from "@/app/dashboard/components/forms/fields";
import { FormPageHeader } from "@/app/dashboard/components/forms/page-header";
import { FormStepper, type FormStep } from "@/app/dashboard/components/forms/stepper";

const FORM_STORAGE_KEY = "pengajuan_form_data";

type StoredStepTwoFormData = Partial<{
  namaKegiatan: string;
  tujuanKegiatan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  alamatLokasi: string;
  namaPenerima: string;
  email: string;
  nomorHp: string;
  alamatLengkap: string;
  provinsi: string;
  kabupatenKota: string;
  kecamatan: string;
  kelurahanDesa: string;
  kodePos: string;
}>;

type StepTwoFormValues = {
  namaKegiatan: string;
  tujuanKegiatan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  alamatLokasi: string;
  namaPenerima: string;
  email: string;
  nomorHp: string;
  alamatLengkap: string;
  provinsi: string;
  kabupatenKota: string;
  kecamatan: string;
  kelurahanDesa: string;
  kodePos: string;
};

function getStoredStepTwoFormData(): StoredStepTwoFormData {
  if (typeof window === "undefined") return {};

  try {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as StoredStepTwoFormData) : {};
  } catch {
    return {};
  }
}

const stepTwoBaseSchema = z.object({
  namaKegiatan: z.string(),
  tujuanKegiatan: z.string(),
  tanggalMulai: z.string(),
  tanggalSelesai: z.string(),
  alamatLokasi: z.string(),
  namaPenerima: z.string(),
  email: z.string(),
  nomorHp: z.string(),
  alamatLengkap: z.string(),
  provinsi: z.string(),
  kabupatenKota: z.string(),
  kecamatan: z.string(),
  kelurahanDesa: z.string(),
  kodePos: z.string(),
});

function createStepTwoSchema(jenisId: number) {
  return stepTwoBaseSchema.superRefine((data, ctx) => {
    if (jenisId === 1) {
      if (!data.namaKegiatan.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["namaKegiatan"], message: "Nama kegiatan wajib diisi" });
      }
      if (!data.tujuanKegiatan.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["tujuanKegiatan"], message: "Tujuan kegiatan wajib diisi" });
      }
      if (!data.tanggalMulai) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["tanggalMulai"], message: "Tanggal mulai wajib diisi" });
      }
      if (!data.tanggalSelesai) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["tanggalSelesai"], message: "Tanggal selesai wajib diisi" });
      }
      if (data.tanggalMulai && data.tanggalSelesai && data.tanggalSelesai < data.tanggalMulai) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["tanggalSelesai"], message: "Tanggal selesai harus setelah tanggal mulai" });
      }
      if (!data.alamatLokasi.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["alamatLokasi"], message: "Alamat lokasi wajib diisi" });
      }
      return;
    }

    if (!data.namaPenerima.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["namaPenerima"], message: "Nama penerima wajib diisi" });
    }
    if (!data.email.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Email wajib diisi" });
    } else if (!z.string().email().safeParse(data.email.trim()).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Format email tidak valid" });
    }
    if (!data.nomorHp.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["nomorHp"], message: "Nomor HP wajib diisi" });
    } else if (!/^[0-9+\-\s]{8,15}$/.test(data.nomorHp.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["nomorHp"], message: "Format nomor HP tidak valid" });
    }
    if (!data.alamatLengkap.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["alamatLengkap"], message: "Alamat lengkap wajib diisi" });
    }
    if (!data.provinsi.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["provinsi"], message: "Provinsi wajib diisi" });
    }
    if (!data.kabupatenKota.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["kabupatenKota"], message: "Kabupaten/Kota wajib diisi" });
    }
    if (!data.kecamatan.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["kecamatan"], message: "Kecamatan wajib diisi" });
    }
    if (!data.kelurahanDesa.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["kelurahanDesa"], message: "Kelurahan/Desa wajib diisi" });
    }
    if (!data.kodePos.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["kodePos"], message: "Kode pos wajib diisi" });
    } else if (!/^\d{5}$/.test(data.kodePos.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["kodePos"], message: "Format kode pos harus 5 digit angka" });
    }
  });
}

const stepTwoProgress: FormStep[] = [
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
    state: "current",
  },
  {
    number: "03",
    title: "Administrasi & Dokumen",
    subtitle: "Lengkapi data administratif",
    state: "upcoming",
  },
];

export default function AjukanFasilitasiFormStep2Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jenisId = Number(searchParams.get("jenis") ?? "1");
  const [initialFormData] = useState<StoredStepTwoFormData>(getStoredStepTwoFormData);

  const stepTwoSchema = useMemo(() => createStepTwoSchema(jenisId), [jenisId]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StepTwoFormValues>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      namaKegiatan: initialFormData.namaKegiatan ?? "",
      tujuanKegiatan: initialFormData.tujuanKegiatan ?? "",
      tanggalMulai: initialFormData.tanggalMulai ?? "",
      tanggalSelesai: initialFormData.tanggalSelesai ?? "",
      alamatLokasi: initialFormData.alamatLokasi ?? "",
      namaPenerima: initialFormData.namaPenerima ?? "",
      email: initialFormData.email ?? "",
      nomorHp: initialFormData.nomorHp ?? "",
      alamatLengkap: initialFormData.alamatLengkap ?? "",
      provinsi: initialFormData.provinsi ?? "",
      kabupatenKota: initialFormData.kabupatenKota ?? "",
      kecamatan: initialFormData.kecamatan ?? "",
      kelurahanDesa: initialFormData.kelurahanDesa ?? "",
      kodePos: initialFormData.kodePos ?? "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const saveStep = handleSubmit((values) => {
    const existing = getStoredStepTwoFormData();
    const formData = {
      ...existing,
      ...(jenisId === 1
        ? {
            namaKegiatan: trim(values.namaKegiatan),
            tujuanKegiatan: trim(values.tujuanKegiatan),
            tanggalMulai: values.tanggalMulai,
            tanggalSelesai: values.tanggalSelesai,
            alamatLokasi: trim(values.alamatLokasi),
          }
        : {
            namaPenerima: trim(values.namaPenerima),
            email: trim(values.email),
            nomorHp: trim(values.nomorHp),
            alamatLengkap: trim(values.alamatLengkap),
            provinsi: trim(values.provinsi),
            kabupatenKota: trim(values.kabupatenKota),
            kecamatan: trim(values.kecamatan),
            kelurahanDesa: trim(values.kelurahanDesa),
            kodePos: trim(values.kodePos),
          }),
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    router.push(`/dashboard/ajukan-fasilitasi/form/step-3?jenis=${jenisId}`);
  });

  return (
    <section className="h-full overflow-y-auto px-4 pb-10 pt-8 sm:px-6 lg:pt-21">
      <div className="mx-auto w-full max-w-230">
        <FormPageHeader
          title={jenisId === 1 ? "Detail Kegiatan Pentas" : "Detail Sarana"}
          description={
            jenisId === 1
              ? "Informasi mengenai kegiatan yang akan dilaksanakan."
              : "Lengkapi data penerima dan alamat pengiriman kebutuhan sarana."
          }
        />

        <FormStepper steps={stepTwoProgress} />

        <form
          className="mt-6 rounded-[10px] bg-white px-5 pb-5 pt-6"
          onSubmit={(e) => {
            e.preventDefault();
            void saveStep();
          }}
        >
          {jenisId === 1 ? (
            <>
              <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="namaKegiatan">Nama Kegiatan</FieldLabel>
                  <Controller
                    name="namaKegiatan"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        id="namaKegiatan"
                        name={field.name}
                        type="text"
                        placeholder="Masukan judul kegiatan"
                        value={field.value}
                        isError={!!errors.namaKegiatan}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  {errors.namaKegiatan && <ErrorText>{String(errors.namaKegiatan.message)}</ErrorText>}
                </div>
                <div>
                  <FieldLabel htmlFor="tujuanKegiatan">Tujuan Kegiatan</FieldLabel>
                  <Controller
                    name="tujuanKegiatan"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        id="tujuanKegiatan"
                        name={field.name}
                        type="text"
                        placeholder="Masukan tujuan kegiatan"
                        value={field.value}
                        isError={!!errors.tujuanKegiatan}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  {errors.tujuanKegiatan && <ErrorText>{String(errors.tujuanKegiatan.message)}</ErrorText>}
                </div>
                <div>
                  <FieldLabel htmlFor="tanggalMulai">Tanggal Mulai</FieldLabel>
                  <Controller
                    name="tanggalMulai"
                    control={control}
                    render={({ field }) => (
                      <DateInput
                        id="tanggalMulai"
                        name={field.name}
                        value={field.value}
                        isError={!!errors.tanggalMulai}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  {errors.tanggalMulai ? (
                    <ErrorText>{String(errors.tanggalMulai.message)}</ErrorText>
                  ) : (
                    <HelperText>Tanggal pelaksanaan harus sesuai dengan proposal</HelperText>
                  )}
                </div>
                <div>
                  <FieldLabel htmlFor="tanggalSelesai">Tanggal Selesai</FieldLabel>
                  <Controller
                    name="tanggalSelesai"
                    control={control}
                    render={({ field }) => (
                      <DateInput
                        id="tanggalSelesai"
                        name={field.name}
                        value={field.value}
                        isError={!!errors.tanggalSelesai}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  {errors.tanggalSelesai && <ErrorText>{String(errors.tanggalSelesai.message)}</ErrorText>}
                </div>
              </div>

              <div className="mt-6">
                <FieldLabel htmlFor="alamatLokasiKegiatan">Alamat Lokasi Kegiatan</FieldLabel>
                <Controller
                  name="alamatLokasi"
                  control={control}
                  render={({ field }) => (
                    <TextAreaField
                      id="alamatLokasiKegiatan"
                      name={field.name}
                      placeholder="Masukan alamat kegiatan"
                      className="h-17.5"
                      value={field.value}
                      isError={!!errors.alamatLokasi}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.alamatLokasi && <ErrorText>{String(errors.alamatLokasi.message)}</ErrorText>}
              </div>
            </>
          ) : (
            <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
              <div>
                <FieldLabel htmlFor="namaPenerima">Nama Penerima</FieldLabel>
                <Controller
                  name="namaPenerima"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      id="namaPenerima"
                      name={field.name}
                      type="text"
                      placeholder="Masukan nama penerima"
                      value={field.value}
                      isError={!!errors.namaPenerima}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.namaPenerima && <ErrorText>{String(errors.namaPenerima.message)}</ErrorText>}
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
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.email && <ErrorText>{String(errors.email.message)}</ErrorText>}
              </div>
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
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.nomorHp && <ErrorText>{String(errors.nomorHp.message)}</ErrorText>}
              </div>
              <div>
                <FieldLabel htmlFor="provinsi">Provinsi</FieldLabel>
                <Controller
                  name="provinsi"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      id="provinsi"
                      name={field.name}
                      type="text"
                      placeholder="Masukan provinsi"
                      value={field.value}
                      isError={!!errors.provinsi}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.provinsi && <ErrorText>{String(errors.provinsi.message)}</ErrorText>}
              </div>
              <div className="md:col-span-2">
                <FieldLabel htmlFor="alamatLengkap">Alamat Lengkap</FieldLabel>
                <Controller
                  name="alamatLengkap"
                  control={control}
                  render={({ field }) => (
                    <TextAreaField
                      id="alamatLengkap"
                      name={field.name}
                      placeholder="Contoh: Jl. Malioboro No. 10, RT 02 RW 05"
                      className="h-17.5"
                      value={field.value}
                      isError={!!errors.alamatLengkap}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.alamatLengkap && <ErrorText>{String(errors.alamatLengkap.message)}</ErrorText>}
              </div>
              <div>
                <FieldLabel htmlFor="kabupatenKota">Kabupaten / Kota</FieldLabel>
                <Controller
                  name="kabupatenKota"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      id="kabupatenKota"
                      name={field.name}
                      type="text"
                      placeholder="Masukan kabupaten / kota"
                      value={field.value}
                      isError={!!errors.kabupatenKota}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.kabupatenKota && <ErrorText>{String(errors.kabupatenKota.message)}</ErrorText>}
              </div>
              <div>
                <FieldLabel htmlFor="kecamatan">Kecamatan</FieldLabel>
                <Controller
                  name="kecamatan"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      id="kecamatan"
                      name={field.name}
                      type="text"
                      placeholder="Masukan kecamatan"
                      value={field.value}
                      isError={!!errors.kecamatan}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.kecamatan && <ErrorText>{String(errors.kecamatan.message)}</ErrorText>}
              </div>
              <div>
                <FieldLabel htmlFor="kelurahanDesa">Kelurahan / Desa</FieldLabel>
                <Controller
                  name="kelurahanDesa"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      id="kelurahanDesa"
                      name={field.name}
                      type="text"
                      placeholder="Masukan nama kelurahan/desa"
                      value={field.value}
                      isError={!!errors.kelurahanDesa}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.kelurahanDesa && <ErrorText>{String(errors.kelurahanDesa.message)}</ErrorText>}
              </div>
              <div>
                <FieldLabel htmlFor="kodePos">Kode Pos</FieldLabel>
                <Controller
                  name="kodePos"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      id="kodePos"
                      name={field.name}
                      type="text"
                      placeholder="Masukan kode pos"
                      value={field.value}
                      isError={!!errors.kodePos}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.kodePos && <ErrorText>{String(errors.kodePos.message)}</ErrorText>}
              </div>
            </div>
          )}
        </form>

        <FormActionBar>
          <SecondaryLinkButton href={`/dashboard/ajukan-fasilitasi/form?jenis=${jenisId}`}>
            Kembali
          </SecondaryLinkButton>
          <PrimaryButton onClick={() => void saveStep()}>
            Simpan Dan Lanjutkan
          </PrimaryButton>
        </FormActionBar>
      </div>
    </section>
  );
}
