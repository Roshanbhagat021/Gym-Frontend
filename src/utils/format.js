export function currency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export function shortDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function getMemberName(member) {
  return member?.user?.name || member?.name || 'Unknown member';
}

export function getMemberEmail(member) {
  return member?.user?.email || member?.email || '-';
}
