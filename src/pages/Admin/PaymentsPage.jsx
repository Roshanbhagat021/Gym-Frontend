import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit3, Plus, Search, X } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { FormModal } from '../../components/common/FormModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select } from '../../components/ui/Input';
import { FormActions } from '../../components/forms/FormActions';
import { PAYMENT_STATUSES } from '../../constants/enums';
import { adminApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { currency, getMemberName, shortDate } from '../../utils/format';
import { amountWithGst, calculateGst, MEMBERSHIP_GST_RATE } from '../../utils/tax';

export default function PaymentsPage() {
  const [filters, setFilters] = useState({ search: '', status: '', method: '', period: '' });
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { data: payments = [], loading, execute } = useAsync(() => adminApi.payments(clean(filters)), [filters]);
  const { data: members = [] } = useAsync(adminApi.membersBasic, []);
  const { data: plans = [] } = useAsync(() => adminApi.plans(false), []);
  return (
    <div>
      <PageHeader title="Payments" eyebrow="Billing">
        Completed payments can trigger membership purchase when a plan is selected.
      </PageHeader>
      <div className="hidden">
        <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-steel" /><Input className="pl-10" placeholder="Search member or transaction" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} /></div>
        <Select aria-label="Filter payment status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">All statuses</option>{PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</Select>
        <Select aria-label="Filter payment method" value={filters.method} onChange={(event) => setFilters((current) => ({ ...current, method: event.target.value }))}><option value="">All methods</option><option value="CASH">Cash</option><option value="ONLINE">Online</option></Select>
        <Select aria-label="Filter payment period" value={filters.period} onChange={(event) => setFilters((current) => ({ ...current, period: event.target.value }))}><option value="">All dates</option><option value="thisWeek">This week</option><option value="thisMonth">This month</option><option value="thisYear">This year</option></Select>
        <Button type="button" variant="subtle" onClick={() => setFilters({ search: '', status: '', method: '', period: '' })}><X className="h-4 w-4" /> Clear filters</Button>
      </div>
      <DataTable searchValue={filters.search} onSearchChange={(search) => setFilters((current) => ({ ...current, search }))} searchPlaceholder="Search member or transaction" toolbarActions={<Button variant="subtle" className="!min-h-10 border-ember text-ember" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> Record payment</Button>} filterContent={<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Select aria-label="Filter payment status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">All statuses</option>{PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</Select><Select aria-label="Filter payment method" value={filters.method} onChange={(event) => setFilters((current) => ({ ...current, method: event.target.value }))}><option value="">All methods</option><option value="CASH">Cash</option><option value="ONLINE">Online</option></Select><Select aria-label="Filter payment period" value={filters.period} onChange={(event) => setFilters((current) => ({ ...current, period: event.target.value }))}><option value="">All dates</option><option value="thisWeek">This week</option><option value="thisMonth">This month</option><option value="thisYear">This year</option></Select><Button type="button" variant="subtle" onClick={() => setFilters({ search: '', status: '', method: '', period: '' })}><X className="h-4 w-4" /> Clear filters</Button></div>} rows={payments} loading={loading} emptyTitle="No payments recorded" columns={[
        { key: 'member', header: 'Member', sortValue: (row) => getMemberName(row.member), render: (row) => getMemberName(row.member) },
        { key: 'amount', header: 'Amount', render: (row) => currency(row.amount) },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        { key: 'paymentGateway', header: 'Method', render: (row) => row.paymentGateway === 'CASH' ? 'Cash' : 'Online' },
        { key: 'createdAt', header: 'Date', render: (row) => shortDate(row.createdAt) },
        { key: 'actions', header: 'Actions', render: (row) => <Button variant="subtle" className="!min-h-8 h-8 w-8 px-0" onClick={() => { setEditing(row); setOpen(true); }}><Edit3 className="h-3.5 w-3.5" /></Button> },
      ]} />
      <PaymentForm open={open} payment={editing} members={members} plans={plans} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); execute(); }} />
    </div>
  );
}

