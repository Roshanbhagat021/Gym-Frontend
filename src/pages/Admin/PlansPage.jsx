import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { FormModal } from '../../components/common/FormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { Field, Input, Textarea } from '../../components/ui/Input';
import { FormActions } from '../../components/forms/FormActions';
import { adminApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { currency, shortDate } from '../../utils/format';

export default function PlansPage() {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [open, setOpen] = useState(false);
  const { data: plans = [], loading, execute } = useAsync(() => adminApi.plans(false), []);

  return (
    <div>
      <PageHeader title="Membership Plans" eyebrow="Plans">
        Plans are public by default through the backend active plan endpoint.
      </PageHeader>
      <DataTable
        toolbarActions={<Button variant="subtle" className="!min-h-10 border-ember text-ember" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> Add plan</Button>}
        rows={plans}
        loading={loading}
        emptyTitle="No plans yet"
        columns={[
          { key: 'name', header: 'Plan', render: (row) => <div><p className="font-bold">{row.name}</p><p className="text-xs text-steel">{row.description || 'No description'}</p></div> },
          { key: 'duration', header: 'Duration', render: (row) => `${row.duration} days` },
          { key: 'price', header: 'Price', render: (row) => currency(row.price) },
          { key: 'isActive', header: 'Active', render: (row) => row.isActive ? 'Yes' : 'No' },
          { key: 'createdAt', header: 'Created', render: (row) => shortDate(row.createdAt) },
          { key: 'actions', header: 'Actions', render: (row) => <Actions row={row} onEdit={() => { setEditing(row); setOpen(true); }} onDelete={() => setDeleting(row)} /> },
        ]}
      />
      <PlanForm open={open} plan={editing} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); execute(); }} />
      <ConfirmModal open={Boolean(deleting)} title="Remove plan?" description="The backend soft deletes plans to preserve member history." onClose={() => setDeleting(null)} onConfirm={async () => { await adminApi.deletePlan(deleting.id); setDeleting(null); execute(); }} />
    </div>
  );
}

function Actions({ onEdit, onDelete }) {
  return <div className="flex gap-2"><Button variant="subtle" className="!min-h-8 h-8 w-8 px-0" onClick={onEdit}><Edit3 className="h-3.5 w-3.5" /></Button><Button variant="dangerSubtle" className="!min-h-8 h-8 w-8 px-0" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button></div>;
}

function PlanForm({ open, plan, onClose, onSaved }) {
  const { register, handleSubmit, formState } = useForm({
    values: {
      name: plan?.name || '',
      duration: plan?.duration || '',
      price: plan?.price || '',
      description: plan?.description || '',
      isActive: plan?.isActive ?? true,
    },
  });
  const submit = async (values) => {
    const payload = { ...values, duration: Number(values.duration), price: Number(values.price), isActive: values.isActive === 'true' || values.isActive === true };
    if (plan) await adminApi.updatePlan(plan.id, payload);
    else await adminApi.createPlan(payload);
    onSaved();
  };
  return <FormModal open={open} title={plan ? 'Edit plan' : 'Add plan'} onClose={onClose}><form onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-2"><Field label="Name"><Input {...register('name', { required: true })} /></Field><Field label="Duration"><Input type="number" {...register('duration', { required: true })} /></Field><Field label="Price"><Input type="number" step="0.01" {...register('price', { required: true })} /></Field><Field label="Active"><select className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#181a20]" {...register('isActive')}><option value="true">Yes</option><option value="false">No</option></select></Field><div className="md:col-span-2"><Field label="Description"><Textarea {...register('description')} /></Field><FormActions isSubmitting={formState.isSubmitting} onCancel={onClose} submitLabel="Save plan" /></div></form></FormModal>;
}
