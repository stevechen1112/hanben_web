const PAYMENT_INFO_MARKER = "[HB_PAYMENT_INFO]";

export interface DeferredPaymentInfo {
  kind: "ATM" | "CVS";
  bankCode?: string;
  vAccount?: string;
  paymentNo?: string;
  expireDate?: string;
}

export function readOrderPaymentInfo(note: string | null | undefined) {
  if (!note) {
    return null;
  }

  const markerIndex = note.indexOf(PAYMENT_INFO_MARKER);
  if (markerIndex === -1) {
    return null;
  }

  const raw = note.slice(markerIndex + PAYMENT_INFO_MARKER.length).trim();
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DeferredPaymentInfo;
  } catch {
    return null;
  }
}

export function upsertOrderPaymentInfo(
  note: string | null | undefined,
  paymentInfo: DeferredPaymentInfo,
) {
  const baseNote = note ? note.split(PAYMENT_INFO_MARKER)[0].trimEnd() : "";
  const encoded = `${PAYMENT_INFO_MARKER}${JSON.stringify(paymentInfo)}`;
  return baseNote ? `${baseNote}\n\n${encoded}` : encoded;
}

export function stripOrderPaymentInfo(note: string | null | undefined) {
  if (!note) {
    return null;
  }

  const baseNote = note.split(PAYMENT_INFO_MARKER)[0].trim();
  return baseNote || null;
}