import { useMemo, useState } from 'react';
import { ArrowDownAZ, ArrowUpAZ, Filter, Search } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Skeleton } from '../ui/Skeleton';

export function DataTable({
  columns,
  rows = [],
  loading,
  emptyTitle,
  rowKey = 'id',
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Search here',
  searchValue,
  onSearchChange,
  toolbarActions,
  filterContent,
  tableClassName = 'min-w-[760px]',
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: '', direction: 'asc' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeSearch = searchValue ?? search;
  const filteredRows = useMemo(() => {
    const query = activeSearch.trim().toLowerCase();
    if (!searchable || !query) return rows;

    return rows.filter((row) => {
      try {
        return JSON.stringify(row).toLowerCase().includes(query);
      } catch {
        return Object.values(row || {}).some((value) => String(value).toLowerCase().includes(query));
      }
    });
  }, [rows, activeSearch, searchable]);
  const displayedRows = useMemo(() => {
    if (!sort.key) return filteredRows;
    const column = columns.find((item) => item.key === sort.key);
    return [...filteredRows].sort((left, right) => {
      const leftValue = column?.sortValue ? column.sortValue(left) : left?.[sort.key];
      const rightValue = column?.sortValue ? column.sortValue(right) : right?.[sort.key];
      const comparison = String(leftValue ?? '').localeCompare(String(rightValue ?? ''), undefined, { numeric: true, sensitivity: 'base' });
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [columns, filteredRows, sort]);
  const hasRows = displayedRows.length > 0;

  const toggleSort = (key) => setSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }));

  const headerCell = (column) => {
    const sortable = column.sortable !== false && column.key !== 'actions';
    if (!sortable) return column.header;
    const active = sort.key === column.key;
    return (
      <button type="button" onClick={() => toggleSort(column.key)} className="group inline-flex items-center gap-2 whitespace-nowrap font-semibold" aria-label={`Sort by ${column.header}`}>
        {column.header}
        <span className={`inline-flex flex-col text-[9px] leading-[7px] ${active ? 'text-ember' : 'text-slate-400 group-hover:text-slate-600'}`}>
          {active && sort.direction === 'desc' ? <ArrowDownAZ className="h-3.5 w-3.5" /> : <ArrowUpAZ className="h-3.5 w-3.5" />}
        </span>
      </button>
    );
  };

  const toolbar = searchable || toolbarActions || filterContent ? (
    <>
    <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:flex-row sm:justify-end">
      {searchable ? (
      <label className="relative col-span-2 block w-full sm:col-auto sm:w-72">
        <span className="sr-only">Search listing</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
        <input
          type="search"
          value={activeSearch}
          onChange={(event) => onSearchChange ? onSearchChange(event.target.value) : setSearch(event.target.value)}
          placeholder={searchPlaceholder}
          className="min-h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none shadow-sm transition placeholder:text-slate-400 focus:border-ember focus:ring-4 focus:ring-ember/10 dark:border-white/10 dark:bg-white/[0.06]"
        />
      </label>
      ) : null}
      {toolbarActions}
      {filterContent ? (
        <button type="button" onClick={() => setFiltersOpen((current) => !current)} className={`inline-flex min-h-10 w-11 items-center justify-center rounded-md text-white shadow-sm transition hover:-translate-y-0.5 ${filtersOpen ? 'bg-ember shadow-ember/25' : 'bg-[#93472f] hover:bg-[#7d3925]'}`} aria-label="Toggle filters" aria-expanded={filtersOpen}>
          <Filter className="h-4 w-4" />
        </button>
      ) : null}
    </div>
    {filtersOpen ? <div className="mb-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">{filterContent}</div> : null}
    </>
  ) : null;

  if (loading && !hasRows) {
    return (
      <div>
        {toolbar}
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <table className={`w-full text-left text-sm ${tableClassName}`}>
          <thead className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
                  {headerCell(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {[1, 2, 3, 4, 5].map((item) => (
              <tr key={item}>
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-5 align-middle">
                    <Skeleton className="h-5 w-32" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    );
  }

  if (!hasRows) {
    return <div>{toolbar}<EmptyState title={activeSearch ? 'No matching records' : emptyTitle} description={activeSearch ? 'Try a different search term.' : 'Try adding a new record or adjusting filters.'} /></div>;
  }

  return (
    <div className={`transition-opacity duration-200 ${loading ? 'pointer-events-none opacity-50' : ''}`}>
      {toolbar}
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <table className={`w-full text-left text-sm ${tableClassName}`}>
        <thead className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
                {headerCell(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/10">
          {displayedRows.map((row, index) => (
            <tr
              key={row[rowKey] || index}
              className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-white/5 ${onRowClick ? 'cursor-pointer' : ''}`}
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
                <td key={column.key} className="px-5 py-5 align-middle text-slate-700 dark:text-slate-200">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
