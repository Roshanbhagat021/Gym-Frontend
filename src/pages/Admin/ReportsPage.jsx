import { useMemo, useState } from 'react';
import { Download, ReceiptIndianRupee } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/common/StatusBadge';
import { adminApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { currency, getMemberName, shortDate } from '../../utils/format';

export default function ReportsPage() {
  const today = toDateInput(new Date());
  const [range, setRange] = useState({
    startDate: toDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    endDate: today,
  });
  const { data: payments = [], loading } = useAsync(
    () => adminApi.payments(range),
    [range.startDate, range.endDate],
  );

  const completed = useMemo(
    () => payments.filter((payment) => payment.status === 'COMPLETED'),
    [payments],
  );
  const summary = useMemo(() => completed.reduce((totals, payment) => ({
    taxable: totals.taxable + Number(payment.taxableAmount || 0),
    gst: totals.gst + Number(payment.gstAmount || 0),
    collected: totals.collected + Number(payment.amount || 0),
  }), { taxable: 0, gst: 0, collected: 0 }), [completed]);

  const downloadReport = () => {
    const headings = ['Date', 'Member', 'Transaction ID', 'Taxable amount', 'GST rate', 'GST collected', 'Total collected', 'Method'];
    const rows = completed.map((payment) => [
      String(payment.createdAt || '').slice(0, 10),
      getMemberName(payment.member),
      payment.transactionId || '',
      Number(payment.taxableAmount || 0).toFixed(2),
      `${Number(payment.gstRate || 0).toFixed(2)}%`,
      Number(payment.gstAmount || 0).toFixed(2),
      Number(payment.amount || 0).toFixed(2),
      payment.paymentGateway === 'CASH' ? 'Cash' : 'Online',
    ]);
    const csv = [headings, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `gst-collection-${range.startDate}-to-${range.endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="GST Collection Report" eyebrow="Tax & revenue">
        Review completed membership collections by date and export an accountant-friendly CSV.
      </PageHeader>

      <Card className="mb-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-sm font-semibold">
            <span className="mb-1.5 block text-steel">From</span>
            <Input type="date" value={range.startDate} max={range.endDate} onChange={(event) => setRange((current) => ({ ...current, startDate: event.target.value }))} />
          </label>
          <label className="text-sm font-semibold">
            <span className="mb-1.5 block text-steel">To</span>
            <Input type="date" value={range.endDate} min={range.startDate} max={today} onChange={(event) => setRange((current) => ({ ...current, endDate: event.target.value }))} />
          </label>
          <Button variant="accent" onClick={downloadReport} disabled={!completed.length || loading}>
            <Download className="h-4 w-4" /> Download CSV
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Taxable membership value" value={currency(summary.taxable)} />
        <Metric label="GST collected" value={currency(summary.gst)} accent />
        <Metric label="Total collected" value={currency(summary.collected)} />
        <Metric label="Completed payments" value={completed.length} />
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-white/10">
          <div>
            <h2 className="text-xl font-black">GST ledger</h2>
            <p className="mt-1 text-xs text-steel">The selected GST rate is stored against each membership payment.</p>
          </div>
          <ReceiptIndianRupee className="h-6 w-6 text-ember" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-steel dark:bg-white/5">
              <tr>
                {['Date', 'Member', 'Taxable', 'GST rate', 'GST', 'Total', 'Status'].map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {completed.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-5 py-4">{shortDate(payment.createdAt)}</td>
                  <td className="px-5 py-4 font-bold">{getMemberName(payment.member)}</td>
                  <td className="px-5 py-4">{currency(payment.taxableAmount || 0)}</td>
                  <td className="px-5 py-4">{Number(payment.gstRate || 0)}%</td>
                  <td className="px-5 py-4 font-bold text-ember">{currency(payment.gstAmount || 0)}</td>
                  <td className="px-5 py-4 font-black">{currency(payment.amount)}</td>
                  <td className="px-5 py-4"><StatusBadge value={payment.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !completed.length ? <p className="p-10 text-center text-sm text-steel">No completed payments in this date range.</p> : null}
          {loading ? <p className="p-10 text-center text-sm text-steel">Preparing GST report…</p> : null}
        </div>
      </Card>

      <p className="mt-4 text-xs leading-5 text-steel">
        Older payments recorded before GST tracking show zero GST because their tax component cannot be reconstructed reliably. Confirm filing treatment with your accountant.
      </p>
    </div>
  );
}

function Metric({ label, value, accent = false }) {
  return <Card><p className="text-sm text-steel">{label}</p><p className={`mt-2 text-3xl font-black ${accent ? 'text-ember' : ''}`}>{value}</p></Card>;
}

function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}
