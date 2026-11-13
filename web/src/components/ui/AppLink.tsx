import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  newTab?: boolean;
};

export function AppLink({ href, children, className = "", newTab = false }: Props) {
  const external = /^(https?:|tel:|mailto:)/.test(href);
  if (external || newTab) {
    return (
      <a className={className} href={href} target={newTab ? "_blank" : undefined} rel={newTab ? "noreferrer" : undefined}>
        {children}
      </a>
    );
  }
  return (
    <Link className={className} to={href}>
      {children}
    </Link>
  );
}
