export function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}) {
  const variants = {
    primary:
      'bg-ink text-white shadow-glow hover:-translate-y-0.5 hover:bg-black dark:bg-white dark:text-ink',
    accent:
      'bg-ember text-white shadow-glow hover:-translate-y-0.5 hover:bg-[#e94325]',
    subtle:
      'bg-white/80 text-ink ring-1 ring-slate-200 hover:bg-white dark:bg-white/10 dark:text-white dark:ring-white/10',
    ghost:
      'text-steel hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10',
    danger:
      'bg-red-600 text-white hover:bg-red-700',
    dangerSubtle:
      'bg-red-50 text-red-600 ring-1 ring-red-100 hover:bg-red-100 hover:text-red-700 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20 dark:hover:bg-red-500/20',
  };

  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ember focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:shrink-0 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
