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
  return (
    <section className="h-full overflow-y-auto px-4 pb-10 pt-8 sm:px-6 lg:pt-[84px]">
      <div className="mx-auto w-full max-w-[920px]">
        <FormPageHeader
          title="Administrasi & Dokumen Pendukung"
          description="Lengkapi data administratif dan unggah dokumen pendukung pengajuan."
        />

        <FormStepper steps={stepThreeProgress} />

        <form className="mt-6 rounded-[10px] bg-white px-7 pb-8 pt-11">
          <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="nomorHp">Nomor Hp.</FieldLabel>
              <TextInput id="nomorHp" name="nomorHp" type="tel" placeholder="Masukan nomor Hp." />
            </div>
            <div>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <TextInput id="email" name="email" type="email" placeholder="Masukan email" />
            </div>
            <div>
              <FieldLabel htmlFor="nomorRekening">Nomor Rekening</FieldLabel>
              <TextInput
                id="nomorRekening"
                name="nomorRekening"
                type="text"
                placeholder="Masukan nomor rekening"
              />
            </div>
            <div>
              <FieldLabel htmlFor="namaPemegangRekening">Nama Pemegang Rekening</FieldLabel>
              <TextInput
                id="namaPemegangRekening"
                name="namaPemegangRekening"
                type="text"
                placeholder="Masukan nama pemegang rekening"
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
            />
          </div>

          <div className="mt-6 grid gap-x-5 gap-y-6 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="contohProposal">Contoh Proposal</FieldLabel>
              <SamplePdfChip filename="Contoh Proposal.pdf" />
            </div>
            <div>
              <FieldLabel htmlFor="proposal">Proposal</FieldLabel>
              <FileInputField id="proposal" name="proposal" accept=".pdf,application/pdf" />
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
            />
          </div>
        </form>

        <FormActionBar>
          <SecondaryLinkButton href="/dashboard/ajukan-fasilitasi/form/step-2">Kembali</SecondaryLinkButton>
          <PrimaryButton>Kirim Pengajuan</PrimaryButton>
        </FormActionBar>
      </div>
    </section>
  );
}
