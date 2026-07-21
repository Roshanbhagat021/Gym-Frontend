import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Button } from '../ui/Button';
import { Field, Input } from '../ui/Input';
import { ImageCropModal } from './ImageCropModal';

export function ImageUploadField({
  label,
  value,
  onChange,
  helper = 'PNG, JPG, or JPEG up to 5MB.',
  enableCrop = false,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [cropFile, setCropFile] = useState(null);

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const result = await adminApi.uploadImage(file);
      onChange(result.url);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (enableCrop) setCropFile(file);
    else await uploadFile(file);
    event.target.value = '';
  };

  return (
    <div className="w-full min-w-0 max-w-full">
    <Field label={label}>
      <div className="grid w-full min-w-0 max-w-full gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
        {value ? (
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/10"><img src={value} alt="Uploaded preview" className="max-h-full max-w-full object-contain" /></div>
            <div className="min-w-0 flex-1">
              <p className="max-h-10 max-w-full overflow-hidden break-all text-xs font-semibold leading-5 text-steel" title={value}>{value}</p>
              <Button
                type="button"
                variant="ghost"
                className="mt-1 !min-h-8 h-8 px-2 text-xs text-red-500"
                onClick={() => onChange('')}
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        ) : null}

        <div className="grid w-full min-w-0 max-w-full gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            className="min-w-0 max-w-full"
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Image URL"
          />
          <Button
            type="button"
            variant="subtle"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full lg:w-auto"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {uploading ? 'Uploading' : 'Upload'}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-steel">{helper}</p>
      </div>
    </Field>
    <ImageCropModal file={cropFile} onCancel={() => setCropFile(null)} onApply={async (file) => { setCropFile(null); await uploadFile(file); }} />
    </div>
  );
}
