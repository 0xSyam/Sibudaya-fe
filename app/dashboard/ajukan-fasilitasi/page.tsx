"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { map } from "lodash";
import { fasilitasiApi } from "@/app/lib/api";
import type { JenisFasilitasi } from "@/app/lib/types";

const STATIC_PENTAS_ITEMS = ["Pembinaan Sanggar", "Pentas Seni"];

type FacilityCardProps = {
  icon: string;
  iconWidth: number;
  iconHeight: number;
  title: string;
  description: string;
  items: string[];
  href: string;
};

function FacilityCard({
  icon,
  iconWidth,
  iconHeight,
  title,
  description,
  items,
  href,
}: FacilityCardProps) {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-[10px] border border-[rgba(38,43,67,0.12)] bg-white px-5 pb-5 pt-4">
      <div className="h-6" />

      <div className="mx-auto flex size-[120px] items-center justify-center rounded-full bg-[rgba(194,53,19,0.16)]">
        <Image src={icon} alt="" width={iconWidth} height={iconHeight} aria-hidden="true" />
      </div>

      <div className="mt-5 text-center">
        <h2 className="text-[24px] font-medium leading-[38px] text-[rgba(38,43,67,0.9)]">{title}</h2>
        <p className="mt-2 text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">{description}</p>
      </div>

      <div className="mt-5 space-y-4">
        <h3 className="text-center text-[18px] font-medium leading-7 text-[#c23513]">
          Jenis Paket Faslitasi
        </h3>
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-[10px]">
              <Image src="/figma/icon-circle.svg" alt="" width={12} height={12} aria-hidden="true" />
              <span className="text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-5">
        <Link
          href={href}
          className="inline-flex h-[38px] w-full items-center justify-center rounded-[8px] bg-[#c23513] text-center text-[15px] font-medium leading-[22px] text-white shadow-[0_2px_6px_0_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
        >
          Ajukan
        </Link>
      </div>
    </article>
  );
}

function mapJenisToCard(j: JenisFasilitasi): FacilityCardProps {
  const isPentas = j.jenis_fasilitasi_id === 1;
  return {
    icon: isPentas ? "/figma/icon-bag.svg" : "/figma/icon-ticket.svg",
    iconWidth: isPentas ? 84 : 96,
    iconHeight: isPentas ? 84 : 86,
    title: j.nama,
    description: j.deskripsi ?? (isPentas
      ? "Bantuan untuk pelaksanaan kegiatan pentas seni dan pembinaan lembaga budaya."
      : "Bantuan pendukung kegiatan seni seperti gamelan, alat musik, atau pakaian pentas."),
    items: isPentas ? STATIC_PENTAS_ITEMS : map(j.paket_fasilitasi, (p) => p.nama_paket),
    href: `/dashboard/ajukan-fasilitasi/form?jenis=${j.jenis_fasilitasi_id}`,
  };
}

export default function AjukanFasilitasiPage() {
  const [cards, setCards] = useState<FacilityCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fasilitasiApi
      .getAll()
      .then((data) => {
        if (data.length > 0) {
          setCards(data.map(mapJenisToCard));
          setError(null);
          return;
        }

        setCards([]);
        setError("Jenis fasilitasi belum tersedia saat ini.");
      })
      .catch(() => {
        setCards([]);
        setError("Gagal memuat data fasilitasi. Coba beberapa saat lagi.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="h-full overflow-y-auto px-4 pb-8 pt-8 sm:px-6 lg:pt-[84px]">
      <div className="mx-auto w-full max-w-[756px]">
        <header className="mx-auto max-w-[631px] text-center">
          <h1 className="text-[32px] font-medium leading-[48px] text-[rgba(38,43,67,0.9)] lg:text-[38px] lg:leading-[56px]">
            Ajukan Fasilitasi Lembaga Budaya
          </h1>
          <p className="mt-4 text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">
            Pilih jenis fasilitasi sesuai dengan kebutuhan lembaga budaya Anda.
          </p>
        </header>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-[#c23513] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="mt-10 rounded-lg border border-[rgba(194,53,19,0.2)] bg-[rgba(194,53,19,0.06)] px-4 py-3 text-[14px] text-[#a62c10]">
            {error}
          </div>
        ) : (
          <div className="mt-10 grid gap-7 md:grid-cols-2 lg:mt-16">
            {cards.map((card) => (
              <FacilityCard key={card.title} {...card} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
