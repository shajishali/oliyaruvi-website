type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/** Public image with lazy loading below the fold and optional hero priority. */
export function MediaImage({ src, alt, className = "", priority = false, sizes = "(max-width: 768px) 100vw, 1200px" }: Props) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
