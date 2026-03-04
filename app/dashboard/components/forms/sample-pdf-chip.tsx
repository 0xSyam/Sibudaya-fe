type SamplePdfChipProps = {
  filename: string;
};

export function SamplePdfChip({ filename }: SamplePdfChipProps) {
  return (
    <div className="inline-flex items-center gap-[10px] rounded-[8px] bg-[rgba(38,43,67,0.06)] px-[10px] py-[5px]">
      <svg
        width="16"
        height="20"
        viewBox="0 0 16 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M2 1H10L14 5V19H2V1Z"
          fill="#E12D2D"
          stroke="#B31414"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        <path d="M10 1V5H14" fill="#F7A9A9" />
        <text
          x="8"
          y="14"
          textAnchor="middle"
          fontSize="4.2"
          fontWeight="700"
          fill="white"
          fontFamily="Arial, sans-serif"
        >
          PDF
        </text>
      </svg>
      <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.7)]">{filename}</p>
    </div>
  );
}
