import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { adminApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { getMemberEmail, getMemberName, shortDate } from '../../utils/format';

export default function DashboardPage() {
  const { data: stats, loading } = useAsync(adminApi.stats, []);
  // const { data: payments = [] } = useAsync(adminApi.payments, []);

  // const completed = payments.filter((payment) => payment.status === 'COMPLETED').length;
  // const pending = payments.filter((payment) => payment.status === 'PENDING').length;

  // const cards = [
  //   { label: 'Total Members', value: stats?.totalMembers || 0, icon: Users, accent: 'text-ember' },
  //   { label: 'Active Members', value: stats?.activeMembers || 0, icon: Activity, accent: 'text-mint' },
  //   { label: 'Total Revenue', value: currency(stats?.totalRevenue), icon: TrendingUp, accent: 'text-gold' },
  //   { label: 'Pending Payments', value: pending, icon: CreditCard, accent: 'text-blue-500' },
  // ];

  return (
    <div>
      <PageHeader title="Overview" eyebrow="Live operations">
        Your backend dashboard statistics, recent member registrations, and payment activity.
      </PageHeader>
      {/* <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => (
          <Card key={item.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-steel">{item.label}</p>
                <p className="mt-2 text-3xl font-black">{loading ? '...' : item.value}</p>
              </div>
              <item.icon className={`h-8 w-8 ${item.accent}`} />
            </div>
          </Card>
        ))}
      </div> */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="mb-4 text-xl font-black">Recent registrations</h2>
          <DataTable
            loading={loading}
            emptyTitle="No recent members"
            rows={stats?.recentRegistrations || []}
            columns={[
              { key: 'name', header: 'Member', render: (row) => <div><p className="font-bold">{getMemberName(row)}</p><p className="text-xs text-steel">{getMemberEmail(row)}</p></div> },
              { key: 'mobile', header: 'Mobile' },
              { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.membershipStatus} /> },
              { key: 'createdAt', header: 'Joined', render: (row) => shortDate(row.createdAt) },
            ]}
          />
        </Card>
        <Card>
          <h2 className="mb-4 text-xl font-black">Revenue pulse</h2>
          <div className="space-y-4">
            {/* <MetricBar label="Completed payments" value={completed} total={payments.length || 1} />
            <MetricBar label="Pending payments" value={pending} total={payments.length || 1} /> */}
            <MetricBar label="Active ratio" value={stats?.activeMembers || 0} total={stats?.totalMembers || 1} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricBar({ label, value, total }) {
  const percent = Math.min(100, Math.round((value / total) * 100));
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-semibold">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-3 rounded-full bg-ember" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
