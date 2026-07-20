import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CONTRACTS_QUEUE_NAME } from '../../infra/queue/queue.constants';
import { ClientModule } from '../clients/client.module';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { ExpireContractsProcessor } from './jobs/expire-contracts.processor';
import { ExpireContractsScheduler } from './jobs/expire-contracts.scheduler';
import { ContractRepository } from './repositories/contract.repository';
import { ContractCacheService } from './services/contract-cache.service';

@Module({
  imports: [ClientModule, BullModule.registerQueue({ name: CONTRACTS_QUEUE_NAME })],
  controllers: [ContractController],
  providers: [
    ContractService,
    ContractRepository,
    ContractCacheService,
    ExpireContractsProcessor,
    ExpireContractsScheduler,
  ],
})
export class ContractModule {}
