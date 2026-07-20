import type { TFunction } from 'i18next';

// Mensagens de erro dos schemas Zod são chaves de tradução (ex.:
// 'auth:validation.email.invalid'), não texto — resolvidas aqui na
// apresentação para reagir à troca de idioma em tempo real.
export const translateError = (t: TFunction, message?: string): string | undefined =>
  message ? t(message) : undefined;
