import type { ReactNode } from "react";

export function BlockFrame({ children }: { children: ReactNode }) {
  return <section className="py-section">{children}</section>;
}
