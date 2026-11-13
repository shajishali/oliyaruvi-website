export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gold/30 px-5 py-10 text-center text-muted">
      {message}
    </div>
  );
}
