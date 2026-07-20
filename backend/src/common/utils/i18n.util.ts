import { I18nContext } from 'nestjs-i18n';

// Fallback cobre contextos sem request HTTP (testes unitários, jobs) onde
// I18nContext.current() não existe.
export function translate(key: string, fallback: string): string {
  return I18nContext.current()?.t(key) ?? fallback;
}
