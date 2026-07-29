import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Ban, CalendarDays, CreditCard, Edit3, Eye, EyeOff, LockKeyhole, Mail, MapPin, MessageCircle, Phone, Plus, RefreshCw, RotateCcw, Search, Trash2, UserRound, X } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { FormModal } from '../../components/common/FormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select } from '../../components/ui/Input';
import { FormActions } from '../../components/forms/FormActions';
import { ImageUploadField } from '../../components/forms/ImageUploadField';
import { MEMBERSHIP_STATUSES } from '../../constants/enums';
import { adminApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { currency, getMemberEmail, getMemberName, shortDate } from '../../utils/format';
import { amountWithGst, calculateGst, MEMBERSHIP_GST_RATE } from '../../utils/tax';
import { useSiteContent } from '../../context/SiteContentContext';

export default function MembersPage() {
  const { gymName } = useSiteContent();
  const [filters, setFilters] = useState({ search: '', status: '', gender: '', expiry: '', sortBy: 'createdAt', sortOrder: 'DESC', page: 1, limit: 10 });
  const [searchText, setSearchText] = useState('');
  const [editing, setEditing] = useState(null);
  const [renewing, setRenewing] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchText.trim();
      const isSearchValid = trimmed.length === 0 || trimmed.length >= 2;
      setFilters((current) => {
        const nextSearch = isSearchValid ? trimmed : '';
        if (current.search === nextSearch) return current;
        return { ...current, search: nextSearch, page: 1 };
      });
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  const { data: plans = [] } = useAsync(() => adminApi.plans(false), []);
  const { data, loading, execute } = useAsync(() => adminApi.members(clean(filters)), [filters]);

  const rows = data?.items || [];
  const meta = data?.meta || {};

  const columns = useMemo(() => [
    { key: 'name', header: 'Member', sortValue: (row) => getMemberName(row), render: (row) => <div><p className="font-bold">{getMemberName(row)}</p><p className="text-xs text-steel">{getMemberEmail(row)}</p></div> },
    { key: 'mobile', header: 'Mobile', sortable: false },
    { key: 'membershipStatus', header: 'Status', sortable: false, render: (row) => <StatusBadge value={row.membershipStatus} /> },
    { key: 'createdAt', header: 'Joined', render: (row) => shortDate(row.createdAt) },
    { key: 'actions', header: 'Actions', render: (row) => (
      <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
        <Button variant="accent" className="!min-h-8 h-8 w-8 px-0" onClick={() => setRenewing(row)} aria-label="Renew membership" title="Renew membership">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
        <Button variant="subtle" className="!min-h-8 h-8 w-8 px-0" onClick={() => { setEditing(row); setOpen(true); }} aria-label="Edit member"><Edit3 className="h-3.5 w-3.5" /></Button>
        <Button variant="dangerSubtle" className="!min-h-8 h-8 w-8 px-0" onClick={() => setDeleting(row)} aria-label="Delete member"><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    ) },
  ], []);

  return (
    <div>
      <PageHeader
        title="Manage Members"
        eyebrow="People"
      >
        Register members, update profiles, assign plans, search, filter, and page through backend results.
      </PageHeader>
      <div className="hidden">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-steel" />
          <Input placeholder="Search name, email, mobile" className="pl-10" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
        </div>
        <Select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
          <option value="">All statuses</option>
          {MEMBERSHIP_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </Select>
        <Select aria-label="Filter by gender" value={filters.gender} onChange={(event) => setFilters((current) => ({ ...current, gender: event.target.value, page: 1 }))}>
          <option value="">All genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </Select>
        <Select aria-label="Filter by membership expiry" value={filters.expiry} onChange={(event) => setFilters((current) => ({ ...current, expiry: event.target.value, page: 1 }))}>
          <option value="">Any expiry date</option>
          <option value="thisWeek">Expiring this week</option>
          <option value="thisMonth">Expiring this month</option>
        </Select>
        <Select aria-label="Sort members" value={`${filters.sortBy}:${filters.sortOrder}`} onChange={(event) => { const [sortBy, sortOrder] = event.target.value.split(':'); setFilters((current) => ({ ...current, sortBy, sortOrder, page: 1 })); }}>
          <option value="createdAt:DESC">Newest joined</option>
          <option value="createdAt:ASC">Oldest joined</option>
          <option value="user.name:ASC">Name A–Z</option>
          <option value="user.name:DESC">Name Z–A</option>
        </Select>
        <Button type="button" variant="subtle" onClick={() => { setSearchText(''); setFilters({ search: '', status: '', gender: '', expiry: '', sortBy: 'createdAt', sortOrder: 'DESC', page: 1, limit: 10 }); }}>
          <X className="h-4 w-4" /> Clear filters
        </Button>
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        emptyTitle="No members found"
        searchValue={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Search name, email, mobile"
        toolbarActions={<Button variant="subtle" className="!min-h-10 border-ember text-ember" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> Add member</Button>}
        filterContent={(
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select aria-label="Filter member status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
              <option value="">All statuses</option>
              {MEMBERSHIP_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </Select>
            <Select aria-label="Filter by gender" value={filters.gender} onChange={(event) => setFilters((current) => ({ ...current, gender: event.target.value, page: 1 }))}>
              <option value="">All genders</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
            </Select>
            <Select aria-label="Filter by membership expiry" value={filters.expiry} onChange={(event) => setFilters((current) => ({ ...current, expiry: event.target.value, page: 1 }))}>
              <option value="">Any expiry date</option><option value="thisWeek">Expiring this week</option><option value="thisMonth">Expiring this month</option>
            </Select>
            <Button type="button" variant="subtle" onClick={() => { setSearchText(''); setFilters({ search: '', status: '', gender: '', expiry: '', sortBy: 'createdAt', sortOrder: 'DESC', page: 1, limit: 10 }); }}><X className="h-4 w-4" /> Clear filters</Button>
          </div>
        )}
        onRowClick={setSelectedMember}
      />
      <div className="mt-4 flex items-center justify-between text-sm text-steel">
        <span>Page {meta.page || 1} of {meta.totalPages || 1} · {meta.total || 0} members</span>
        <div className="flex gap-2">
          <Button variant="subtle" disabled={(meta.page || 1) <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Previous</Button>
          <Button variant="subtle" disabled={(meta.page || 1) >= (meta.totalPages || 1)} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Next</Button>
        </div>
      </div>
      <MemberForm
        open={open}
        member={editing}
        plans={plans}
        onClose={() => setOpen(false)}
        onRenew={() => {
          setOpen(false);
          setRenewing(editing);
        }}
        onSaved={() => { setOpen(false); execute(); }}
      />
      <MemberDetailsDrawer
        member={selectedMember}
        gymName={gymName}
        onClose={() => setSelectedMember(null)}
        onEdit={(memberToEdit) => {
          setSelectedMember(null);
          setEditing(memberToEdit);
          setOpen(true);
        }}
        onRenew={(memberToRenew) => {
          setSelectedMember(null);
          setRenewing(memberToRenew);
        }}
      />
      <RenewPlanModal
        open={Boolean(renewing)}
        member={renewing}
        plans={plans}
        onClose={() => setRenewing(null)}
        onSaved={() => { setRenewing(null); execute(); }}
      />
      <ConfirmModal
        open={Boolean(deleting)}
        title="Remove member?"
        description={`This will soft delete ${getMemberName(deleting)} in the backend.`}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await adminApi.deleteMember(deleting.id); setDeleting(null); execute(); }}
      />
    </div>
  );
}

function MemberDetailsDrawer({ member, gymName, onClose, onEdit, onRenew }) {
  if (!member) return null;

  const memberships = [...(member.memberships || [])].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate),
  );
  const currentMembership = getCurrentMembership(memberships);
  const whatsapp = getMemberWhatsapp(member, gymName);
  const isNoMembership = member.membershipStatus === 'NO_MEMBERSHIP';
  const isExpired = member.membershipStatus === 'EXPIRED';

  return (
    <div className="fixed inset-0 z-50 bg-black/40" role="dialog" aria-modal="true" onClick={onClose}>
      <aside
        className="fixed inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-panel dark:bg-[#181a20] md:inset-x-auto md:bottom-0 md:right-0 md:top-0 md:h-screen md:max-h-none md:w-[440px] md:rounded-none md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-4">
            {member.profileImage ? (
              <img
                src={member.profileImage}
                alt={getMemberName(member)}
                className="h-20 w-20 shrink-0 rounded-xl object-cover shadow-panel ring-4 ring-slate-100 dark:ring-white/10"
              />
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 ring-4 ring-slate-50 dark:bg-white/10 dark:text-slate-300 dark:ring-white/5">
                <UserRound className="h-9 w-9" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Member details</p>
              <h2 className="mt-1 break-words text-2xl font-black">{getMemberName(member)}</h2>
              <p className="mt-1 break-words text-sm text-steel">{getMemberEmail(member)}</p>
            </div>
          </div>
          <Button variant="ghost" className="!min-h-8 h-8 w-8 px-0" onClick={onClose} aria-label="Close details">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <StatusBadge value={member.membershipStatus} />
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
            Joined {shortDate(member.createdAt)}
          </span>
        </div>

        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-steel">Contact & personal details</p>
        <div className="mt-2 divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
          <DetailItem icon={Phone} label="Mobile" value={member.mobile} />
          <DetailItem icon={Mail} label="Email" value={getMemberEmail(member)} />
          <DetailItem icon={UserRound} label="Gender" value={member.gender} />
          <DetailItem icon={CalendarDays} label="DOB" value={shortDate(member.dob)} />
          <DetailItem icon={Phone} label="Emergency contact" value={member.emergencyContact} />
          <DetailItem icon={MapPin} label="Address" value={member.address} className="sm:col-span-2" />
        </div>

        <div className={`mt-6 border-l-2 py-1 pl-4 ${isNoMembership ? 'border-amber-400' : isExpired ? 'border-red-400' : 'border-emerald-400'}`}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-steel">Membership snapshot</p>
          <h3 className="mt-2 text-lg font-black">{currentMembership?.planName || currentMembership?.plan?.name || 'No active plan'}</h3>
          <p className="mt-1 text-sm text-steel">
            {currentMembership
              ? `${shortDate(currentMembership.startDate)} - ${shortDate(currentMembership.expiryDate)}`
              : 'Renew or add a plan for this member.'}
          </p>
          {currentMembership ? (
            <p className="mt-3 text-sm font-bold">{currency(currentMembership.pricePaid)}</p>
          ) : null}
        </div>

        <WhatsappComposer whatsapp={whatsapp} status={member.membershipStatus} />

        <div className="mt-6">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-steel">Membership history</h3>
          <div className="mt-2 divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
            {memberships.length ? (
              memberships.map((membership) => (
                <div key={membership.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{membership.planName || membership.plan?.name}</p>
                      <p className="mt-1 text-xs text-steel">
                        {shortDate(membership.startDate)} - {shortDate(membership.expiryDate)}
                      </p>
                    </div>
                    <StatusBadge value={membership.status} />
                  </div>
                  <p className="mt-2 text-sm font-semibold">{currency(membership.pricePaid)}</p>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-steel">
                No membership history yet.
              </p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 mt-6 grid grid-cols-2 gap-3 border-t border-slate-200 bg-white/95 pt-4 backdrop-blur dark:border-white/10 dark:bg-[#181a20]/95">
          <Button variant="accent" className="flex-1" onClick={() => onRenew(member)}>
            <CreditCard className="h-4 w-4" />
            {isNoMembership ? 'Add plan' : 'Renew'}
          </Button>
          <Button variant="subtle" className="flex-1" onClick={() => onEdit(member)}>
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </aside>
    </div>
  );
}

function WhatsappComposer({ whatsapp, status }) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(whatsapp.message);

  useEffect(() => {
    setMessage(whatsapp.message);
    setEditing(false);
  }, [whatsapp.message]);

  const actionLabel = status === 'NO_MEMBERSHIP'
    ? 'Share membership invitation'
    : status === 'EXPIRED'
      ? 'Send renewal reminder'
      : 'Message on WhatsApp';
  const href = `https://wa.me/${whatsapp.phone}?text=${encodeURIComponent(message.trim())}`;

  return (
    <section className="mt-6 border-y border-slate-200 py-4 dark:border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          <h3 className="text-xs font-black uppercase tracking-[0.16em] text-steel">WhatsApp message</h3>
        </div>
        <button type="button" onClick={() => setEditing((current) => !current)} className="inline-flex items-center gap-1.5 text-xs font-bold text-ember transition hover:text-[#e94325]">
          <Edit3 className="h-3.5 w-3.5" /> {editing ? 'Done' : 'Edit message'}
        </button>
      </div>

      {editing ? (
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={6}
          className="mt-3 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 outline-none transition focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/10 dark:border-white/10 dark:bg-white/[0.04]"
          aria-label="WhatsApp message"
        />
      ) : (
        <p className="mt-3 text-sm leading-6 text-steel">{message}</p>
      )}

      <a href={href} target="_blank" rel="noreferrer" className={`mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-black text-[#07170d] transition hover:-translate-y-0.5 hover:bg-[#54e685] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 ${message.trim() ? '' : 'pointer-events-none opacity-50'}`}>
        <MessageCircle className="h-4 w-4" /> {actionLabel}
      </a>
    </section>
  );
}

function DetailItem({ icon: Icon, label, value, className = '' }) {
  return (
    <div className={`grid min-w-0 grid-cols-[1fr_1.4fr] items-center gap-4 py-3 ${className}`}>
      <div className="flex items-center gap-2 text-steel">
        <Icon className="h-4 w-4 shrink-0 text-ember" />
        <p className="text-xs font-bold uppercase tracking-[0.12em]">{label}</p>
      </div>
      <p className="min-w-0 break-words text-sm font-semibold">{value || '-'}</p>
    </div>
  );
}

function getMemberWhatsapp(member, gymName) {
  const name = getMemberName(member).split(' ')[0];
  const status = member.membershipStatus;
  let message;

  if (status === 'NO_MEMBERSHIP') {
    message = `Hi ${name}! 👋 This is the team at ${gymName}. We would love to help you begin your fitness journey. We have membership plans designed for different goals and schedules. Would you like us to share the best options for you?`;
  } else if (status === 'EXPIRED') {
    message = `Hi ${name}! 👋 Your membership at ${gymName} has expired. We would love to welcome you back and help you keep your fitness momentum going. Reply to this message and we will help you renew your membership.`;
  } else if (status === 'UPCOMING') {
    message = `Hi ${name}! 👋 Your membership at ${gymName} is scheduled to begin soon. Let us know if you need any help before your first session—we are excited to have you with us!`;
  } else if (status === 'CANCELLED') {
    message = `Hi ${name}, this is the team at ${gymName}. We noticed your membership was cancelled. If you would like to restart your fitness journey, reply here and we will be happy to help.`;
  } else {
    message = `Hi ${name}! 👋 This is the team at ${gymName}. We are checking in to see how your training is going. Let us know if there is anything we can help you with.`;
  }

  let digits = String(member.mobile || '').replace(/\D/g, '');
  if (digits.length === 10) digits = `91${digits}`;
  else if (digits.length === 11 && digits.startsWith('0')) digits = `91${digits.slice(1)}`;

  return {
    message,
    phone: digits,
  };
}

function getCurrentMembership(memberships = []) {
  const active = memberships.find((membership) => membership.status === 'ACTIVE');
  const upcoming = memberships
    .filter((membership) => membership.status === 'UPCOMING')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
  return active || upcoming || getRelevantMembership(memberships);
}

function RenewPlanModal({ open, member, plans, onClose, onSaved }) {
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const { register, handleSubmit, formState, watch, reset } = useForm({
    values: {
      planId: '',
    },
  });
  const planId = watch('planId');
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === planId),
    [planId, plans],
  );
  const planAmount = Number(selectedPlan?.price || 0);
  const discountAmount = calculateDiscount(coupon, planAmount);
  const payableAmount = Math.max(planAmount - discountAmount, 0);
  const gstAmount = calculateGst(payableAmount);
  const totalPayable = amountWithGst(payableAmount);

  useEffect(() => {
    setCouponCode('');
    setCoupon(null);
    setCouponError('');
  }, [planId]);

  const applyCoupon = async () => {
    const code = couponCode.trim();
    setCouponError('');

    if (!selectedPlan) {
      setCouponError('Select a membership plan first.');
      return;
    }

    if (!code) {
      setCouponError('Enter a coupon code.');
      return;
    }

    setCouponLoading(true);
    try {
      const validatedCoupon = await adminApi.validateCoupon(code, planAmount);
      setCoupon(validatedCoupon);
    } catch (error) {
      setCoupon(null);
      setCouponError(error.message || 'Coupon could not be applied.');
    } finally {
      setCouponLoading(false);
    }
  };

  const submit = async (values) => {
    await adminApi.createPayment({
      memberId: member.id,
      planId: values.planId,
      amount: payableAmount,
      status: 'COMPLETED',
      paymentGateway: 'CASH',
      transactionId: coupon
        ? `RENEW-${coupon.code}-${Date.now()}`
        : `RENEW-${Date.now()}`,
    });

    reset();
    setCouponCode('');
    setCoupon(null);
    setCouponError('');
    onSaved();
  };

  return (
    <FormModal open={open} title={`Renew / Add Plan - ${getMemberName(member)}`} onClose={onClose}>
      <form onSubmit={handleSubmit(submit)} className="grid gap-4">
        <Field label="Membership plan" error={formState.errors.planId?.message}>
          <Select {...register('planId', { required: 'Select a membership plan' })}>
            <option value="">Select plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} - {currency(plan.price)}
              </option>
            ))}
          </Select>
        </Field>

        {selectedPlan ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedPlan.name}</p>
                <p className="mt-1 text-xs text-steel">{selectedPlan.duration} days membership</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-steel">Plan amount</p>
                <p className="text-2xl font-black">{currency(planAmount)}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <Field label="Coupon code">
                <Input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="SUMMER50"
                />
              </Field>
              <Button
                type="button"
                variant="subtle"
                className="self-end"
                onClick={applyCoupon}
                disabled={couponLoading}
              >
                {couponLoading ? 'Applying...' : 'Apply'}
              </Button>
            </div>

            {couponError ? <p className="mt-2 text-sm font-semibold text-red-600">{couponError}</p> : null}
            {coupon ? (
              <p className="mt-2 text-sm font-semibold text-emerald-600">
                Coupon {coupon.code} applied. Discount: {currency(discountAmount)}
              </p>
            ) : null}

            <div className="mt-4 grid gap-3 rounded-lg bg-white p-4 text-sm dark:bg-white/5 sm:grid-cols-2 md:grid-cols-4">
              <Summary label="Amount" value={currency(planAmount)} />
              <Summary label="Discount" value={`- ${currency(discountAmount)}`} />
              <Summary label={`GST (${MEMBERSHIP_GST_RATE}%)`} value={currency(gstAmount)} />
              <Summary label="Total payable" value={currency(totalPayable)} strong />
            </div>
          </div>
        ) : null}

        <FormActions isSubmitting={formState.isSubmitting} onCancel={onClose} submitLabel="Renew membership" />
      </form>
    </FormModal>
  );
}

