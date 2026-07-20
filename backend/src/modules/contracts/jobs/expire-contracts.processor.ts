import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  CONTRACTS_QUEUE_NAME,
  EXPIRE_CONTRACTS_JOB_NAME,
} from '../../../infra/queue/queue.constants';
import { ContractRepository } from '../repositories/contract.repository';
import { ContractCacheService } from '../services/contract-cache.service';

@Processor(CONTRACTS_QUEUE_NAME)
export class ExpireContractsProcessor extends WorkerHost {
  private readonly logger = new Logger(ExpireContractsProcessor.name);

  constructor(
    private contractRepository: ContractRepository,
    private contractCache: ContractCacheService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== EXPIRE_CONTRACTS_JOB_NAME) {
      return;
    }

    const expiredCount = await this.contractRepository.expireDue();
    if (expiredCount > 0) {
      await this.contractCache.invalidate();
      this.logger.log(`${expiredCount} contrato(s) marcado(s) como vencido(s)`);
    }
  }
}
