import { useEffect } from "react";
import { IconButton } from "../ui/IconButton";

type Props = {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

export function Lightbox({ open, src, alt, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev?.();
      if (event.key === "ArrowRight") onNext?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={alt || "Photograph"} onClick={onClose}>
      <div className="lightbox-inner" onClick={(event) => event.stopPropagation()}>
        <img src={src} alt={alt} />
        <div className="lightbox-actions">
          {onPrev ? (
            <IconButton label="Previous photograph" onClick={onPrev}>
              ←
            </IconButton>
          ) : null}
          <IconButton label="Close photograph" onClick={onClose}>
            ×
          </IconButton>
          {onNext ? (
            <IconButton label="Next photograph" onClick={onNext}>
              →
            </IconButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
