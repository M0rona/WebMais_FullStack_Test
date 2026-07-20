import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(configService: ConfigService) {
    super(configService.getOrThrow<string>('REDIS_URL'));
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const cached = await this.get(key);
    return cached ? (JSON.parse(cached) as T) : null;
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    const keys = await this.keys(`${prefix}*`);
    if (keys.length > 0) {
      await this.del(...keys);
    }
  }

  onModuleDestroy() {
    this.disconnect();
  }
}