function MemberForm({ open, member, plans, onClose, onRenew, onSaved }) {
  const [showPassword, setShowPassword] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [membershipAction, setMembershipAction] = useState('');
  const [pendingValues, setPendingValues] = useState(null);
  const [actionSaving, setActionSaving] = useState(false);
  const { register, handleSubmit, formState, reset, watch, setValue } = useForm({
    values: {
      name: getMemberName(member) === 'Unknown member' ? '' : getMemberName(member),
      email: getMemberEmail(member) === '-' ? '' : getMemberEmail(member),
      password: '',
      mobile: member?.mobile || '',
      emergencyContact: member?.emergencyContact || '',
      address: member?.address || '',
      dob: member?.dob ? String(member.dob).slice(0, 10) : '',
      gender: member?.gender || '',
      activePlanId: '',
      profileImage: member?.profileImage || '',
    },
  });
  const activePlanId = watch('activePlanId');
  const profileImage = watch('profileImage');
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === activePlanId),
    [activePlanId, plans],
  );
  const planAmount = Number(selectedPlan?.price || 0);
  const discountAmount = calculateDiscount(coupon, planAmount);
  const payableAmount = Math.max(planAmount - discountAmount, 0);
  const gstAmount = calculateGst(payableAmount);
  const totalPayable = amountWithGst(payableAmount);
  const currentMembership = useMemo(
    () => getRelevantMembership(member?.memberships || []),
    [member],
  );
  const canReactivate = Boolean(
    currentMembership &&
    currentMembership.status === 'CANCELLED' &&
    isDateCurrentOrFuture(currentMembership.expiryDate),
  );

  useEffect(() => {
    setCouponCode('');
    setCoupon(null);
    setCouponError('');
  }, [activePlanId]);

  useEffect(() => {
    setMembershipAction('');
    setPendingValues(null);
  }, [member?.id, open]);

  const applyCoupon = async () => {
    const code = couponCode.trim();
    setCouponError('');

    if (!selectedPlan) {
      setCouponError('Select a membership plan first.');
      return;
    }

    if (!code) {
      setCouponError('Enter a coupon code.');
      return;
    }

    setCouponLoading(true);
    try {
      const validatedCoupon = await adminApi.validateCoupon(code, planAmount);
      setCoupon(validatedCoupon);
    } catch (error) {
      setCoupon(null);
      setCouponError(error.message || 'Coupon could not be applied.');
    } finally {
      setCouponLoading(false);
    }
  };

  const persistMember = async (values) => {
    const payload = clean(values);
    const selectedPlanId = payload.activePlanId;
    delete payload.activePlanId;

    if (member && !payload.password) delete payload.password;

    const savedMember = member
      ? await adminApi.updateMember(member.id, payload)
      : await adminApi.createMember(payload);

    if (selectedPlanId) {
      await adminApi.createPayment({
        memberId: savedMember?.id || member.id,
        planId: selectedPlanId,
        amount: payableAmount,
        status: 'COMPLETED',
        paymentGateway: 'CASH',
        transactionId: coupon
          ? `COUPON-${coupon.code}-${Date.now()}`
          : `ONBOARD-${Date.now()}`,
      });
    }

    if (member && membershipAction) {
      await adminApi.changeMemberAccess(member.id, membershipAction);
    }

    reset();
    setCouponCode('');
    setCoupon(null);
    setCouponError('');
    onSaved();
  };

  const submit = async (values) => {
    if (member && membershipAction) {
      setPendingValues(values);
      return;
    }
    await persistMember(values);
  };

  const confirmMembershipAction = async () => {
    if (!pendingValues) return;
    setActionSaving(true);
    try {
      await persistMember(pendingValues);
      setPendingValues(null);
    } finally {
      setActionSaving(false);
    }
  };

  return (
    <>
    <FormModal open={open} title={member ? 'Edit member' : 'Add member'} onClose={onClose}>
      <form onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-2">
        <Field label="Name" error={formState.errors.name?.message}><Input {...register('name', { required: 'Name is required' })} /></Field>
        <Field label="Email" error={formState.errors.email?.message}><Input type="email" {...register('email', { required: 'Email is required' })} /></Field>
        <Field label={member ? 'New password (optional)' : 'Password'} error={formState.errors.password?.message}>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              className="pr-11"
              placeholder={member ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
              {...register('password', {
                required: member ? false : 'Password is required',
                validate: (value) => !value || value.length >= 6 || 'Minimum 6 characters',
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-steel transition hover:text-ember focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ember"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <Field label="Mobile" error={formState.errors.mobile?.message}>
          <Input
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            {...register('mobile', {
              required: 'Mobile is required',
              pattern: {
                value: /^\d{10}$/,
                message: 'Mobile number must be exactly 10 digits',
              },
            })}
          />
        </Field>
        <Field label="Emergency contact" error={formState.errors.emergencyContact?.message}>
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '').slice(0, 10); }}
            {...register('emergencyContact', {
              pattern: {
                value: /^\d{10}$/,
                message: 'Emergency contact must be exactly 10 digits',
              },
            })}
          />
        </Field>
        <Field label="DOB"><Input type="date" {...register('dob')} /></Field>
        <Field label="Gender">
          <Select {...register('gender')}>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
        </Field>
        {!member ? <Field label="Assign plan"><Select {...register('activePlanId')}><option value="">No plan</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</Select></Field> : null}
        <ImageUploadField
          label="Profile image"
          value={profileImage}
          onChange={(url) => setValue('profileImage', url, { shouldDirty: true })}
        />
        <Field label="Address"><Input {...register('address')} /></Field>
        {member ? (
          <MembershipAccessPanel
            member={member}
            membership={currentMembership}
            action={membershipAction}
            canReactivate={canReactivate}
            onActionChange={setMembershipAction}
            onRenew={onRenew}
          />
        ) : null}
        {selectedPlan ? (
          <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedPlan.name}</p>
                <p className="mt-1 text-xs text-steel">{selectedPlan.duration} days membership</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-steel">Plan amount</p>
                <p className="text-2xl font-black">{currency(planAmount)}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <Field label="Coupon code">
                <Input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="SUMMER50"
                />
              </Field>
              <Button
                type="button"
                variant="subtle"
                className="self-end"
                onClick={applyCoupon}
                disabled={couponLoading}
              >
                {couponLoading ? 'Applying...' : 'Apply'}
              </Button>
            </div>

            {couponError ? <p className="mt-2 text-sm font-semibold text-red-600">{couponError}</p> : null}
            {coupon ? (
              <p className="mt-2 text-sm font-semibold text-emerald-600">
                Coupon {coupon.code} applied. Discount: {currency(discountAmount)}
              </p>
            ) : null}

            <div className="mt-4 grid gap-3 rounded-lg bg-white p-4 text-sm dark:bg-white/5 sm:grid-cols-2 md:grid-cols-4">
              <Summary label="Amount" value={currency(planAmount)} />
              <Summary label="Discount" value={`- ${currency(discountAmount)}`} />
              <Summary label={`GST (${MEMBERSHIP_GST_RATE}%)`} value={currency(gstAmount)} />
              <Summary label="Total payable" value={currency(totalPayable)} strong />
            </div>
          </div>
        ) : null}
        <div className="md:col-span-2"><FormActions isSubmitting={formState.isSubmitting || actionSaving} onCancel={onClose} submitLabel={member ? 'Update member' : 'Create member'} /></div>
      </form>
    </FormModal>
    <ConfirmModal
      open={Boolean(pendingValues)}
      title={membershipAction === 'CANCEL' ? 'Cancel membership access?' : 'Reactivate membership access?'}
      description={membershipAction === 'CANCEL'
        ? 'The member will lose current and queued gym access. Their profile and payment history will be preserved.'
        : 'The membership will be restored using its existing start and expiry dates.'}
      confirmLabel={membershipAction === 'CANCEL' ? 'Cancel membership' : 'Reactivate'}
      confirmVariant={membershipAction === 'CANCEL' ? 'danger' : 'accent'}
      confirming={actionSaving}
      onClose={() => setPendingValues(null)}
      onConfirm={confirmMembershipAction}
    />
    </>
  );
}

