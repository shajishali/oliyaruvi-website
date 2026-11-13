import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "../../lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  animation?: "none" | "fade" | "rise";
};

export function Reveal({ children, className = "", animation = "fade" }: Props) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(reduced || animation === "none");

  useEffect(() => {
    if (reduced || animation === "none") {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) {
      setVisible(true);
      return;
    }

    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      setVisible(true);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
          show();
          observer.disconnect();
        }
      },
      { threshold: [0, 0.01, 0.1], rootMargin: "120px 0px 120px 0px" },
    );
    observer.observe(node);

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight + 120 && rect.bottom > -120) {
      show();
      observer.disconnect();
    }

    const fallback = window.setTimeout(show, 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [animation, reduced]);

  return (
    <div
      ref={ref}
      className={`reveal ${animation === "rise" ? "reveal-rise" : "reveal-fade"} ${visible ? "is-visible" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
