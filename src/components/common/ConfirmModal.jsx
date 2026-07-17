import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

export function ConfirmModal({ open, title, description, onConfirm, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-panel dark:bg-[#181a20]">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-red-100 p-2 text-red-600 dark:bg-red-500/15">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black">{title}</h2>
            <p className="mt-1 text-sm text-steel">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}
