export function EmptyState({ title = 'Nothing here yet', description }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-white/10">
      <h3 className="text-base font-black">{title}</h3>
      {description ? <p className="mt-2 text-sm text-steel">{description}</p> : null}
    </div>
  );
}
