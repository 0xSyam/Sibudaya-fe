import Image from "next/image";
import { HomeActions } from "@/app/components/home/home-actions";

export default function App() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src="/background.png"
        alt=""
        fill
        className="object-cover object-center"
        priority
      />

      {/* Overlay opsional agar teks tetap terbaca */}
      <div className="absolute inset-0 bg-[#f7f7f9]/30" />

      {/* Decorative blur */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-full w-full max-w-360 -translate-x-1/2" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-360 flex-col px-6 pb-20 pt-8 md:px-12 lg:px-35.5">
        <div className="mx-auto flex w-fit items-center gap-5">
          <Image
            src="/figma/logo-jogja-istimewa-1.png"
            alt="Logo Jogja Istimewa"
            width={111}
            height={45}
            className="h-8.75 w-auto object-contain md:h-[44.56px]"
            priority
          />
          <div className="flex h-8.75 w-auto items-center justify-center text-sm font-bold text-gray-500 md:h-[44.58px]">
            <Image
              src="/figma/logo-diy-1.png"
              alt="Logo DIY"
              width={111}
              height={45}
              className="h-8.75 w-auto object-contain md:h-[44.56px]"
              priority
            />
          </div>
          <div className="flex h-8.75 w-auto items-center justify-center text-sm font-bold text-gray-500 md:h-[44.58px]">
            <Image
              src="/figma/logo-dana-keistimewaan.png"
              alt="Logo Dana Keistimewaan"
              width={111}
              height={45}
              className="h-8.75 w-auto object-contain md:h-[44.56px]"
              priority
            />
          </div>
        </div>
        <div className="mt-16 w-full max-w-140.25 md:mt-47.75">
          <h1 className="text-[36px] font-semibold leading-13 text-[rgba(38,43,67,0.9)] sm:text-[46px] sm:leading-17">
            Layanan Fasilitasi
            <br />
            Lembaga Budaya DIY
          </h1>
          <p className="mt-5 text-[15px] leading-5.5 text-[rgba(38,43,67,0.7)]">
            Sistem pengajuan bantuan kegiatan dan sarana prasarana bagi lembaga budaya di Daerah
            Istimewa Yogyakarta secara terintegrasi dan transparan.
          </p>
          <HomeActions />
        </div>
      </section>
    </main>
  );
}