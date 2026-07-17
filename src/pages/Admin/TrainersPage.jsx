import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { FormModal } from '../../components/common/FormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select, Textarea } from '../../components/ui/Input';
import { FormActions } from '../../components/forms/FormActions';
import { ImageUploadField } from '../../components/forms/ImageUploadField';
import { adminApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';

export default function TrainersPage() {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [open, setOpen] = useState(false);
  const { data: trainers = [], loading, execute } = useAsync(() => adminApi.trainers(false), []);
  return (
    <div>
      <PageHeader title="Trainers" eyebrow="CMS" actions={<Button variant="accent" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-5 w-5" /> Add trainer</Button>}>
        Active trainers are shown on the public website.
      </PageHeader>
      <DataTable rows={trainers} loading={loading} emptyTitle="No trainers yet" columns={[
        { key: 'name', header: 'Trainer', render: (row) => <div className="flex items-center gap-3"><img src={row.image || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=200&q=80'} alt="" className="h-12 w-12 rounded-lg object-cover" /><div><p className="font-bold">{row.name}</p><p className="text-xs text-steel">{row.specialization}</p></div></div> },
        { key: 'experience', header: 'Experience', render: (row) => `${row.experience} yrs` },
        { key: 'isActive', header: 'Active', render: (row) => row.isActive ? 'Yes' : 'No' },
        { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="subtle" className="!min-h-8 h-8 w-8 px-0" onClick={() => { setEditing(row); setOpen(true); }}><Edit3 className="h-3.5 w-3.5" /></Button><Button variant="dangerSubtle" className="!min-h-8 h-8 w-8 px-0" onClick={() => setDeleting(row)}><Trash2 className="h-3.5 w-3.5" /></Button></div> },
      ]} />
      <TrainerForm open={open} trainer={editing} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); execute(); }} />
      <ConfirmModal open={Boolean(deleting)} title="Remove trainer?" description="This deletes the trainer record from the backend." onClose={() => setDeleting(null)} onConfirm={async () => { await adminApi.deleteTrainer(deleting.id); setDeleting(null); execute(); }} />
    </div>
  );
}

function TrainerForm({ open, trainer, onClose, onSaved }) {
  const { register, handleSubmit, formState, watch, setValue } = useForm({ values: {
    name: trainer?.name || '',
    specialization: trainer?.specialization || '',
    experience: trainer?.experience || '',
    bio: trainer?.bio || '',
    image: trainer?.image || '',
    isActive: trainer?.isActive ?? true,
  } });
  const image = watch('image');
  const submit = async (values) => {
    const payload = { ...values, experience: Number(values.experience), isActive: values.isActive === 'true' || values.isActive === true };
    if (trainer) await adminApi.updateTrainer(trainer.id, payload);
    else await adminApi.createTrainer(payload);
    onSaved();
  };
  return (
    <FormModal open={open} title={trainer ? 'Edit trainer' : 'Add trainer'} onClose={onClose}>
      <form onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-2">
        <Field label="Name"><Input {...register('name', { required: true })} /></Field>
        <Field label="Specialization"><Input {...register('specialization', { required: true })} /></Field>
        <Field label="Experience"><Input type="number" {...register('experience', { required: true })} /></Field>
        <Field label="Active"><Select {...register('isActive')}><option value="true">Yes</option><option value="false">No</option></Select></Field>
        <div className="md:col-span-2">
          <ImageUploadField
            label="Trainer image"
            value={image}
            onChange={(url) => setValue('image', url, { shouldDirty: true })}
          />
        </div>
        <div className="md:col-span-2"><Field label="Bio"><Textarea {...register('bio')} /></Field><FormActions isSubmitting={formState.isSubmitting} onCancel={onClose} submitLabel="Save trainer" /></div>
      </form>
    </FormModal>
  );
}
