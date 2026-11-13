import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  id: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function Field({ label, id, ...props }: FieldProps) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} {...props} />
    </label>
  );
}

type SelectProps = {
  label: string;
  id: string;
  children: SelectHTMLAttributes<HTMLSelectElement>["children"];
} & SelectHTMLAttributes<HTMLSelectElement>;

export function SelectField({ label, id, children, ...props }: SelectProps) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <select id={id} {...props}>
        {children}
      </select>
    </label>
  );
}

type TextAreaProps = {
  label: string;
  id: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextAreaField({ label, id, ...props }: TextAreaProps) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <textarea id={id} {...props} />
    </label>
  );
}
