export function Card({ children, className = '' }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-white/[0.06] ${className}`}>
      {children}
    </section>
  );
}
