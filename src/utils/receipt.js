import { currency, getMemberName, shortDate } from './format';

export function getReceiptNumber(payment) {
  if (payment?.receiptNumber) return payment.receiptNumber;
  const date = payment?.createdAt ? new Date(payment.createdAt).toISOString().slice(0, 10).replaceAll('-', '') : 'LEGACY';
  return `RCPT-${date}-${String(payment?.id || '').slice(0, 8).toUpperCase()}`;
}

export function receiptWhatsappUrl(payment, gymName) {
  const phoneDigits = String(payment?.member?.mobile || '').replace(/\D/g, '');
  const phone = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits;
  const plan = payment?.membership?.planName || payment?.membership?.plan?.name || 'Membership';
  const message = [
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
    'You can view and print the full receipt from your member dashboard.',
  ].join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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
