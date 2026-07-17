import { Dumbbell } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center premium-bg">
      <div className="flex items-center gap-3 rounded-lg bg-white/80 px-5 py-4 shadow-panel dark:bg-white/10">
        <Dumbbell className="h-5 w-5 animate-pulse text-ember" />
        <span className="text-sm font-semibold">Loading experience...</span>
      </div>
    </div>
  );
}