function PaymentForm({ open, payment, members, plans, onClose, onSaved }) {
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const { register, handleSubmit, formState, watch, setValue } = useForm({ values: {
    memberId: payment?.member?.id || '',
    amount: payment?.amount || '',
    status: payment?.status || 'PENDING',
    transactionId: payment?.transactionId || '',
    paymentGateway: payment ? (payment.paymentGateway === 'CASH' ? 'CASH' : 'RAZORPAY') : 'CASH',
    planId: '',
  } });
  const planId = watch('planId');
  const selectedPlan = plans.find((plan) => plan.id === planId);
  const planAmount = Number(selectedPlan?.price || 0);
  const discountAmount = calculateDiscount(coupon, planAmount);
  const taxableAmount = Math.max(planAmount - discountAmount, 0);
  const gstAmount = calculateGst(taxableAmount);
  const totalAmount = amountWithGst(taxableAmount);

  useEffect(() => {
    if (selectedPlan && !payment) setValue('amount', planAmount, { shouldValidate: true });
    setCouponCode('');
    setCoupon(null);
    setCouponError('');
  }, [planId, planAmount, payment, selectedPlan, setValue]);

  const applyCoupon = async () => {
    const code = couponCode.trim();
    setCouponError('');
    if (!selectedPlan) return setCouponError('Select a plan before applying a coupon.');
    if (!code) return setCouponError('Enter a coupon code.');
    setCouponLoading(true);
    try {
      const validated = await adminApi.validateCoupon(code, planAmount);
      const discount = calculateDiscount(validated, planAmount);
      setCoupon(validated);
      setValue('amount', Math.max(planAmount - discount, 0), { shouldValidate: true, shouldDirty: true });
    } catch (error) {
      setCoupon(null);
      setValue('amount', planAmount, { shouldValidate: true });
      setCouponError(error.message || 'Coupon could not be applied.');
    } finally {
      setCouponLoading(false);
    }
  };
  const submit = async (values) => {
    const payload = Object.fromEntries(Object.entries({ ...values, amount: Number(values.amount) }).filter(([, value]) => value !== ''));
    if (payment) await adminApi.updatePayment(payment.id, payload);
    else await adminApi.createPayment(payload);
    onSaved();
  };
  return <FormModal open={open} title={payment ? 'Edit payment' : 'Record payment'} onClose={onClose}>
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-2">
      <Field label="Member"><Select disabled={Boolean(payment)} className={payment ? 'cursor-not-allowed bg-slate-100 opacity-75 dark:bg-white/5' : ''} {...register('memberId', { required: true })}><option value="">Select member</option>{members.map((member) => <option key={member.id} value={member.id}>{getMemberName(member)}</option>)}</Select>{payment && <p className="mt-1 text-xs text-steel">The member cannot be changed after a payment is recorded.</p>}</Field>
      <Field label="Plan to activate"><Select {...register('planId')}><option value="">No plan</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} — {currency(plan.price)}</option>)}</Select></Field>
      <Field label={selectedPlan && !payment ? 'Taxable amount' : 'Amount'}><Input type="number" min="0" step="0.01" readOnly={Boolean(selectedPlan && !payment)} className={selectedPlan && !payment ? 'bg-slate-100 dark:bg-white/5' : ''} {...register('amount', { required: true })} /></Field>
      <Field label="Method"><Select {...register('paymentGateway')}><option value="CASH">Cash</option><option value="RAZORPAY">Online</option></Select></Field>
      {!payment && selectedPlan && <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="mb-2 text-sm font-bold">Have a coupon?</p>
        <div className="flex gap-2"><Input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Enter coupon code" disabled={Boolean(coupon)} /><Button type="button" variant="subtle" onClick={coupon ? () => { setCoupon(null); setCouponCode(''); setValue('amount', planAmount); } : applyCoupon} disabled={couponLoading}>{couponLoading ? 'Checking…' : coupon ? 'Remove' : 'Apply'}</Button></div>
        {couponError && <p className="mt-2 text-xs font-semibold text-red-500">{couponError}</p>}
        {coupon && <div className="mt-3 grid grid-cols-3 gap-3 rounded-md bg-white p-3 text-sm dark:bg-white/5"><div><p className="text-xs text-steel">Plan price</p><p className="font-bold">{currency(planAmount)}</p></div><div><p className="text-xs text-steel">Discount</p><p className="font-bold text-mint">− {currency(discountAmount)}</p></div><div><p className="text-xs text-steel">Payable</p><p className="font-black text-ember">{currency(Math.max(planAmount - discountAmount, 0))}</p></div></div>}
      </div>}
      {!payment && selectedPlan && <div className="md:col-span-2 grid grid-cols-3 gap-3 rounded-lg border border-ember/15 bg-ember/[0.04] p-4 text-sm"><div><p className="text-xs text-steel">After discount</p><p className="font-bold">{currency(taxableAmount)}</p></div><div><p className="text-xs text-steel">GST ({MEMBERSHIP_GST_RATE}%)</p><p className="font-bold">{currency(gstAmount)}</p></div><div><p className="text-xs text-steel">Total payable</p><p className="font-black text-ember">{currency(totalAmount)}</p></div></div>}
      <Field label="Status"><Select {...register('status')}>{PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</Select></Field>
      <Field label="Transaction ID"><Input {...register('transactionId')} /></Field>
      <div className="md:col-span-2"><FormActions isSubmitting={formState.isSubmitting} onCancel={onClose} submitLabel="Save payment" /></div>
    </form>
  </FormModal>;
}

function calculateDiscount(coupon, amount) {
  if (!coupon || !amount) return 0;
  const value = Number(coupon.value || 0);
  return coupon.type === 'PERCENTAGE' ? Math.min(amount, amount * value / 100) : Math.min(amount, value);
}

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== ''));
}
