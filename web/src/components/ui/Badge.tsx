import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gold/40 px-3 py-1 text-xs uppercase tracking-[0.16em] text-light-gold">
      {children}
    </span>
  );
}
