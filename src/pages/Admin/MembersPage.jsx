import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarDays, CreditCard, Edit3, Mail, MapPin, Phone, Plus, Search, Trash2, UserRound, X } from 'lucide-react';
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

export default function MembersPage() {
  const [filters, setFilters] = useState({ search: '', status: '', page: 1, limit: 10 });
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
    { key: 'name', header: 'Member', render: (row) => <div><p className="font-bold">{getMemberName(row)}</p><p className="text-xs text-steel">{getMemberEmail(row)}</p></div> },
    { key: 'mobile', header: 'Mobile' },
    { key: 'membershipStatus', header: 'Status', render: (row) => <StatusBadge value={row.membershipStatus} /> },
    { key: 'createdAt', header: 'Joined', render: (row) => shortDate(row.createdAt) },
    { key: 'actions', header: 'Actions', render: (row) => (
      <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
        <Button variant="accent" className="!min-h-8 h-8 px-3 text-xs" onClick={() => setRenewing(row)} aria-label="Renew membership">
          <CreditCard className="h-3.5 w-3.5" />
          Renew
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
        actions={<Button variant="accent" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-5 w-5" /> Add member</Button>}
      >
        Register members, update profiles, assign plans, search, filter, and page through backend results.
      </PageHeader>
      <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04] md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-steel" />
          <Input placeholder="Search name, email, mobile" className="pl-10" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
        </div>
        <Select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
          <option value="">All statuses</option>
          {MEMBERSHIP_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </Select>
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        emptyTitle="No members found"
        onRowClick={setSelectedMember}
      />
      <div className="mt-4 flex items-center justify-between text-sm text-steel">
        <span>Page {meta.page || 1} of {meta.totalPages || 1} · {meta.total || 0} members</span>
        <div className="flex gap-2">
          <Button variant="subtle" disabled={(meta.page || 1) <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Previous</Button>
          <Button variant="subtle" disabled={(meta.page || 1) >= (meta.totalPages || 1)} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Next</Button>
        </div>
      </div>
      <MemberForm open={open} member={editing} plans={plans} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); execute(); }} />
      <MemberDetailsDrawer
        member={selectedMember}
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

function MemberDetailsDrawer({ member, onClose, onEdit, onRenew }) {
  if (!member) return null;

  const memberships = [...(member.memberships || [])].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate),
  );
  const currentMembership = getCurrentMembership(memberships);

  return (
    <div className="fixed inset-0 z-50 bg-black/40" role="dialog" aria-modal="true" onClick={onClose}>
      <aside
        className="fixed inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-lg bg-white p-5 shadow-panel dark:bg-[#181a20] md:inset-x-auto md:bottom-0 md:right-0 md:top-0 md:h-screen md:max-h-none md:w-[420px] md:rounded-none md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-4">
            {member.profileImage ? (
              <img
                src={member.profileImage}
                alt={getMemberName(member)}
                className="h-20 w-20 shrink-0 rounded-lg object-cover shadow-panel"
              />
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
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

        <div className="mt-5 grid gap-3">
          <DetailItem icon={Phone} label="Mobile" value={member.mobile} />
          <DetailItem icon={Mail} label="Email" value={getMemberEmail(member)} />
          <DetailItem icon={UserRound} label="Gender" value={member.gender} />
          <DetailItem icon={CalendarDays} label="DOB" value={shortDate(member.dob)} />
          <DetailItem icon={Phone} label="Emergency contact" value={member.emergencyContact} />
          <DetailItem icon={MapPin} label="Address" value={member.address} />
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-steel">Current plan</p>
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

        <div className="mt-6">
          <h3 className="text-base font-black">Membership history</h3>
          <div className="mt-3 space-y-3">
            {memberships.length ? (
              memberships.map((membership) => (
                <div key={membership.id} className="rounded-lg border border-slate-200 p-3 dark:border-white/10">
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
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-steel dark:border-white/10">
                No membership history yet.
              </p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 mt-6 flex gap-3 bg-white pt-4 dark:bg-[#181a20]">
          <Button variant="accent" className="flex-1" onClick={() => onRenew(member)}>
            <CreditCard className="h-4 w-4" />
            Renew
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

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 p-3 dark:border-white/10">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold">{value || '-'}</p>
      </div>
    </div>
  );
}

function getCurrentMembership(memberships = []) {
  const now = new Date();
  return memberships
    .filter((membership) => new Date(membership.expiryDate) >= now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
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

            <div className="mt-4 grid gap-3 rounded-lg bg-white p-4 text-sm dark:bg-white/5 md:grid-cols-3">
              <Summary label="Amount" value={currency(planAmount)} />
              <Summary label="Discount" value={`- ${currency(discountAmount)}`} />
              <Summary label="Payable" value={currency(payableAmount)} strong />
            </div>
          </div>
        ) : null}

        <FormActions isSubmitting={formState.isSubmitting} onCancel={onClose} submitLabel="Renew membership" />
      </form>
    </FormModal>
  );
}

function MemberForm({ open, member, plans, onClose, onSaved }) {
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
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

  useEffect(() => {
    setCouponCode('');
    setCoupon(null);
    setCouponError('');
  }, [activePlanId]);

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

    reset();
    setCouponCode('');
    setCoupon(null);
    setCouponError('');
    onSaved();
  };

  return (
    <FormModal open={open} title={member ? 'Edit member' : 'Add member'} onClose={onClose}>
      <form onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-2">
        <Field label="Name" error={formState.errors.name?.message}><Input {...register('name', { required: 'Name is required' })} /></Field>
        <Field label="Email" error={formState.errors.email?.message}><Input type="email" {...register('email', { required: 'Email is required' })} /></Field>
        <Field label={member ? 'New password' : 'Password'} error={formState.errors.password?.message}><Input type="password" {...register('password', member ? {} : { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })} /></Field>
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
        <Field label="Emergency contact"><Input {...register('emergencyContact')} /></Field>
        <Field label="DOB"><Input type="date" {...register('dob')} /></Field>
        <Field label="Gender">
          <Select {...register('gender')}>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
        </Field>
        <Field label="Assign plan"><Select {...register('activePlanId')}><option value="">No new plan</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</Select></Field>
        <ImageUploadField
          label="Profile image"
          value={profileImage}
          onChange={(url) => setValue('profileImage', url, { shouldDirty: true })}
        />
        <Field label="Address"><Input {...register('address')} /></Field>
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

            <div className="mt-4 grid gap-3 rounded-lg bg-white p-4 text-sm dark:bg-white/5 md:grid-cols-3">
              <Summary label="Amount" value={currency(planAmount)} />
              <Summary label="Discount" value={`- ${currency(discountAmount)}`} />
              <Summary label="Payable" value={currency(payableAmount)} strong />
            </div>
          </div>
        ) : null}
        <div className="md:col-span-2"><FormActions isSubmitting={formState.isSubmitting} onCancel={onClose} submitLabel={member ? 'Update member' : 'Create member'} /></div>
      </form>
    </FormModal>
  );
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
