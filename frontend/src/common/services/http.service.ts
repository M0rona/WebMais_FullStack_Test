import type { AxiosRequestConfig } from 'axios';
import { api } from '@/common/services/api.service';

export abstract class HttpService {
  protected readonly api = api;

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.api.get<T>(url, config);
    return data;
  }

  protected async post<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await this.api.post<T>(url, body, config);
    return data;
  }

  protected async patch<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await this.api.patch<T>(url, body, config);
    return data;
  }

  protected async delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.api.delete<T>(url, config);
    return data;
  }
}
