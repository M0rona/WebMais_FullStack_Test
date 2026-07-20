import { ConfigService } from '@nestjs/config';

const DEFAULT_JWT_EXPIRES_IN_HOURS = 8;

export function getJwtExpiresInSeconds(configService: ConfigService): number {
  const hours = Number(configService.get<string>('JWT_EXPIRES_IN_HOURS'));
  const validHours = Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_JWT_EXPIRES_IN_HOURS;
  return validHours * 3600;
}
