import axios, { type AxiosError } from 'axios';
import { ERROR_MESSAGES } from '@/common/constants';

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
  return ERROR_MESSAGES.GENERIC;
}
