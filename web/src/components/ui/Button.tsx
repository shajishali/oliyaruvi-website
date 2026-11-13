import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "gold" | "outline" | "whatsapp";

type Props = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  href?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button({ variant = "gold", children, className = "", href, type = "button", ...props }: Props) {
  const classes = `btn is-${variant} ${className}`.trim();
  if (href) {
    const external = /^(https?:|tel:|mailto:)/.test(href);
    if (external) {
      return (
        <a className={classes} href={href}>
          {children}
        </a>
      );
    }
    return (
      <Link className={classes} to={href}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
