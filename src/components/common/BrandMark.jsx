import { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';

export function BrandMark({ logo, className = 'h-10 w-10', iconClassName = 'h-5 w-5' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [logo]);

  if (logo && !failed) {
    return <img src={logo} alt="Gym logo" className={`${className} object-contain`} onError={() => setFailed(true)} />;
  }

  return <span className={`grid shrink-0 place-items-center rounded-lg bg-ink text-white dark:bg-white dark:text-ink ${className}`}><Dumbbell className={iconClassName} /></span>;
}
