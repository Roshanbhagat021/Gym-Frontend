const tone = {
  NO_MEMBERSHIP: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10',
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  UPCOMING: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  EXPIRED: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  REFUNDED: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
};

export function StatusBadge({ value }) {
  return (
    <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${tone[value] || tone.EXPIRED}`}>
      {value ? String(value).replaceAll('_', ' ') : 'N/A'}
    </span>
  );
}
