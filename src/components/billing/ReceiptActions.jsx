import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, MessageCircle, ReceiptText } from 'lucide-react';
import { Button } from '../ui/Button';
import { printReceipt, shareReceiptPdf } from '../../utils/receipt';

export function ReceiptActions({ payment, gymName, allowWhatsapp = false }) {
  const [sharing, setSharing] = useState(false);
  if (payment?.status !== 'COMPLETED') return <span className="text-xs text-steel">Available after payment</span>;

  const handleWhatsappShare = async () => {
    setSharing(true);
    try {
      const result = await shareReceiptPdf(payment, gymName);
      if (!result.shared) toast('PDF downloaded. Attach it to the member\'s WhatsApp chat.');
    } catch (error) {
      if (error?.name !== 'AbortError') toast.error('Could not share the receipt PDF.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="subtle" className="!min-h-8 h-8 px-2" onClick={() => printReceipt(payment, gymName)} title="View or save receipt as PDF">
        <ReceiptText className="h-3.5 w-3.5" /> Receipt
      </Button>
      {allowWhatsapp && payment?.member?.mobile ? (
        <Button type="button" disabled={sharing} onClick={handleWhatsappShare} className="!min-h-8 h-8 bg-emerald-600 px-2.5 text-xs hover:bg-emerald-700" title="Share receipt PDF through WhatsApp">
          {sharing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />} WhatsApp PDF
        </Button>
      ) : null}
    </div>
  );
}
