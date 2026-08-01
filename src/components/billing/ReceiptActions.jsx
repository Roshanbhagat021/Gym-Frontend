import { MessageCircle, ReceiptText } from 'lucide-react';
import { Button } from '../ui/Button';
import { printReceipt, receiptWhatsappUrl } from '../../utils/receipt';

export function ReceiptActions({ payment, gymName, allowWhatsapp = false }) {
  if (payment?.status !== 'COMPLETED') return <span className="text-xs text-steel">Available after payment</span>;
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="subtle" className="!min-h-8 h-8 px-2" onClick={() => printReceipt(payment, gymName)} title="View or save receipt as PDF">
        <ReceiptText className="h-3.5 w-3.5" /> Receipt
      </Button>
      {allowWhatsapp && payment?.member?.mobile ? (
        <a href={receiptWhatsappUrl(payment, gymName)} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 text-xs font-bold text-white hover:bg-emerald-700">
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
      ) : null}
    </div>
  );
}
