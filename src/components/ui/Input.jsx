import { forwardRef } from 'react';

export function Field({ label, error, children }) {
  return (
    <label className="block min-w-0 max-w-full">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-500">{error}</span> : null}
    </label>
  );
}

export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`box-border min-h-11 w-full min-w-0 max-w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-ember focus:ring-4 focus:ring-ember/10 dark:border-white/10 dark:bg-white/10 ${className}`}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-ember focus:ring-4 focus:ring-ember/10 dark:border-white/10 dark:bg-[#181a20] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea({ className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-ember focus:ring-4 focus:ring-ember/10 dark:border-white/10 dark:bg-white/10 ${className}`}
      {...props}
    />
  );
});
