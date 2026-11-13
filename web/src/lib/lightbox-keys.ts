export function lightboxKeyAction(key: string): "close" | "prev" | "next" | null {
  if (key === "Escape") return "close";
  if (key === "ArrowLeft") return "prev";
  if (key === "ArrowRight") return "next";
  return null;
}