function MembershipAccessPanel({ member, membership, action, canReactivate, onActionChange, onRenew }) {
  const status = member.membershipStatus;
  const planName = membership?.planName || membership?.plan?.name || 'No plan assigned';
  const canCancel = status === 'ACTIVE' || status === 'UPCOMING';
  const needsRenewal = status === 'NO_MEMBERSHIP' || status === 'EXPIRED' || (status === 'CANCELLED' && !canReactivate);

  return (
    <section className="md:col-span-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-steel">Current membership</p>
          <p className="mt-1 text-lg font-black">{planName}</p>
        </div>
        <StatusBadge value={status} />
      </div>

      <div className="p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Summary label="Plan" value={planName} />
          <Summary label="Start date" value={membership ? shortDate(membership.startDate) : '-'} />
          <Summary label="Expiry date" value={membership ? shortDate(membership.expiryDate) : '-'} />
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-white p-3 text-xs leading-5 text-steel dark:bg-white/5">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
          <p><strong className="text-slate-700 dark:text-slate-200">Status is date-controlled.</strong> Upcoming and expired states are calculated automatically. Admins can only cancel valid access or reactivate a cancelled membership that has not expired.</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {canCancel ? (
            <Button
              type="button"
              variant={action === 'CANCEL' ? 'danger' : 'dangerSubtle'}
              onClick={() => onActionChange(action === 'CANCEL' ? '' : 'CANCEL')}
            >
              <Ban className="h-4 w-4" /> {action === 'CANCEL' ? 'Cancellation selected' : 'Cancel membership'}
            </Button>
          ) : null}
          {status === 'CANCELLED' && canReactivate ? (
            <Button
              type="button"
              variant={action === 'REACTIVATE' ? 'accent' : 'subtle'}
              onClick={() => onActionChange(action === 'REACTIVATE' ? '' : 'REACTIVATE')}
            >
              <RotateCcw className="h-4 w-4" /> {action === 'REACTIVATE' ? 'Reactivation selected' : 'Reactivate membership'}
            </Button>
          ) : null}
          {needsRenewal ? (
            <Button type="button" variant="accent" onClick={onRenew}>
              <RefreshCw className="h-4 w-4" /> {status === 'NO_MEMBERSHIP' ? 'Add membership' : 'Renew membership'}
            </Button>
          ) : null}
          {action ? <p className="text-xs font-semibold text-steel">Save the form to review and confirm this access change.</p> : null}
        </div>
      </div>
    </section>
  );
}

function getRelevantMembership(memberships = []) {
  const ordered = [...memberships].sort(
    (a, b) => new Date(b.expiryDate) - new Date(a.expiryDate),
  );
  return ordered.find((membership) => membership.status === 'ACTIVE')
    || ordered.find((membership) => membership.status === 'UPCOMING')
    || ordered[0];
}

function isDateCurrentOrFuture(value) {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(value).getTime() >= today.getTime();
}

function Summary({ label, value, strong }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel">{label}</p>
      <p className={`mt-1 ${strong ? 'text-xl font-black text-ember' : 'font-bold'}`}>{value}</p>
    </div>
  );
}

function calculateDiscount(coupon, amount) {
  if (!coupon || !amount) return 0;
  const value = Number(coupon.value || 0);
  if (coupon.type === 'PERCENTAGE') {
    return Math.min(amount, (amount * value) / 100);
  }
  return Math.min(amount, value);
}

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== '' && value !== undefined && value !== null));
}
