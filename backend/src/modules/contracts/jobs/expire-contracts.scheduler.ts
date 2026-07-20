import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import {
  CONTRACTS_QUEUE_NAME,
  EXPIRE_CONTRACTS_JOB_ID,
  EXPIRE_CONTRACTS_JOB_NAME,
} from '../../../infra/queue/queue.constants';

const DEFAULT_EXPIRE_JOB_INTERVAL_MS = 60_000;

@Injectable()
export class ExpireContractsScheduler implements OnModuleInit {
  private readonly logger = new Logger(ExpireContractsScheduler.name);

  constructor(
    @InjectQueue(CONTRACTS_QUEUE_NAME) private queue: Queue,
    private configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const every =
      Number(this.configService.get<string>('EXPIRE_JOB_INTERVAL_MS')) ||
      DEFAULT_EXPIRE_JOB_INTERVAL_MS;

    // jobId fixo: reagendar com o mesmo id não duplica o job repetível a cada restart.
    await this.queue.add(
      EXPIRE_CONTRACTS_JOB_NAME,
      {},
      { repeat: { every }, jobId: EXPIRE_CONTRACTS_JOB_ID },
    );

    this.logger.log(`Job de expiração de contratos agendado a cada ${every}ms`);
  }
}
