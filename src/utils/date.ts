import { TODAY } from "../constants/app";

export function formatDate(iso: string): string {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  if (!m || !d) return iso;
  return `${d}/${m}`;
}

/**
 * Dias entre a data informada (yyyy-MM-dd) e hoje (relógio real).
 * Sempre positivo (valor absoluto).
 */
export function ageDays(iso: string): number {
  if (!iso) return 0;
  const raw = iso.length === 10 ? `${iso}T12:00:00` : iso;
  const then = new Date(raw).getTime();
  if (Number.isNaN(then)) return 0;
  const now = Date.now();
  const days = Math.round((now - then) / 86400000);
  return Math.abs(days);
}

/** Formata telefone brasileiro: (12) 99999-9999 ou (12) 9999-9999 */
export function formatPhone(raw?: string | null): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length > 0) {
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return raw;
}
