import { currency, getMemberName, shortDate } from './format';
import { jsPDF } from 'jspdf';

export function getReceiptNumber(payment) {
  if (payment?.receiptNumber) return payment.receiptNumber;
  const date = payment?.createdAt ? new Date(payment.createdAt).toISOString().slice(0, 10).replaceAll('-', '') : 'LEGACY';
  return `RCPT-${date}-${String(payment?.id || '').slice(0, 8).toUpperCase()}`;
}

export function receiptWhatsappUrl(payment, gymName) {
  const phoneDigits = String(payment?.member?.mobile || '').replace(/\D/g, '');
  const phone = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits;
  const message = getReceiptShareMessage(payment, gymName);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function getReceiptShareMessage(payment, gymName) {
  const plan = payment?.membership?.planName || payment?.membership?.plan?.name || 'Membership';
  return [
    `Hi ${getMemberName(payment?.member)},`,
    `Thank you for your payment to ${gymName}.`,
    '',
    `Receipt: ${getReceiptNumber(payment)}`,
    `Plan: ${plan}`,
    `Taxable amount: ${currency(payment?.taxableAmount ?? payment?.amount)}`,
    `GST (${Number(payment?.gstRate || 0)}%): ${currency(payment?.gstAmount)}`,
    `Total paid: ${currency(payment?.amount)}`,
    `Payment date: ${shortDate(payment?.createdAt)}`,
    `Transaction ID: ${payment?.transactionId || '-'}`,
    '',
    'Your payment receipt is attached to this message for your records.',
  ].join('\n');
}

export function createReceiptPdf(payment, gymName) {
  const document = new jsPDF({ unit: 'mm', format: 'a4' });
  const receiptNumber = getReceiptNumber(payment);
  const memberName = getMemberName(payment?.member);
  const plan = payment?.membership?.planName || payment?.membership?.plan?.name || 'Membership payment';
  const taxable = payment?.taxableAmount ?? (Number(payment?.amount || 0) - Number(payment?.gstAmount || 0));
  const money = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  document.setProperties({ title: receiptNumber, subject: 'Payment receipt', author: gymName });
  document.setFont('helvetica', 'bold');
  document.setFontSize(22);
  document.text(String(gymName || 'Gym'), 20, 24);
  document.setFontSize(11);
  document.setTextColor(102, 112, 133);
  document.text('PAYMENT RECEIPT', 20, 32);

  document.setDrawColor(239, 91, 53);
  document.setLineWidth(0.8);
  document.line(20, 38, 190, 38);

  const detail = (label, value, x, y) => {
    document.setFont('helvetica', 'normal');
    document.setFontSize(9);
    document.setTextColor(102, 112, 133);
    document.text(label, x, y);
    document.setFont('helvetica', 'bold');
    document.setFontSize(11);
    document.setTextColor(23, 32, 51);
    document.text(String(value || '-'), x, y + 6, { maxWidth: 75 });
  };

  detail('Receipt number', receiptNumber, 20, 49);
  detail('Payment date', shortDate(payment?.createdAt), 110, 49);
  detail('Received from', memberName, 20, 69);
  detail('Membership plan', plan, 110, 69);
  detail('Payment method', payment?.paymentGateway || '-', 20, 89);
  detail('Transaction ID', payment?.transactionId || '-', 110, 89);

  const row = (label, value, y, bold = false) => {
    document.setDrawColor(225, 229, 236);
    document.line(20, y + 5, 190, y + 5);
    document.setFont('helvetica', bold ? 'bold' : 'normal');
    document.setFontSize(bold ? 13 : 11);
    document.setTextColor(23, 32, 51);
    document.text(label, 20, y);
    document.text(value, 190, y, { align: 'right' });
  };

  row('Taxable amount', money(taxable), 119);
  row(`GST (${Number(payment?.gstRate || 0)}%)`, money(payment?.gstAmount), 134);
  row('Total paid', money(payment?.amount), 152, true);

  document.setFont('helvetica', 'bold');
  document.setFontSize(11);
  document.setTextColor(22, 134, 92);
  document.text(`Payment status: ${payment?.status || '-'}`, 20, 172);
  document.setFont('helvetica', 'normal');
  document.setFontSize(9);
  document.setTextColor(102, 112, 133);
  document.text('This is a computer-generated receipt.', 105, 282, { align: 'center' });

  const blob = document.output('blob');
  const safeMemberName = memberName.trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '') || 'Member';
  const safeNumber = receiptNumber.replace(/[^a-zA-Z0-9_-]/g, '-');
  return new File([blob], `Payment-Receipt-${safeMemberName}-${safeNumber}.pdf`, { type: 'application/pdf' });
}

export async function shareReceiptPdf(payment, gymName) {
  const file = createReceiptPdf(payment, gymName);
  const shareData = {
    files: [file],
    title: `Payment receipt ${getReceiptNumber(payment)}`,
    text: getReceiptShareMessage(payment, gymName),
  };

  if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
    await navigator.share(shareData);
    return { shared: true };
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { shared: false };
}

export function printReceipt(payment, gymName) {
  const popup = window.open('', '_blank', 'width=760,height=900');
  if (!popup) return false;
  const taxable = payment?.taxableAmount ?? (Number(payment?.amount || 0) - Number(payment?.gstAmount || 0));
  const plan = payment?.membership?.planName || payment?.membership?.plan?.name || 'Membership payment';
  popup.document.write(`<!doctype html><html><head><title>${escapeHtml(getReceiptNumber(payment))}</title><style>
    body{font-family:Arial,sans-serif;color:#172033;margin:0;padding:40px} .sheet{max-width:680px;margin:auto;border:1px solid #dbe1ea;border-radius:16px;padding:32px}
    h1{margin:0;font-size:28px}.muted{color:#667085}.top{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #ef5b35;padding-bottom:24px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:24px 0}.row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee}
    .total{font-size:20px;font-weight:700}.paid{color:#16865c;font-weight:700}.foot{margin-top:28px;text-align:center;font-size:12px;color:#667085}@media print{body{padding:0}.sheet{border:0}}
  </style></head><body><div class="sheet"><div class="top"><div><h1>${escapeHtml(gymName)}</h1><p class="muted">Payment receipt</p></div><div><strong>${escapeHtml(getReceiptNumber(payment))}</strong><p class="muted">${escapeHtml(shortDate(payment?.createdAt))}</p></div></div>
  <div class="grid"><div><span class="muted">Received from</span><br><strong>${escapeHtml(getMemberName(payment?.member))}</strong></div><div><span class="muted">Plan</span><br><strong>${escapeHtml(plan)}</strong></div><div><span class="muted">Payment method</span><br><strong>${escapeHtml(payment?.paymentGateway || '-')}</strong></div><div><span class="muted">Transaction ID</span><br><strong>${escapeHtml(payment?.transactionId || '-')}</strong></div></div>
  <div class="row"><span>Taxable amount</span><strong>${escapeHtml(currency(taxable))}</strong></div><div class="row"><span>GST (${Number(payment?.gstRate || 0)}%)</span><strong>${escapeHtml(currency(payment?.gstAmount))}</strong></div><div class="row total"><span>Total paid</span><span>${escapeHtml(currency(payment?.amount))}</span></div>
  <p class="paid">Payment status: ${escapeHtml(payment?.status || '-')}</p><p class="foot">This is a computer-generated receipt.</p></div></body></html>`);
  popup.document.close();
  popup.focus();
  window.setTimeout(() => popup.print(), 250);
  return true;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
