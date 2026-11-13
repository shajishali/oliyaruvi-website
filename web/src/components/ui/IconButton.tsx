import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label">;

export function IconButton({ label, children, className = "", type = "button", ...props }: Props) {
  return (
    <button type={type} className={`icon-button ${className}`.trim()} aria-label={label} {...props}>
      {children}
    </button>
  );
}
