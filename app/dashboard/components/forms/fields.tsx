import type { ComponentPropsWithoutRef, ReactNode } from "react";

const baseInputClass =
  "h-11 w-full rounded-[10px] border border-[rgba(38,43,67,0.22)] bg-white px-4 text-[17px] leading-6 text-[rgba(38,43,67,0.9)] outline-none focus:border-[#c23513]";

type FieldLabelProps = {
  children: ReactNode;
  htmlFor?: string;
};

export function FieldLabel({ children, htmlFor }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[13px] leading-[15px] text-[rgba(38,43,67,0.9)]">
      {children}
    </label>
  );
}

type TextInputProps = Omit<ComponentPropsWithoutRef<"input">, "className"> & {
  italicPlaceholder?: boolean;
};

export function TextInput({ italicPlaceholder = false, ...props }: TextInputProps) {
  return (
    <input
      {...props}
      className={`${baseInputClass} placeholder:text-[rgba(38,43,67,0.4)] ${italicPlaceholder ? "placeholder:italic" : ""}`}
    />
  );
}

type DateInputProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "className">;

export function DateInput(props: DateInputProps) {
  return <input {...props} type="date" className={`${baseInputClass} [color-scheme:light]`} />;
}

type SelectFieldProps = Omit<ComponentPropsWithoutRef<"select">, "className" | "children"> & {
  placeholder: string;
  options: string[];
};

export function SelectField({ placeholder, options, ...props }: SelectFieldProps) {
  return (
    <select {...props} defaultValue={props.defaultValue ?? ""} className={baseInputClass}>
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

type TextAreaFieldProps = Omit<ComponentPropsWithoutRef<"textarea">, "className"> & {
  className?: string;
};

export function TextAreaField({ className, ...props }: TextAreaFieldProps) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-[10px] border border-[rgba(38,43,67,0.22)] bg-white px-4 py-[10px] text-[17px] leading-6 text-[rgba(38,43,67,0.9)] outline-none placeholder:text-[rgba(38,43,67,0.4)] focus:border-[#c23513] ${className ?? ""}`}
    />
  );
}

type FileInputFieldProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "className">;

export function FileInputField(props: FileInputFieldProps) {
  return (
    <input
      {...props}
      type="file"
      className="block w-full text-[13px] leading-[18px] text-[rgba(38,43,67,0.7)] file:mr-3 file:h-[34px] file:cursor-pointer file:rounded-[6px] file:border-0 file:bg-[#c23513] file:px-3 file:text-[13px] file:font-medium file:text-white file:shadow-[0_2px_6px_0_rgba(38,43,67,0.14)]"
    />
  );
}

export function HelperText({ children }: { children: ReactNode }) {
  return <p className="pt-1 text-[13px] leading-[13px] text-[rgba(38,43,67,0.7)]">{children}</p>;
}
