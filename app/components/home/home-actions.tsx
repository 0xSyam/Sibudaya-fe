"use client";

import Link from "next/link";
import { useState } from "react";

type FacilityType = {
  title: string;
  description: string;
  packages: string[];
  requirements: string[];
  icon: "pentas" | "hibah";
};

const facilityTypes: FacilityType[] = [
  {
    title: "Fasilitasi Pentas",
    description: "Bantuan untuk pelaksanaan kegiatan pentas seni dan pembinaan lembaga budaya.",
    packages: ["Pembinaan Sanggar", "Pentas Seni"],
    requirements: ["Identitas Lembaga", "Sertifikat NIK Lembaga", "Proposal Pendukung"],
    icon: "pentas",
  },
  {
    title: "Fasilitasi Hibah",
    description: "Bantuan pendukung kegiatan seni seperti gamelan, alat musik, atau pakaian pentas.",
    packages: ["Gamelan Besi Slendro Pelog", "Alat Kesenian", "Pakaian Kesenian"],
    requirements: ["Identitas Lembaga", "Sertifikat NIK Lembaga", "Proposal Pendukung"],
    icon: "hibah",
  },
];

function DotBullet() {
  return <span className="h-3.5 w-3.5 shrink-0 rounded-full border-[1.5px] border-gray-400" />;
}

function PentasIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#c23513"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6h12l1.5 14H4.5L6 6z" />
      <path d="M9 6V4a3 3 0 0 1 6 0v2" />
      <line x1="9" y1="11" x2="15" y2="11" />
    </svg>
  );
}

function HibahIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#c23513"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16v3.5a2.5 2.5 0 0 1 0 5V19H4v-3.5a2.5 2.5 0 0 1 0-5V7z" />
      <line x1="9" y1="10" x2="15" y2="10" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

function FacilityTypeCard({ facility }: { facility: FacilityType }) {
  return (
    <article className="flex flex-col items-center rounded-xl bg-white px-6 py-6 shadow-xl">
      <div className="mb-4 flex h-19 w-19 items-center justify-center rounded-full bg-[#fbeae7]">
        {facility.icon === "pentas" ? <PentasIcon /> : <HibahIcon />}
      </div>

      <h2 className="mb-1 text-center text-[20px] font-semibold text-[#262b43]">{facility.title}</h2>
      <p className="mb-6 w-[95%] text-center text-[12.5px] leading-[1.6] text-gray-500">{facility.description}</p>

      <div className="flex w-full flex-col items-center">
        <h3 className="mb-3 text-center text-[13.5px] font-medium text-[#c23513]">Jenis Paket Fasilitasi</h3>
        <ul className="mb-6 w-full max-w-55 space-y-2.5">
          {facility.packages.map((item) => (
            <li key={item} className="flex items-center gap-3 text-[12.5px] text-gray-500">
              <DotBullet />
              {item}
            </li>
          ))}
        </ul>

        <h3 className="mb-3 text-center text-[13.5px] font-medium text-[#c23513]">Apa Yang Harus Disiapkan?</h3>
        <ul className="mb-6 w-full max-w-55 space-y-2.5">
          {facility.requirements.map((item) => (
            <li key={item} className="flex items-center gap-3 text-[12.5px] text-gray-500">
              <DotBullet />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/login"
        className="mt-auto inline-flex h-10.5 w-full items-center justify-center rounded-md bg-[#c23513] text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-[#a62c10]"
      >
        Ajukan
      </Link>
    </article>
  );
}

function FacilityTypesModal({ onClose }: { onClose: () => void }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;
  const totalPages = Math.ceil(facilityTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFacilities = facilityTypes.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#8f929b]/80 p-4 backdrop-blur-[2px] sm:p-6">
      <div className="flex w-full max-w-190 flex-col items-start">
        <button
          type="button"
          onClick={onClose}
          className="mb-3 flex shrink-0 items-center gap-2 rounded-md bg-[#c23513] px-4 py-2 text-[14px] font-medium text-white shadow-md transition-colors hover:bg-[#a62c10]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
          Kembali
        </button>

        <div className="grid w-full shrink-0 grid-cols-1 gap-5 md:hidden">
          {paginatedFacilities.map((facility) => (
            <FacilityTypeCard key={facility.title} facility={facility} />
          ))}
        </div>

        <div className="hidden w-full shrink-0 grid-cols-2 gap-5 md:grid">
          {facilityTypes.map((facility) => (
            <FacilityTypeCard key={`desktop-${facility.title}`} facility={facility} />
          ))}
        </div>

        <div className="mt-4 flex w-full items-center justify-center md:hidden">
          <div className="inline-flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/45 text-[#39416b] backdrop-blur-[1px] transition-colors hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Halaman sebelumnya"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            const isActive = currentPage === page;

            return (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                aria-label={`Halaman ${page}`}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-[20px] font-semibold leading-none transition-colors ${
                  isActive
                    ? "bg-[#c23513] text-white shadow-[0_0_0_2px_rgba(35,42,74,0.35)]"
                    : "bg-white/35 text-[#39416b] hover:bg-white/50 hover:text-[#2f3550]"
                }`}
              >
                {page}
              </button>
            );
          })}

            <button
              type="button"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/45 text-[#39416b] backdrop-blur-[1px] transition-colors hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Halaman berikutnya"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 md:mt-5 md:justify-start">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-9.5 rounded-lg border border-[#c23513] px-5.5 text-[15px] font-medium leading-5.5 text-[#c23513] transition-colors hover:bg-[#fcebea]"
        >
          Jenis Fasilitasi
        </button>
        <Link
          href="/login"
          className="inline-flex h-9.5 items-center justify-center rounded-lg bg-[#c23513] px-5.5 text-[15px] font-medium leading-5.5 text-white shadow-[0px_2px_6px_0px_rgba(38,43,67,0.14)] transition-colors hover:bg-[#a62c10]"
        >
          Ajukan Fasilitasi
        </Link>
      </div>

      {isModalOpen ? <FacilityTypesModal onClose={() => setIsModalOpen(false)} /> : null}
    </>
  );
}
