import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'node:path';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PrismaModule } from './infra/prisma/prisma.module';
import { QueueModule } from './infra/queue/queue.module';
import { RedisModule } from './infra/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientModule } from './modules/clients/client.module';
import { ContractModule } from './modules/contracts/contract.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    I18nModule.forRoot({
      fallbackLanguage: 'pt-BR',
      loaderOptions: { path: join(__dirname, 'i18n'), watch: false },
      resolvers: [AcceptLanguageResolver],
    }),
    PrismaModule,
    RedisModule,
    QueueModule,
    AuthModule,
    ClientModule,
    ContractModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
