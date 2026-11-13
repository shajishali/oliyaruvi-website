export function PendingPage({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-section md:px-6">
      <h1 className="text-4xl text-ink">{title}</h1>
      <p className="mt-4 text-muted">This page is not built yet.</p>
    </section>
  );
}
