import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, CreditCard, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';
import { useAsync } from '../../hooks/useAsync';
import { memberApi } from '../../services/api';
import { currency, shortDate } from '../../utils/format';
import { BrandMark } from '../../components/common/BrandMark';

export default function MemberDashboardPage() {
  const { logout } = useAuth();
  const { gymName, logo } = useSiteContent();
  const navigate = useNavigate();
  const { data: profile, loading: profileLoading } = useAsync(memberApi.profile, []);
  const { data: payments = [], loading: paymentsLoading } = useAsync(memberApi.paymentHistory, []);

  const activeMembership = getCurrentMembership(profile?.memberships);

  const handleLogout = async () => {
    await logout();
    navigate('/member/login');
  };

  return (
    <main className="min-h-screen bg-slate-50 text-ink dark:bg-[#0f1115] dark:text-white">
      <header className="border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#111317]/85 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <BrandMark logo={logo} />
            <span className="font-black">{gymName}</span>
          </Link>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl p-4 md:p-8">
        <PageHeader title="Member Dashboard" eyebrow="My profile">
          Your membership status, plan timeline, and payment history.
        </PageHeader>

        {profileLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <div className="flex items-center gap-4">
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile?.user?.name || 'Member profile'}
                      className="h-20 w-20 shrink-0 rounded-lg object-cover shadow-panel"
                    />
                  ) : (
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                      <UserRound className="h-9 w-9" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-steel">Member</p>
                    <h2 className="mt-1 break-words text-2xl font-black">{profile?.user?.name}</h2>
                    <p className="mt-1 break-words text-sm text-steel">{profile?.user?.email}</p>
                  </div>
                </div>
              </Card>
              <Card>
                <ShieldCheck className="h-6 w-6 text-mint" />
                <p className="mt-4 text-sm font-semibold text-steel">Membership status</p>
                <div className="mt-2">
                  <StatusBadge value={profile?.membershipStatus} />
                </div>
                <p className="mt-3 text-sm text-steel">{profile?.mobile}</p>
              </Card>
              <Card>
                <CalendarDays className="h-6 w-6 text-gold" />
                <p className="mt-4 text-sm font-semibold text-steel">Current plan</p>
                <h2 className="mt-1 text-2xl font-black">{activeMembership?.planName || 'No active plan'}</h2>
                <p className="mt-1 text-sm text-steel">
                  {activeMembership
                    ? `${shortDate(activeMembership.startDate)} - ${shortDate(activeMembership.expiryDate)}`
                    : 'Ask the front desk to assign a plan.'}
                </p>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Card>
                <h2 className="text-xl font-black">Profile details</h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <InfoRow label="Phone" value={profile?.mobile} />
                  <InfoRow label="Emergency contact" value={profile?.emergencyContact} />
                  <InfoRow label="Gender" value={profile?.gender} />
                  <InfoRow label="DOB" value={shortDate(profile?.dob)} />
                  <InfoRow label="Address" value={profile?.address} />
                </dl>
              </Card>

              <Card>
                <h2 className="text-xl font-black">Membership timeline</h2>
                <div className="mt-5 space-y-3">
                  {(profile?.memberships || []).length ? (
                    [...profile.memberships]
                      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                      .map((membership) => (
                        <div key={membership.id} className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-black">{membership.planName || membership.plan?.name}</p>
                              <p className="mt-1 text-sm text-steel">
                                {shortDate(membership.startDate)} - {shortDate(membership.expiryDate)}
                              </p>
                            </div>
                            <StatusBadge value={membership.status} />
                          </div>
                          <p className="mt-3 text-sm font-semibold">{currency(membership.pricePaid)}</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-steel">No memberships yet.</p>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}

        <Card className="mt-6">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-ember" />
            <h2 className="text-xl font-black">Payment history</h2>
          </div>
          {paymentsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : payments.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs font-bold uppercase tracking-[0.14em] text-steel">
                  <tr>
                    <th className="py-3">Date</th>
                    <th className="py-3">Plan</th>
                    <th className="py-3">Gateway</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="py-4">{shortDate(payment.createdAt)}</td>
                      <td className="py-4">{payment.membership?.planName || payment.membership?.plan?.name || '-'}</td>
                      <td className="py-4">{payment.paymentGateway}</td>
                      <td className="py-4"><StatusBadge value={payment.status} /></td>
                      <td className="py-4 text-right font-black">{currency(payment.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-steel">No payment history yet.</p>
          )}
        </Card>
      </section>
    </main>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 dark:border-white/10">
      <dt className="font-semibold text-steel">{label}</dt>
      <dd className="text-right font-bold">{value || '-'}</dd>
    </div>
  );
}

function getCurrentMembership(memberships = []) {
  const now = new Date();
  return [...memberships]
    .filter((membership) => new Date(membership.expiryDate) >= now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
}
