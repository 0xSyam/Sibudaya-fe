import {
  FormActionBar,
  PrimaryLinkButton,
  SecondaryLinkButton,
} from "@/app/dashboard/components/forms/actions";
import {
  DateInput,
  FieldLabel,
  HelperText,
  TextAreaField,
  TextInput,
} from "@/app/dashboard/components/forms/fields";
import { FormPageHeader } from "@/app/dashboard/components/forms/page-header";
import { FormStepper, type FormStep } from "@/app/dashboard/components/forms/stepper";

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
  return (
    <section className="h-full overflow-y-auto px-4 pb-10 pt-8 sm:px-6 lg:pt-21">
      <div className="mx-auto w-full max-w-230">
        <FormPageHeader
          title="Detail Kegiatan Pentas"
          description="Informasi mengenai kegiatan pentas yang akan dilaksanakan."
        />

        <FormStepper steps={stepTwoProgress} />

        <form className="mt-6 rounded-[10px] bg-white px-5 pb-5 pt-6">
          <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="namaKegiatan">Nama Kegiatan</FieldLabel>
              <TextInput
                id="namaKegiatan"
                name="namaKegiatan"
                type="text"
                placeholder="Masukan judul kegiatan"
              />
            </div>
            <div>
              <FieldLabel htmlFor="tujuanKegiatan">Tujuan Kegiatan</FieldLabel>
              <TextInput
                id="tujuanKegiatan"
                name="tujuanKegiatan"
                type="text"
                placeholder="Masukan tujuan kegiatan"
              />
            </div>
            <div>
              <FieldLabel htmlFor="tanggalMulai">Tanggal Mulai</FieldLabel>
              <DateInput id="tanggalMulai" name="tanggalMulai" />
              <HelperText>Tanggal pelaksanaan harus sesuai dengan proposal</HelperText>
            </div>
            <div>
              <FieldLabel htmlFor="tanggalSelesai">Tanggal Selesai</FieldLabel>
              <DateInput id="tanggalSelesai" name="tanggalSelesai" />
            </div>
          </div>

          <div className="mt-6">
            <FieldLabel htmlFor="alamatLokasiKegiatan">Alamat Lokasi Kegiatan</FieldLabel>
            <TextAreaField
              id="alamatLokasiKegiatan"
              name="alamatLokasiKegiatan"
              placeholder="Masukan alamat kegiatan"
              className="h-17.5"
            />
          </div>
        </form>

        <FormActionBar>
          <SecondaryLinkButton href="/dashboard/ajukan-fasilitasi/form">Kembali</SecondaryLinkButton>
          <PrimaryLinkButton href="/dashboard/ajukan-fasilitasi/form/step-3">
            Simpan Dan Lanjutkan
          </PrimaryLinkButton>
        </FormActionBar>
      </div>
    </section>
  );
}
