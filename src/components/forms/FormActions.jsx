import { Button } from '../ui/Button';

export function FormActions({ isSubmitting, onCancel, submitLabel = 'Save' }) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <Button variant="subtle" onClick={onCancel}>Cancel</Button>
      <Button type="submit" variant="accent" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </div>
  );
}
