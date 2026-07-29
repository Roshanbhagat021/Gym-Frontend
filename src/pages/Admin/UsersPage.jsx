import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit3, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { FormModal } from '../../components/common/FormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select } from '../../components/ui/Input';
import { FormActions } from '../../components/forms/FormActions';
import { ImageUploadField } from '../../components/forms/ImageUploadField';
import { ROLES } from '../../constants/enums';
import { adminApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { shortDate } from '../../utils/format';

export default function UsersPage() {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [open, setOpen] = useState(false);
  const { data: users = [], loading, execute } = useAsync(adminApi.users, []);
  return (
    <div>
      <PageHeader title="Admin Users" eyebrow="Super admin">
        This section is protected for `SUPER_ADMIN` exactly like the backend.
      </PageHeader>
      <DataTable toolbarActions={<Button variant="subtle" className="!min-h-10 border-ember text-ember" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> Add user</Button>} rows={users} loading={loading} emptyTitle="No admin users" columns={[
        { key: 'name', header: 'Name', render: (row) => <div><p className="font-bold">{row.name}</p><p className="text-xs text-steel">{row.email}</p></div> },
        { key: 'role', header: 'Role' },
        { key: 'isActive', header: 'Active', render: (row) => row.isActive ? 'Yes' : 'No' },
        { key: 'createdAt', header: 'Created', render: (row) => shortDate(row.createdAt) },
        { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="subtle" className="!min-h-8 h-8 w-8 px-0" onClick={() => { setEditing(row); setOpen(true); }}><Edit3 className="h-3.5 w-3.5" /></Button><Button variant="dangerSubtle" className="!min-h-8 h-8 w-8 px-0" onClick={() => setDeleting(row)}><Trash2 className="h-3.5 w-3.5" /></Button></div> },
      ]} />
      <UserForm open={open} user={editing} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); execute(); }} />
      <ConfirmModal open={Boolean(deleting)} title="Remove user?" description="This soft deletes the admin account." onClose={() => setDeleting(null)} onConfirm={async () => { await adminApi.deleteUser(deleting.id); setDeleting(null); execute(); }} />
    </div>
  );
}

function UserForm({ open, user, onClose, onSaved }) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState, watch, setValue } = useForm({ values: {
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'ADMIN',
    isActive: user?.isActive ?? true,
    profileImage: user?.profileImage || '',
  } });
  const profileImage = watch('profileImage');
  const submit = async (values) => {
    const payload = Object.fromEntries(
      Object.entries({
        ...values,
        isActive: values.isActive === 'true' || values.isActive === true,
      }).filter(([, value]) => value !== ''),
    );

    if (user && !payload.password) delete payload.password;

    if (user) {
      await adminApi.updateUser(user.id, payload);
    } else {
      const createPayload = { ...payload };
      delete createPayload.isActive;
      delete createPayload.profileImage;
      await adminApi.createUser(createPayload);
    }

    onSaved();
  };
  return (
    <FormModal open={open} title={user ? 'Edit admin user' : 'Add admin user'} onClose={onClose}>
      <form onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-2">
        <Field label="Name"><Input {...register('name', { required: true })} /></Field>
        <Field label="Email"><Input type="email" {...register('email', { required: true })} /></Field>
        <Field label={user ? 'New password (optional)' : 'Password'} error={formState.errors.password?.message}>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              className="pr-11"
              placeholder={user ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
              {...register('password', {
                required: user ? false : 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
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
        <Field label="Role"><Select {...register('role')}>{ROLES.filter((role) => role !== 'MEMBER').map((role) => <option key={role} value={role}>{role}</option>)}</Select></Field>
        <Field label="Active"><Select {...register('isActive')}><option value="true">Yes</option><option value="false">No</option></Select></Field>
        <div className="md:col-span-2">
          <ImageUploadField
            label="Profile image"
            value={profileImage}
            onChange={(url) => setValue('profileImage', url, { shouldDirty: true })}
          />
        </div>
        <div className="md:col-span-2"><FormActions isSubmitting={formState.isSubmitting} onCancel={onClose} submitLabel="Save user" /></div>
      </form>
    </FormModal>
  );
}
