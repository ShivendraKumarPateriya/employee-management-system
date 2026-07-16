export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel hero-gradient p-5">
      <p className="eyebrow">{label}</p>
      <p className="display mt-4 text-4xl font-bold">{value}</p>
      <div className="mt-6 h-2 rounded-full bg-[var(--accent-soft)]">
        <div className="h-full w-2/3 rounded-full bg-[var(--accent)]" />
      </div>
    </div>
  );
}
