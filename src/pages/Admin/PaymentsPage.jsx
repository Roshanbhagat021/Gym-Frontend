import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit3, Plus } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { FormModal } from '../../components/common/FormModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select } from '../../components/ui/Input';
import { FormActions } from '../../components/forms/FormActions';
import { PAYMENT_GATEWAYS, PAYMENT_STATUSES } from '../../constants/enums';
import { adminApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { currency, getMemberName, shortDate } from '../../utils/format';

export default function PaymentsPage() {
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { data: payments = [], loading, execute } = useAsync(adminApi.payments, []);
  const { data: members = [] } = useAsync(adminApi.membersBasic, []);
  const { data: plans = [] } = useAsync(() => adminApi.plans(false), []);
  return (
    <div>
      <PageHeader title="Payments" eyebrow="Billing" actions={<Button variant="accent" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-5 w-5" /> Record payment</Button>}>
        Completed payments can trigger membership purchase when a plan is selected.
      </PageHeader>
      <DataTable rows={payments} loading={loading} emptyTitle="No payments recorded" columns={[
        { key: 'member', header: 'Member', render: (row) => getMemberName(row.member) },
        { key: 'amount', header: 'Amount', render: (row) => currency(row.amount) },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        { key: 'paymentGateway', header: 'Gateway' },
        { key: 'createdAt', header: 'Date', render: (row) => shortDate(row.createdAt) },
        { key: 'actions', header: 'Actions', render: (row) => <Button variant="subtle" className="!min-h-8 h-8 w-8 px-0" onClick={() => { setEditing(row); setOpen(true); }}><Edit3 className="h-3.5 w-3.5" /></Button> },
      ]} />
      <PaymentForm open={open} payment={editing} members={members} plans={plans} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); execute(); }} />
    </div>
  );
}

function PaymentForm({ open, payment, members, plans, onClose, onSaved }) {
  const { register, handleSubmit, formState } = useForm({ values: {
    memberId: payment?.member?.id || '',
    amount: payment?.amount || '',
    status: payment?.status || 'PENDING',
    transactionId: payment?.transactionId || '',
    paymentGateway: payment?.paymentGateway || 'CASH',
    planId: '',
  } });
  const submit = async (values) => {
    const payload = Object.fromEntries(Object.entries({ ...values, amount: Number(values.amount) }).filter(([, value]) => value !== ''));
    if (payment) await adminApi.updatePayment(payment.id, payload);
    else await adminApi.createPayment(payload);
    onSaved();
  };
  return <FormModal open={open} title={payment ? 'Edit payment' : 'Record payment'} onClose={onClose}><form onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-2"><Field label="Member"><Select {...register('memberId', { required: true })}><option value="">Select member</option>{members.map((member) => <option key={member.id} value={member.id}>{getMemberName(member)}</option>)}</Select></Field><Field label="Amount"><Input type="number" step="0.01" {...register('amount', { required: true })} /></Field><Field label="Status"><Select {...register('status')}>{PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</Select></Field><Field label="Gateway"><Select {...register('paymentGateway')}>{PAYMENT_GATEWAYS.map((gateway) => <option key={gateway} value={gateway}>{gateway}</option>)}</Select></Field><Field label="Transaction ID"><Input {...register('transactionId')} /></Field><Field label="Plan to activate"><Select {...register('planId')}><option value="">No plan</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</Select></Field><div className="md:col-span-2"><FormActions isSubmitting={formState.isSubmitting} onCancel={onClose} submitLabel="Save payment" /></div></form></FormModal>;
}
