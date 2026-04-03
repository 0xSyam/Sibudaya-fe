"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarIcon, StatusChip, type TimelineStatus } from "@/app/dashboard/components/status/timeline-ui";

export type StatusOption = {
  label: string;
  chipClass: string;
  textClass: string;
  value: TimelineStatus;
};

function DropdownArrowIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}>
      <path d="M12.172 11L9.343 8.172L10.757 6.758L15 11L10.757 15.243L9.343 13.828L12.172 11Z" fill="rgba(38,43,67,0.5)" />
    </svg>
  );
}

export function StatusDropdown({
  currentStatus,
  options,
  onSelect,
}: {
  currentStatus: TimelineStatus;
  options: StatusOption[];
  onSelect?: (value: TimelineStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-1"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <DropdownArrowIcon isOpen={isOpen} />
        <StatusChip status={currentStatus} />
      </button>

      {isOpen ? (
        <div className="absolute left-[-42px] top-[30px] z-10 w-[169px] overflow-hidden rounded-[10px] bg-white py-2 shadow-[0_6px_20px_0_rgba(38,43,67,0.18)]">
          {options.map((option) => (
            <button
              type="button"
              key={option.label}
              className="flex w-full cursor-pointer items-center px-5 py-2 transition-colors hover:bg-[rgba(38,43,67,0.04)]"
              onClick={() => {
                onSelect?.(option.value);
                setIsOpen(false);
              }}
            >
              <span
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-[2px] text-[13px] font-medium leading-5 ${option.chipClass} ${option.textClass}`}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function StatusDateInput() {
  return (
    <div className="w-full max-w-[422px]">
      <div className="flex items-center gap-[10px] rounded-[10px] border border-[rgba(38,43,67,0.22)] px-4 py-3">
        <input
          type="text"
          placeholder="dd/mm/yyyy"
          className="flex-1 bg-transparent text-[17px] leading-6 text-[rgba(38,43,67,0.9)] outline-none placeholder:text-[rgba(38,43,67,0.4)]"
          readOnly
        />
        <CalendarIcon />
      </div>
    </div>
  );
}
