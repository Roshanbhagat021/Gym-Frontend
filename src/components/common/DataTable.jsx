import { EmptyState } from './EmptyState';
import { Skeleton } from '../ui/Skeleton';

export function DataTable({ columns, rows = [], loading, emptyTitle, rowKey = 'id', onRowClick }) {
  const hasRows = rows && rows.length > 0;

  if (loading && !hasRows) {
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-steel dark:bg-white/5">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {[1, 2, 3, 4, 5].map((item) => (
              <tr key={item}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 align-middle">
                    <Skeleton className="h-5 w-32" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!hasRows) {
    return <EmptyState title={emptyTitle} description="Try adding a new record or adjusting filters." />;
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04] transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-steel dark:bg-white/5">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/10">
          {rows.map((row, index) => (
            <tr
              key={row[rowKey] || index}
              className={`hover:bg-slate-50 dark:hover:bg-white/5 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-4 align-middle">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
