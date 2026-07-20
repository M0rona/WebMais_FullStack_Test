import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  CONTRACTS_LIST_CACHE_PREFIX,
  CONTRACTS_SUMMARY_CACHE_KEY,
} from '../../../common/constants/contract.constants';
import {
  CONTRACTS_QUEUE_NAME,
  EXPIRE_CONTRACTS_JOB_NAME,
} from '../../../infra/queue/queue.constants';
import { RedisService } from '../../../infra/redis/redis.service';
import { ContractRepository } from '../repositories/contract.repository';

@Processor(CONTRACTS_QUEUE_NAME)
export class ExpireContractsProcessor extends WorkerHost {
  private readonly logger = new Logger(ExpireContractsProcessor.name);

  constructor(
    private contractRepository: ContractRepository,
    private redis: RedisService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== EXPIRE_CONTRACTS_JOB_NAME) {
      return;
    }

    const expiredCount = await this.contractRepository.expireDue();
    if (expiredCount > 0) {
      await Promise.all([
        this.redis.deleteByPrefix(CONTRACTS_LIST_CACHE_PREFIX),
        this.redis.del(CONTRACTS_SUMMARY_CACHE_KEY),
      ]);
      this.logger.log(`${expiredCount} contrato(s) marcado(s) como vencido(s)`);
    }
  }
}
