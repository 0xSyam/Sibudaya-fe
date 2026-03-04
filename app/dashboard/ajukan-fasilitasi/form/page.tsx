import {
  FormActionBar,
  PrimaryLinkButton,
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
  return (
    <section className="h-full overflow-y-auto px-4 pb-10 pt-8 sm:px-6 lg:pt-[84px]">
      <div className="mx-auto w-full max-w-[920px]">
        <FormPageHeader
          title="Identitas Lembaga & Jenis Fasilitasi"
          description="Lengkapi informasi dasar lembaga budaya dan jenis fasilitasi yang diajukan."
        />

        <FormStepper steps={stepOneProgress} />

        <form className="mt-6 rounded-[10px] bg-white px-5 pb-5 pt-6">
          <div className="grid gap-x-[10px] gap-y-6 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="namaLembaga">Nama Lembaga Budaya</FieldLabel>
              <TextInput id="namaLembaga" name="namaLembaga" type="text" placeholder="Masukan nama lembaga" />
            </div>
            <div>
              <FieldLabel htmlFor="jenisKesenian">Jenis Kesenian</FieldLabel>
              <SelectField
                id="jenisKesenian"
                name="jenisKesenian"
                placeholder="Pilih jenis kesenian lembaga"
                options={["Tari", "Musik", "Teater", "Seni Rupa", "Sastra", "Lainnya"]}
              />
            </div>

            <div>
              <FieldLabel htmlFor="nik">Nomor Induk Kebudayaan(NIK)</FieldLabel>
              <TextInput id="nik" name="nik" type="text" placeholder="Masukan NIK" />
              <HelperText>NIK yang diinput harus masih berlaku dan telah terdaftar</HelperText>
            </div>
            <div>
              <FieldLabel htmlFor="sertifikatNik">Sertifikat NIK</FieldLabel>
              <FileInputField id="sertifikatNik" name="sertifikatNik" accept=".pdf,application/pdf" />
              <HelperText>Format file PDF dengan ukuran maksimal 10mb</HelperText>
            </div>
          </div>

          <div className="mt-6">
            <FieldLabel htmlFor="jenisPaketFasilitasiPentas">Jenis Paket Fasilitasi Pentas</FieldLabel>
            <SelectField
              id="jenisPaketFasilitasiPentas"
              name="jenisPaketFasilitasiPentas"
              placeholder="Pilih jenis fasilitasi"
              options={["Pembinaan Sanggar", "Pentas Seni", "Workshop", "Festival Budaya"]}
            />
            <HelperText>
              Setiap lembaga budaya hanya dapat mengajukan satu paket fasilitasi dalam satu tahun
            </HelperText>
          </div>
        </form>

        <FormActionBar>
          <SecondaryLinkButton href="/dashboard/ajukan-fasilitasi">Kembali</SecondaryLinkButton>
          <PrimaryLinkButton href="/dashboard/ajukan-fasilitasi/form/step-2">
            Simpan Dan Lanjutkan
          </PrimaryLinkButton>
        </FormActionBar>
      </div>
    </section>
  );
}
