import { Injectable } from '@nestjs/common';
import {
  CONTRACTS_LIST_CACHE_PREFIX,
  CONTRACTS_SUMMARY_CACHE_KEY,
} from '../../../common/constants/contract.constants';
import { RedisService } from '../../../infra/redis/redis.service';

@Injectable()
export class ContractCacheService {
  constructor(private redis: RedisService) {}

  async invalidate(): Promise<void> {
    await Promise.all([
      this.redis.deleteByPrefix(CONTRACTS_LIST_CACHE_PREFIX),
      this.redis.del(CONTRACTS_SUMMARY_CACHE_KEY),
    ]);
  }
}
