import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { adminApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { currency, getMemberName, shortDate } from '../../utils/format';

export default function ReportsPage() {
  const { data: stats } = useAsync(adminApi.stats, []);
  const { data: payments = [] } = useAsync(adminApi.payments, []);
  const { data: logs = [] } = useAsync(() => adminApi.auditLogs(20), []);
  const revenue = payments.filter((payment) => payment.status === 'COMPLETED').reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return (
    <div>
      <PageHeader title="Reports & Analytics" eyebrow="Insights">
        Derived from dashboard stats, payments, members, and super-admin audit logs. Attendance and notifications do not have backend endpoints yet.
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-steel">Members</p><p className="mt-2 text-3xl font-black">{stats?.totalMembers || 0}</p></Card>
        <Card><p className="text-sm text-steel">Revenue from payments</p><p className="mt-2 text-3xl font-black">{currency(revenue)}</p></Card>
        <Card><p className="text-sm text-steel">Completed payments</p><p className="mt-2 text-3xl font-black">{payments.filter((p) => p.status === 'COMPLETED').length}</p></Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-xl font-black">Recent payments</h2>
          <div className="space-y-3">
            {payments.slice(0, 8).map((payment) => <div key={payment.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-white/5"><div><p className="font-bold">{getMemberName(payment.member)}</p><p className="text-xs text-steel">{shortDate(payment.createdAt)}</p></div><div className="text-right"><p className="font-black">{currency(payment.amount)}</p><StatusBadge value={payment.status} /></div></div>)}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-xl font-black">Audit activity</h2>
          <div className="space-y-3">
            {logs.slice(0, 8).map((log) => <div key={log.id} className="rounded-lg bg-slate-50 p-3 dark:bg-white/5"><p className="font-bold">{log.action} · {log.entityType}</p><p className="text-xs text-steel">{log.performedBy?.email || 'System'} · {shortDate(log.timestamp)}</p></div>)}
            {!logs.length ? <p className="text-sm text-steel">Audit logs are visible only for super admins.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
