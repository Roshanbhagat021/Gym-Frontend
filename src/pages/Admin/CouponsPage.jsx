import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { FormModal } from '../../components/common/FormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select } from '../../components/ui/Input';
import { FormActions } from '../../components/forms/FormActions';
import { COUPON_TYPES } from '../../constants/enums';
import { adminApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { shortDate } from '../../utils/format';

export default function CouponsPage() {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [open, setOpen] = useState(false);
  const { data: coupons = [], loading, execute } = useAsync(adminApi.coupons, []);
  return (
    <div>
      <PageHeader title="Coupons" eyebrow="Offers" actions={<Button variant="accent" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-5 w-5" /> Add coupon</Button>}>
        Coupon validation is available through the protected backend validate route.
      </PageHeader>
      <DataTable rows={coupons} loading={loading} emptyTitle="No coupons yet" columns={[
        { key: 'code', header: 'Code', render: (row) => <span className="rounded-lg bg-slate-100 px-2 py-1 font-black dark:bg-white/10">{row.code}</span> },
        { key: 'type', header: 'Type' },
        { key: 'value', header: 'Value' },
        { key: 'expiryDate', header: 'Expiry', render: (row) => shortDate(row.expiryDate) },
        { key: 'isActive', header: 'Active', render: (row) => row.isActive ? 'Yes' : 'No' },
        { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="subtle" className="!min-h-8 h-8 w-8 px-0" onClick={() => { setEditing(row); setOpen(true); }}><Edit3 className="h-3.5 w-3.5" /></Button><Button variant="dangerSubtle" className="!min-h-8 h-8 w-8 px-0" onClick={() => setDeleting(row)}><Trash2 className="h-3.5 w-3.5" /></Button></div> },
      ]} />
      <CouponForm open={open} coupon={editing} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); execute(); }} />
      <ConfirmModal open={Boolean(deleting)} title="Remove coupon?" description="This soft deletes the coupon in the backend." onClose={() => setDeleting(null)} onConfirm={async () => { await adminApi.deleteCoupon(deleting.id); setDeleting(null); execute(); }} />
    </div>
  );
}

function CouponForm({ open, coupon, onClose, onSaved }) {
  const { register, handleSubmit, formState } = useForm({ values: {
    code: coupon?.code || '',
    type: coupon?.type || 'PERCENTAGE',
    value: coupon?.value || '',
    expiryDate: coupon?.expiryDate ? String(coupon.expiryDate).slice(0, 10) : '',
    maxUsage: coupon?.maxUsage || 0,
    usagePerUser: coupon?.usagePerUser || 1,
    minPurchaseAmount: coupon?.minPurchaseAmount || 0,
    isActive: coupon?.isActive ?? true,
  } });
  const submit = async (values) => {
    const payload = {
      ...values,
      value: Number(values.value),
      maxUsage: Number(values.maxUsage),
      usagePerUser: Number(values.usagePerUser),
      minPurchaseAmount: Number(values.minPurchaseAmount),
      isActive: values.isActive === 'true' || values.isActive === true,
    };
    if (coupon) await adminApi.updateCoupon(coupon.id, payload);
    else await adminApi.createCoupon(payload);
    onSaved();
  };
  return <FormModal open={open} title={coupon ? 'Edit coupon' : 'Add coupon'} onClose={onClose}><form onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-2"><Field label="Code"><Input {...register('code', { required: true })} /></Field><Field label="Type"><Select {...register('type')}>{COUPON_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</Select></Field><Field label="Value"><Input type="number" step="0.01" {...register('value', { required: true })} /></Field><Field label="Expiry date"><Input type="date" {...register('expiryDate', { required: true })} /></Field><Field label="Max usage"><Input type="number" {...register('maxUsage')} /></Field><Field label="Usage per user"><Input type="number" {...register('usagePerUser')} /></Field><Field label="Minimum purchase"><Input type="number" step="0.01" {...register('minPurchaseAmount')} /></Field><Field label="Active"><Select {...register('isActive')}><option value="true">Yes</option><option value="false">No</option></Select></Field><div className="md:col-span-2"><FormActions isSubmitting={formState.isSubmitting} onCancel={onClose} submitLabel="Save coupon" /></div></form></FormModal>;
}
