"use client";

import { useState } from "react";
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

function getStoredStepTwoFormData(): StoredStepTwoFormData {
  if (typeof window === "undefined") return {};

  try {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as StoredStepTwoFormData) : {};
  } catch {
    return {};
  }
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

  const [namaKegiatan, setNamaKegiatan] = useState(initialFormData.namaKegiatan ?? "");
  const [tujuanKegiatan, setTujuanKegiatan] = useState(initialFormData.tujuanKegiatan ?? "");
  const [tanggalMulai, setTanggalMulai] = useState(initialFormData.tanggalMulai ?? "");
  const [tanggalSelesai, setTanggalSelesai] = useState(initialFormData.tanggalSelesai ?? "");
  const [alamatLokasi, setAlamatLokasi] = useState(initialFormData.alamatLokasi ?? "");
  const [namaPenerima, setNamaPenerima] = useState(initialFormData.namaPenerima ?? "");
  const [email, setEmail] = useState(initialFormData.email ?? "");
  const [nomorHp, setNomorHp] = useState(initialFormData.nomorHp ?? "");
  const [alamatLengkap, setAlamatLengkap] = useState(initialFormData.alamatLengkap ?? "");
  const [provinsi, setProvinsi] = useState(initialFormData.provinsi ?? "");
  const [kabupatenKota, setKabupatenKota] = useState(initialFormData.kabupatenKota ?? "");
  const [kecamatan, setKecamatan] = useState(initialFormData.kecamatan ?? "");
  const [kelurahanDesa, setKelurahanDesa] = useState(initialFormData.kelurahanDesa ?? "");
  const [kodePos, setKodePos] = useState(initialFormData.kodePos ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const newErrors: Record<string, string> = {};
    if (jenisId === 1) {
      if (!namaKegiatan.trim()) newErrors.namaKegiatan = "Nama kegiatan wajib diisi";
      if (!tujuanKegiatan.trim()) newErrors.tujuanKegiatan = "Tujuan kegiatan wajib diisi";
      if (!tanggalMulai) newErrors.tanggalMulai = "Tanggal mulai wajib diisi";
      if (!tanggalSelesai) newErrors.tanggalSelesai = "Tanggal selesai wajib diisi";
      else if (tanggalMulai && tanggalSelesai < tanggalMulai) newErrors.tanggalSelesai = "Tanggal selesai harus setelah tanggal mulai";
      if (!alamatLokasi.trim()) newErrors.alamatLokasi = "Alamat lokasi wajib diisi";
    } else {
      if (!namaPenerima.trim()) newErrors.namaPenerima = "Nama penerima wajib diisi";
      if (!email.trim()) newErrors.email = "Email wajib diisi";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = "Format email tidak valid";
      if (!nomorHp.trim()) newErrors.nomorHp = "Nomor HP wajib diisi";
      else if (!/^[0-9+\-\s]{8,15}$/.test(nomorHp.trim())) newErrors.nomorHp = "Format nomor HP tidak valid";
      if (!alamatLengkap.trim()) newErrors.alamatLengkap = "Alamat lengkap wajib diisi";
      if (!provinsi.trim()) newErrors.provinsi = "Provinsi wajib diisi";
      if (!kabupatenKota.trim()) newErrors.kabupatenKota = "Kabupaten/Kota wajib diisi";
      if (!kecamatan.trim()) newErrors.kecamatan = "Kecamatan wajib diisi";
      if (!kelurahanDesa.trim()) newErrors.kelurahanDesa = "Kelurahan/Desa wajib diisi";
      if (!kodePos.trim()) newErrors.kodePos = "Kode pos wajib diisi";
      else if (!/^\d{5}$/.test(kodePos.trim())) newErrors.kodePos = "Format kode pos harus 5 digit angka";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    const existing = saved ? JSON.parse(saved) : {};
    const formData = {
      ...existing,
      ...(jenisId === 1
        ? {
            namaKegiatan,
            tujuanKegiatan,
            tanggalMulai,
            tanggalSelesai,
            alamatLokasi,
          }
        : {
            namaPenerima,
            email,
            nomorHp,
            alamatLengkap,
            provinsi,
            kabupatenKota,
            kecamatan,
            kelurahanDesa,
            kodePos,
          }),
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    router.push(`/dashboard/ajukan-fasilitasi/form/step-3?jenis=${jenisId}`);
  }

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
            handleSave();
          }}
        >
          {jenisId === 1 ? (
            <>
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
            </>
          ) : (
            <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
              <div>
                <FieldLabel htmlFor="namaPenerima">Nama Penerima</FieldLabel>
                <TextInput
                  id="namaPenerima"
                  name="namaPenerima"
                  type="text"
                  placeholder="Masukan nama penerima"
                  value={namaPenerima}
                  isError={!!errors.namaPenerima}
                  onChange={(e) => { setNamaPenerima(e.target.value); setErrors((p) => ({ ...p, namaPenerima: "" })); }}
                />
                {errors.namaPenerima && <ErrorText>{errors.namaPenerima}</ErrorText>}
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
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                />
                {errors.email && <ErrorText>{errors.email}</ErrorText>}
              </div>
              <div>
                <FieldLabel htmlFor="nomorHp">Nomor Hp.</FieldLabel>
                <TextInput
                  id="nomorHp"
                  name="nomorHp"
                  type="tel"
                  placeholder="Masukan nomor Hp."
                  value={nomorHp}
                  isError={!!errors.nomorHp}
                  onChange={(e) => { setNomorHp(e.target.value); setErrors((p) => ({ ...p, nomorHp: "" })); }}
                />
                {errors.nomorHp && <ErrorText>{errors.nomorHp}</ErrorText>}
              </div>
              <div>
                <FieldLabel htmlFor="provinsi">Provinsi</FieldLabel>
                <TextInput
                  id="provinsi"
                  name="provinsi"
                  type="text"
                  placeholder="Masukan provinsi"
                  value={provinsi}
                  isError={!!errors.provinsi}
                  onChange={(e) => { setProvinsi(e.target.value); setErrors((p) => ({ ...p, provinsi: "" })); }}
                />
                {errors.provinsi && <ErrorText>{errors.provinsi}</ErrorText>}
              </div>
              <div className="md:col-span-2">
                <FieldLabel htmlFor="alamatLengkap">Alamat Lengkap</FieldLabel>
                <TextAreaField
                  id="alamatLengkap"
                  name="alamatLengkap"
                  placeholder="Contoh: Jl. Malioboro No. 10, RT 02 RW 05"
                  className="h-17.5"
                  value={alamatLengkap}
                  isError={!!errors.alamatLengkap}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setAlamatLengkap(e.target.value); setErrors((p) => ({ ...p, alamatLengkap: "" })); }}
                />
                {errors.alamatLengkap && <ErrorText>{errors.alamatLengkap}</ErrorText>}
              </div>
              <div>
                <FieldLabel htmlFor="kabupatenKota">Kabupaten / Kota</FieldLabel>
                <TextInput
                  id="kabupatenKota"
                  name="kabupatenKota"
                  type="text"
                  placeholder="Masukan kabupaten / kota"
                  value={kabupatenKota}
                  isError={!!errors.kabupatenKota}
                  onChange={(e) => { setKabupatenKota(e.target.value); setErrors((p) => ({ ...p, kabupatenKota: "" })); }}
                />
                {errors.kabupatenKota && <ErrorText>{errors.kabupatenKota}</ErrorText>}
              </div>
              <div>
                <FieldLabel htmlFor="kecamatan">Kecamatan</FieldLabel>
                <TextInput
                  id="kecamatan"
                  name="kecamatan"
                  type="text"
                  placeholder="Masukan kecamatan"
                  value={kecamatan}
                  isError={!!errors.kecamatan}
                  onChange={(e) => { setKecamatan(e.target.value); setErrors((p) => ({ ...p, kecamatan: "" })); }}
                />
                {errors.kecamatan && <ErrorText>{errors.kecamatan}</ErrorText>}
              </div>
              <div>
                <FieldLabel htmlFor="kelurahanDesa">Kelurahan / Desa</FieldLabel>
                <TextInput
                  id="kelurahanDesa"
                  name="kelurahanDesa"
                  type="text"
                  placeholder="Masukan nama kelurahan/desa"
                  value={kelurahanDesa}
                  isError={!!errors.kelurahanDesa}
                  onChange={(e) => { setKelurahanDesa(e.target.value); setErrors((p) => ({ ...p, kelurahanDesa: "" })); }}
                />
                {errors.kelurahanDesa && <ErrorText>{errors.kelurahanDesa}</ErrorText>}
              </div>
              <div>
                <FieldLabel htmlFor="kodePos">Kode Pos</FieldLabel>
                <TextInput
                  id="kodePos"
                  name="kodePos"
                  type="text"
                  placeholder="Masukan kode pos"
                  value={kodePos}
                  isError={!!errors.kodePos}
                  onChange={(e) => { setKodePos(e.target.value); setErrors((p) => ({ ...p, kodePos: "" })); }}
                />
                {errors.kodePos && <ErrorText>{errors.kodePos}</ErrorText>}
              </div>
            </div>
          )}
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
