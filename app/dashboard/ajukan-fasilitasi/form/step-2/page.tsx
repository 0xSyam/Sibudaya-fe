"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

  const [namaKegiatan, setNamaKegiatan] = useState("");
  const [tujuanKegiatan, setTujuanKegiatan] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [alamatLokasi, setAlamatLokasi] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!namaKegiatan.trim()) newErrors.namaKegiatan = "Nama kegiatan wajib diisi";
    if (!tujuanKegiatan.trim()) newErrors.tujuanKegiatan = "Tujuan kegiatan wajib diisi";
    if (!tanggalMulai) newErrors.tanggalMulai = "Tanggal mulai wajib diisi";
    if (!tanggalSelesai) newErrors.tanggalSelesai = "Tanggal selesai wajib diisi";
    else if (tanggalMulai && tanggalSelesai < tanggalMulai) newErrors.tanggalSelesai = "Tanggal selesai harus setelah tanggal mulai";
    if (!alamatLokasi.trim()) newErrors.alamatLokasi = "Alamat lokasi wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  useEffect(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.namaKegiatan) setNamaKegiatan(data.namaKegiatan);
      if (data.tujuanKegiatan) setTujuanKegiatan(data.tujuanKegiatan);
      if (data.tanggalMulai) setTanggalMulai(data.tanggalMulai);
      if (data.tanggalSelesai) setTanggalSelesai(data.tanggalSelesai);
      if (data.alamatLokasi) setAlamatLokasi(data.alamatLokasi);
    }
  }, []);

  function handleSave() {
    if (!validate()) return;
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    const existing = saved ? JSON.parse(saved) : {};
    const formData = {
      ...existing,
      namaKegiatan,
      tujuanKegiatan,
      tanggalMulai,
      tanggalSelesai,
      alamatLokasi,
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    router.push(`/dashboard/ajukan-fasilitasi/form/step-3?jenis=${jenisId}`);
  }

  return (
    <section className="h-full overflow-y-auto px-4 pb-10 pt-8 sm:px-6 lg:pt-21">
      <div className="mx-auto w-full max-w-230">
        <FormPageHeader
          title={jenisId === 1 ? "Detail Kegiatan Pentas" : "Detail Kegiatan Hibah"}
          description="Informasi mengenai kegiatan yang akan dilaksanakan."
        />

        <FormStepper steps={stepTwoProgress} />

        <form
          className="mt-6 rounded-[10px] bg-white px-5 pb-5 pt-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="namaKegiatan">Nama Kegiatan</FieldLabel>
              <TextInput
                id="namaKegiatan"
                name="namaKegiatan"
                type="text"
                placeholder="Masukan judul kegiatan"
                value={namaKegiatan}
                isError={!!errors.namaKegiatan}
                onChange={(e) => { setNamaKegiatan(e.target.value); setErrors((p) => ({ ...p, namaKegiatan: "" })); }}
              />
              {errors.namaKegiatan && <ErrorText>{errors.namaKegiatan}</ErrorText>}
            </div>
            <div>
              <FieldLabel htmlFor="tujuanKegiatan">Tujuan Kegiatan</FieldLabel>
              <TextInput
                id="tujuanKegiatan"
                name="tujuanKegiatan"
                type="text"
                placeholder="Masukan tujuan kegiatan"
                value={tujuanKegiatan}
                isError={!!errors.tujuanKegiatan}
                onChange={(e) => { setTujuanKegiatan(e.target.value); setErrors((p) => ({ ...p, tujuanKegiatan: "" })); }}
              />
              {errors.tujuanKegiatan && <ErrorText>{errors.tujuanKegiatan}</ErrorText>}
            </div>
            <div>
              <FieldLabel htmlFor="tanggalMulai">Tanggal Mulai</FieldLabel>
              <DateInput
                id="tanggalMulai"
                name="tanggalMulai"
                value={tanggalMulai}
                isError={!!errors.tanggalMulai}
                onChange={(e) => { setTanggalMulai(e.target.value); setErrors((p) => ({ ...p, tanggalMulai: "", tanggalSelesai: "" })); }}
              />
              {errors.tanggalMulai ? <ErrorText>{errors.tanggalMulai}</ErrorText> : <HelperText>Tanggal pelaksanaan harus sesuai dengan proposal</HelperText>}
            </div>
            <div>
              <FieldLabel htmlFor="tanggalSelesai">Tanggal Selesai</FieldLabel>
              <DateInput
                id="tanggalSelesai"
                name="tanggalSelesai"
                value={tanggalSelesai}
                isError={!!errors.tanggalSelesai}
                onChange={(e) => { setTanggalSelesai(e.target.value); setErrors((p) => ({ ...p, tanggalSelesai: "" })); }}
              />
              {errors.tanggalSelesai && <ErrorText>{errors.tanggalSelesai}</ErrorText>}
            </div>
          </div>

          <div className="mt-6">
            <FieldLabel htmlFor="alamatLokasiKegiatan">Alamat Lokasi Kegiatan</FieldLabel>
            <TextAreaField
              id="alamatLokasiKegiatan"
              name="alamatLokasiKegiatan"
              placeholder="Masukan alamat kegiatan"
              className="h-17.5"
              value={alamatLokasi}
              isError={!!errors.alamatLokasi}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setAlamatLokasi(e.target.value); setErrors((p) => ({ ...p, alamatLokasi: "" })); }}
            />
            {errors.alamatLokasi && <ErrorText>{errors.alamatLokasi}</ErrorText>}
          </div>
        </form>

        <FormActionBar>
          <SecondaryLinkButton href={`/dashboard/ajukan-fasilitasi/form?jenis=${jenisId}`}>
            Kembali
          </SecondaryLinkButton>
          <PrimaryButton onClick={handleSave}>
            Simpan Dan Lanjutkan
          </PrimaryButton>
        </FormActionBar>
      </div>
    </section>
  );
}
