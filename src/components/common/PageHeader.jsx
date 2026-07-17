export function PageHeader({ title, eyebrow, actions, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.2em] text-ember">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
        {children ? <p className="mt-2 max-w-2xl text-sm text-steel">{children}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
