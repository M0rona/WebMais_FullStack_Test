import axios, { type AxiosError } from 'axios';
import i18next from '@/i18n';

interface ApiErrorBody {
  message?: string | string[];
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = (error as AxiosError<ApiErrorBody>).response?.data;
    if (body?.message) {
      return Array.isArray(body.message) ? body.message[0] : body.message;
    }
  }
  return i18next.t('common:errors.generic');
}
