import i18next from '@/lib/i18n';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(i18next.language, { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat(i18next.language).format(new Date(value));
}

export function formatDocument(document: string): string {
  const digits = document.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}
