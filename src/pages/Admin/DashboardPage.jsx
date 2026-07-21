import { useState } from 'react';
import { Activity, CalendarDays, CreditCard, IndianRupee, Info, TrendingUp, UserPlus, Users, UserX } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { adminApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { currency, getMemberEmail, getMemberName, shortDate } from '../../utils/format';

const periods = [
  ['thisWeek', 'This week'], ['lastWeek', 'Last week'], ['thisMonth', 'This month'],
  ['lastMonth', 'Last month'], ['thisQuarter', 'This quarter'], ['thisYear', 'This year'],
];

const palette = ['#ff4d2d', '#29d39a', '#f7b731', '#6366f1', '#94a3b8'];

export default function DashboardPage() {
  const [period, setPeriod] = useState('thisMonth');
  const [customDates, setCustomDates] = useState({ startDate: '', endDate: '' });
  const [appliedDates, setAppliedDates] = useState(null);
  const query = period === 'custom' ? { period, ...appliedDates } : { period };
  const { data: stats, loading } = useAsync(() => adminApi.stats(query), [period, appliedDates?.startDate, appliedDates?.endDate], { immediate: period !== 'custom' || Boolean(appliedDates) });

  const cards = [
    { label: 'Total members', value: stats?.totalMembers, detail: 'All registered members', tooltip: 'The total number of member accounts currently registered in the gym.', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Active members', value: stats?.activeMembers, detail: `${stats?.activeRate || 0}% of all members`, tooltip: 'Members with an active membership, including their percentage of all registered members.', icon: Activity, color: 'text-mint', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Expired memberships', value: stats?.expiredMembers, detail: 'Need renewal follow-up', tooltip: 'Members whose memberships have expired and may require renewal follow-up.', icon: UserX, color: 'text-ember', bg: 'bg-red-50 dark:bg-red-500/10' },
    { label: 'Revenue', value: currency(stats?.totalRevenue), detail: `${stats?.completedPayments || 0} completed payments`, tooltip: 'Total completed-payment revenue received during the selected date period.', icon: IndianRupee, color: 'text-gold', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'New members', value: stats?.newMembers, detail: 'Joined in selected period', tooltip: 'Members who registered during the selected date period.', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Average payment', value: currency(stats?.averagePayment), detail: 'Per completed payment', tooltip: 'Selected-period revenue divided by the number of completed payments.', icon: CreditCard, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  ];

  return (
    <div>
      <PageHeader title="Business insights" eyebrow="Performance overview">
        Track memberships, growth, and revenue from one live dashboard.
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
        <CalendarDays className="mx-2 h-5 w-5 text-steel" />
        {periods.map(([value, label]) => (
          <button key={value} type="button" onClick={() => setPeriod(value)} className={`rounded-md px-3 py-2 text-sm font-bold transition ${period === value ? 'bg-ink text-white dark:bg-white dark:text-ink' : 'text-steel hover:bg-slate-100 dark:hover:bg-white/10'}`}>
            {label}
          </button>
        ))}
        <button type="button" onClick={() => setPeriod('custom')} className={`rounded-md px-3 py-2 text-sm font-bold transition ${period === 'custom' ? 'bg-ink text-white dark:bg-white dark:text-ink' : 'text-steel hover:bg-slate-100 dark:hover:bg-white/10'}`}>
          Custom dates
        </button>
        {period === 'custom' && <form className="flex w-full flex-wrap items-end gap-2 border-t border-slate-100 px-2 pt-3 dark:border-white/10" onSubmit={(event) => { event.preventDefault(); if (customDates.startDate && customDates.endDate) setAppliedDates({ ...customDates }); }}>
          <label className="text-xs font-bold text-steel">From<input aria-label="Start date" type="date" max={customDates.endDate || undefined} value={customDates.startDate} onChange={(event) => setCustomDates((current) => ({ ...current, startDate: event.target.value }))} className="mt-1 block rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-ember dark:border-white/10 dark:text-white" /></label>
          <label className="text-xs font-bold text-steel">To<input aria-label="End date" type="date" min={customDates.startDate || undefined} value={customDates.endDate} onChange={(event) => setCustomDates((current) => ({ ...current, endDate: event.target.value }))} className="mt-1 block rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-ember dark:border-white/10 dark:text-white" /></label>
          <button disabled={!customDates.startDate || !customDates.endDate} type="submit" className="rounded-md bg-ember px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Apply range</button>
        </form>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => (
          <Card key={item.label} className="relative overflow-visible">
            <div className="flex items-start justify-between">
              <div><div className="flex items-center gap-2"><p className="text-sm font-bold text-steel">{item.label}</p><WidgetTooltip text={item.tooltip} /></div><p className="mt-2 text-3xl font-black">{loading ? '—' : item.value ?? 0}</p><p className="mt-2 text-xs text-steel">{item.detail}</p></div>
              <div className={`rounded-lg p-3 ${item.bg}`}><item.icon className={`h-6 w-6 ${item.color}`} /></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <ChartHeading title="Revenue trend" subtitle="Completed payments during the selected period" tooltip="Shows how completed-payment revenue changes across the selected period." icon={TrendingUp} />
          <LineChart rows={stats?.revenueTrend || []} valueFormatter={currency} loading={loading} />
        </Card>
        <Card>
          <ChartHeading title="Members by gender" subtitle="Current member distribution" tooltip="Breaks down all registered members by their recorded gender." icon={Users} />
          <DonutChart rows={stats?.genderDistribution || []} loading={loading} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <ChartHeading title="Registration growth" subtitle="New member sign-ups" tooltip="Shows new member registrations across the selected date period." icon={UserPlus} />
          <LineChart rows={stats?.registrationTrend || []} color="#6366f1" loading={loading} />
        </Card>
        <Card>
          <ChartHeading title="Membership health" subtitle="Status of all members" tooltip="Compares the current membership-status totals across all members." icon={Activity} />
          <HorizontalBars rows={stats?.membershipDistribution || []} loading={loading} />
        </Card>
      </div>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <div className="mb-4 flex items-center gap-2"><h2 className="text-xl font-black">Recent registrations</h2><WidgetTooltip text="Lists the five most recently registered members and their current status." /></div>
          <DataTable tableClassName="min-w-full" loading={loading} emptyTitle="No recent members" rows={stats?.recentRegistrations || []} columns={[
            { key: 'name', header: 'Member', render: (row) => <div><p className="font-bold">{getMemberName(row)}</p><p className="text-xs text-steel">{getMemberEmail(row)}</p></div> },
            { key: 'mobile', header: 'Mobile', sortable: false },
            { key: 'status', header: 'Status', sortable: false, render: (row) => <StatusBadge value={row.membershipStatus} /> },
            { key: 'createdAt', header: 'Joined', render: (row) => shortDate(row.createdAt) },
          ]} />
        </Card>
        <Card className="min-w-0">
          <ChartHeading title="Revenue by payment method" subtitle="Completed payment value" tooltip="Compares completed-payment revenue grouped by payment method." icon={CreditCard} />
          <HorizontalBars rows={stats?.paymentMethods || []} valueFormatter={currency} loading={loading} />
        </Card>
      </div>
    </div>
  );
}

function ChartHeading({ title, subtitle, tooltip, icon: Icon }) {
  return <div className="mb-5 flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="text-xl font-black leading-tight">{title}</h2><WidgetTooltip text={tooltip} /></div><p className="mt-1 text-sm text-steel">{subtitle}</p></div><Icon className="h-5 w-5 shrink-0 text-steel" /></div>;
}

function WidgetTooltip({ text }) {
  return <span className="group relative inline-flex shrink-0"><button type="button" className="rounded-full text-slate-400 transition hover:text-ember focus:text-ember focus:outline-none" aria-label="About this widget"><Info className="h-4 w-4" /></button><span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded-md bg-ink px-3 py-2 text-left text-xs font-medium leading-relaxed text-white shadow-lg group-hover:block group-focus-within:block dark:bg-white dark:text-ink">{text}<span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-ink dark:border-t-white" /></span></span>;
}

function EmptyChart({ loading }) {
  return <div className="flex h-56 items-center justify-center text-sm font-semibold text-steel">{loading ? 'Loading insights…' : 'No data for this period'}</div>;
}

function LineChart({ rows, color = '#ff4d2d', valueFormatter = (value) => value, loading }) {
  const [hovered, setHovered] = useState(null);
  if (!rows.length) return <EmptyChart loading={loading} />;
  const width = 700, height = 220, padX = 36, padY = 24;
  const max = Math.max(...rows.map((row) => row.value), 1);
  const points = rows.map((row, index) => {
    const x = padX + (index * (width - padX * 2)) / Math.max(rows.length - 1, 1);
    const y = height - padY - (row.value / max) * (height - padY * 2);
    return { ...row, x, y };
  });
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const labelIndexes = new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1]);
  return <div className="relative min-w-0"><svg viewBox={`0 0 ${width} ${height}`} className="mb-3 h-56 w-full overflow-visible" role="img" aria-label="Trend chart" onMouseLeave={() => setHovered(null)}>
    {[0, .25, .5, .75, 1].map((part) => <line key={part} x1={padX} x2={width - padX} y1={padY + part * (height - padY * 2)} y2={padY + part * (height - padY * 2)} stroke="currentColor" className="text-slate-100 dark:text-white/10" />)}
    <path d={`${path} L ${points.at(-1).x} ${height - padY} L ${points[0].x} ${height - padY} Z`} fill={color} opacity="0.1" />
    <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    {hovered && <line x1={hovered.x} x2={hovered.x} y1={padY} y2={height - padY} stroke={color} strokeDasharray="5 5" opacity=".45" />}
    {points.map((point, index) => <g key={`${point.date}-${index}`} onMouseEnter={() => setHovered(point)} className="cursor-pointer"><circle cx={point.x} cy={point.y} r="14" fill="transparent" /><circle cx={point.x} cy={point.y} r={hovered === point ? 7 : 5} fill={color} stroke="white" strokeWidth="2" />{labelIndexes.has(index) && <text x={point.x} y={height} textAnchor="middle" fontSize="12" fill="currentColor" className="text-steel">{chartDate(point.date)}</text>}</g>)}
  </svg>{hovered && <ChartTooltip style={{ left: `${hovered.x / width * 100}%`, top: `${Math.max(hovered.y / height * 100 - 5, 0)}%` }} label={fullChartDate(hovered.date)} value={valueFormatter(hovered.value)} />}<div className="border-t border-slate-100 pt-2 text-right text-xs font-bold text-steel dark:border-white/10">Peak: {valueFormatter(max)}</div></div>;
}

function DonutChart({ rows, loading }) {
  const [hovered, setHovered] = useState(null);
  if (!rows.length) return <EmptyChart loading={loading} />;
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  let cursor = 0;
  const segments = rows.map((row) => { const start = cursor; const size = row.value / total * 100; cursor += size; return { ...row, start, size }; });
  return <div className="flex flex-col items-center gap-6 sm:flex-row xl:flex-col 2xl:flex-row"><div className="relative h-44 w-44 shrink-0" onMouseLeave={() => setHovered(null)}><svg viewBox="0 0 176 176" className="h-full w-full -rotate-90">{segments.map((row, index) => <circle key={row.label} cx="88" cy="88" r="65" fill="none" stroke={palette[index % palette.length]} strokeWidth={hovered?.label === row.label ? 32 : 28} pathLength="100" strokeDasharray={`${row.size} ${100 - row.size}`} strokeDashoffset={-row.start} onMouseEnter={() => setHovered(row)} className="cursor-pointer transition-all" />)}</svg><div className="pointer-events-none absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white text-center dark:bg-[#24262a]"><span className="text-3xl font-black">{hovered?.value ?? total}</span><span className="max-w-24 text-xs font-bold text-steel">{hovered ? `${hovered.label} (${Math.round(hovered.value / total * 100)}%)` : 'members'}</span></div></div><div className="w-full space-y-3">{rows.map((row, index) => <div key={row.label} onMouseEnter={() => setHovered(row)} onMouseLeave={() => setHovered(null)} className="flex cursor-default items-center justify-between rounded-md p-1 text-sm transition hover:bg-slate-50 dark:hover:bg-white/5"><span className="flex items-center gap-2 font-semibold"><i className="h-3 w-3 rounded-full" style={{ background: palette[index % palette.length] }} />{row.label}</span><span className="font-black">{row.value} <small className="font-semibold text-steel">({Math.round(row.value / total * 100)}%)</small></span></div>)}</div></div>;
}

function HorizontalBars({ rows, valueFormatter = (value) => value, loading }) {
  if (!rows.length) return <EmptyChart loading={loading} />;
  const max = Math.max(...rows.map((row) => row.value), 1);
  return <div className="space-y-5">{rows.map((row, index) => <div key={row.label} title={`${row.label}: ${valueFormatter(row.value)}`} className="group"><div className="mb-2 flex justify-between text-sm"><span className="font-bold capitalize">{String(row.label).toLowerCase().replace('_', ' ')}</span><span className="font-black">{valueFormatter(row.value)}</span></div><div className="relative h-2.5 rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full transition-all duration-500 group-hover:brightness-110" style={{ width: `${row.value / max * 100}%`, background: palette[index % palette.length] }} /><div className="pointer-events-none absolute bottom-5 right-0 z-10 hidden rounded-md bg-ink px-3 py-2 text-xs font-bold text-white shadow-lg group-hover:block">{row.label}: {valueFormatter(row.value)}</div></div></div>)}</div>;
}

function ChartTooltip({ label, value, style }) {
  return <div style={style} className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink px-3 py-2 text-xs text-white shadow-lg"><p className="font-semibold text-slate-300">{label}</p><p className="mt-0.5 font-black">{value}</p></div>;
}

function chartDate(value) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(value));
}

function fullChartDate(value) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}
