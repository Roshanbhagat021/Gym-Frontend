import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Button } from '../ui/Button';
import { Field, Input } from '../ui/Input';

export function ImageUploadField({
  label,
  value,
  onChange,
  helper = 'PNG, JPG, or JPEG up to 5MB.',
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await adminApi.uploadImage(file);
      onChange(result.url);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Field label={label}>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
        {value ? (
          <div className="flex items-center gap-3">
            <img src={value} alt="" className="h-16 w-16 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-steel">{value}</p>
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

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Image URL"
          />
          <Button
            type="button"
            variant="subtle"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
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
  );
}
