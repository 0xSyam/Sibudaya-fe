import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

const baseInputClass =
  "h-11 w-full rounded-[10px] border bg-white px-4 text-[17px] leading-6 text-[rgba(38,43,67,0.9)] outline-none focus:border-[#c23513]";

const normalBorder = "border-[rgba(38,43,67,0.22)]";
const errorBorder = "border-red-500";

type FieldLabelProps = {
  children: ReactNode;
  htmlFor?: string;
};

export function FieldLabel({ children, htmlFor }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-[13px] leading-[15px] text-[rgba(38,43,67,0.9)]"
    
    >
      {children}
    </label>
  );
}

type TextInputProps = Omit<ComponentPropsWithoutRef<"input">, "className"> & {
  italicPlaceholder?: boolean;
  isError?: boolean;
};

export function TextInput({
  italicPlaceholder = false,
  isError = false,
  ...props
}: TextInputProps) {
  return (
    <input
      {...props}
      className={`${baseInputClass} ${isError ? errorBorder : normalBorder} placeholder:text-[rgba(38,43,67,0.4)] ${italicPlaceholder ? "placeholder:italic" : ""}`}
    />
  );
}

type DateInputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "className"
> & {
  isError?: boolean;
};

export function DateInput({ isError = false, ...props }: DateInputProps) {
  return (
    <input
      {...props}
      type="date"
      className={`${baseInputClass} ${isError ? errorBorder : normalBorder} [color-scheme:light]`}
    />
  );
}

type SelectFieldProps = Omit<
  ComponentPropsWithoutRef<"select">,
  "className" | "children"
> & {
  placeholder: string;
  options: string[];
  isError?: boolean;
};

