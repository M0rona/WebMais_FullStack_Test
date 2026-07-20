import { ConfigService } from '@nestjs/config';

const DEFAULT_JWT_EXPIRES_IN_HOURS = 8;

/**
 * `expiresIn` do @nestjs/jwt espera `number` (segundos) ou uma string no formato
 * literal da lib `ms` (ex. "8h") — não um `string` genérico vindo do ConfigService.
 * Para não perder a checagem de tipos, tratamos JWT_EXPIRES_IN_HOURS como número.
 */
export function getJwtExpiresInSeconds(configService: ConfigService): number {
  const hours = Number(configService.get<string>('JWT_EXPIRES_IN_HOURS'));
  const validHours = Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_JWT_EXPIRES_IN_HOURS;
  return validHours * 3600;
}
