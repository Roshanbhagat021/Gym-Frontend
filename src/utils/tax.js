export const MEMBERSHIP_GST_RATE = 5;

export function calculateGst(taxableAmount, rate = MEMBERSHIP_GST_RATE) {
  return Math.round((Number(taxableAmount || 0) * Number(rate || 0) / 100 + Number.EPSILON) * 100) / 100;
}

export function amountWithGst(taxableAmount, rate = MEMBERSHIP_GST_RATE) {
  return Math.round((Number(taxableAmount || 0) + calculateGst(taxableAmount, rate) + Number.EPSILON) * 100) / 100;
}