export function SelectField({
  placeholder,
  options,
  value,
  defaultValue,
  isError = false,
  ...props
}: SelectFieldProps) {
  return (
    <select
      {...props}
      {...(value !== undefined
        ? { value }
        : { defaultValue: defaultValue ?? "" })}
      className={`${baseInputClass} ${isError ? errorBorder : normalBorder}`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

type BankOption = {
  id: string;
  label: string;
  bank_code: string;
};

type SearchableBankSelectFieldProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "className" | "onChange" | "value"
> & {
  banks: BankOption[];
  value: string;
  onValueChange: (value: string) => void;
  isError?: boolean;
  searchPlaceholder?: string;
  selectPlaceholder?: string;
};

export function SearchableBankSelectField({
  banks,
  value,
  onValueChange,
  isError = false,
  searchPlaceholder = "Cari bank",
  selectPlaceholder = "Pilih bank",
  id,
  name,
  required,
  disabled,
  ...props
}: SearchableBankSelectFieldProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredBanks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return banks;
    return banks.filter((bank) => {
      const normalizedLabel = bank.label.toLowerCase();
      const normalizedCode = bank.bank_code.toLowerCase();
      return (
        normalizedLabel.includes(normalizedQuery) ||
        normalizedCode.includes(normalizedQuery)
      );
    });
  }, [banks, query]);

  useEffect(() => {
    if (!isOpen) return;
    if (filteredBanks.length === 0) {
      setHighlightedIndex(-1);
      return;
    }

    const selectedIndex = filteredBanks.findIndex(
      (bank) => bank.label === value,
    );
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [filteredBanks, isOpen, value]);

  const handleSelect = (label: string) => {
    onValueChange(label);
    setQuery(label);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative">
      {name ? (
        <input type="hidden" name={name} value={value} required={required} />
      ) : null}
      <input
        {...props}
        id={id}
        disabled={disabled}
        type="text"
        value={query}
        placeholder={query.trim() ? searchPlaceholder : selectPlaceholder}
        autoComplete="off"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={id ? `${id}-bank-listbox` : undefined}
        onChange={(e) => {
          const nextQuery = e.target.value;
          setQuery(nextQuery);
          setIsOpen(true);
          if (nextQuery.trim() !== value.trim()) {
            onValueChange("");
          }
        }}
        onFocus={() => {
          if (!disabled) {
            setIsOpen(true);
          }
        }}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
          }
        }}
        onKeyDown={(e) => {
          if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            setIsOpen(true);
            return;
          }

          if (e.key === "Escape") {
            setIsOpen(false);
            setHighlightedIndex(-1);
            return;
          }

          if (!isOpen || filteredBanks.length === 0) {
            return;
          }

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) => {
              if (prev < 0) return 0;
              return (prev + 1) % filteredBanks.length;
            });
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) => {
              if (prev < 0) return filteredBanks.length - 1;
              return (prev - 1 + filteredBanks.length) % filteredBanks.length;
            });
          }

          if (e.key === "Enter") {
            if (
              highlightedIndex >= 0 &&
              highlightedIndex < filteredBanks.length
            ) {
              e.preventDefault();
              handleSelect(filteredBanks[highlightedIndex].label);
            }
          }
        }}
        className={`${baseInputClass} ${isError ? errorBorder : normalBorder} placeholder:text-[rgba(38,43,67,0.4)]`}
      />

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[rgba(38,43,67,0.55)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 011.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {isOpen ? (
        <div
          id={id ? `${id}-bank-listbox` : undefined}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-[10px] border border-[rgba(38,43,67,0.18)] bg-white py-1 shadow-[0_10px_24px_rgba(38,43,67,0.16)]"
        >
          {filteredBanks.length > 0 ? (
            filteredBanks.map((bank, index) => {
              const isSelected = bank.label === value;
              const isHighlighted = index === highlightedIndex;
              return (
                <button
                  key={bank.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`block w-full px-4 py-2 text-left text-[15px] leading-6 ${isHighlighted ? "bg-[rgba(194,53,19,0.12)]" : ""} ${isSelected ? "font-semibold text-[#8f280f]" : "text-[rgba(38,43,67,0.9)] hover:bg-[rgba(194,53,19,0.08)]"}`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(bank.label)}
                >
                  <span>{bank.label}</span>
                  <span className="ml-2 text-[12px] text-[rgba(38,43,67,0.55)]">
                    ({bank.bank_code})
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-2 text-[14px] text-[rgba(38,43,67,0.65)]">
              Tidak ada bank yang cocok dengan pencarian "{query}".
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

type TextAreaFieldProps = Omit<
  ComponentPropsWithoutRef<"textarea">,
  "className"
> & {
  className?: string;
  isError?: boolean;
};

export function TextAreaField({
  className,
  isError = false,
  ...props
}: TextAreaFieldProps) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-[10px] border ${isError ? errorBorder : normalBorder} bg-white px-4 py-[10px] text-[17px] leading-6 text-[rgba(38,43,67,0.9)] outline-none placeholder:text-[rgba(38,43,67,0.4)] focus:border-[#c23513] ${className ?? ""}`}
    />
  );
}

type FileInputFieldProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "className"
> & {
  isError?: boolean;
};

export function FileInputField({
  isError = false,
  ...props
}: FileInputFieldProps) {
  return (
    <input
      {...props}
      type="file"
      className={`block w-full rounded-[6px] ${isError ? "ring-1 ring-red-500" : ""} text-[13px] leading-[18px] text-[rgba(38,43,67,0.7)] file:mr-3 file:h-[34px] file:cursor-pointer file:rounded-[6px] file:border-0 file:bg-[#c23513] file:px-3 file:text-[13px] file:font-medium file:text-white file:shadow-[0_2px_6px_0_rgba(38,43,67,0.14)]`}
    />
  );
}

export function HelperText({ children }: { children: ReactNode }) {
  return (
    <p className="pt-1 text-[13px] leading-[13px] text-[rgba(38,43,67,0.7)]">
      {children}
    </p>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p className="pt-1 text-[13px] leading-[13px] text-red-500">{children}</p>
  );
}
