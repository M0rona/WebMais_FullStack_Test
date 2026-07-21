# 02 — Backend (NestJS)

Estrutura de pastas e regras de camada: ver `CLAUDE.md` → "Backend (NestJS)".
Use a skill `scaffold-backend-module` para gerar cada módulo novo.

## Módulos

```
modules/
  auth/        # register, login, JwtStrategy, guard global
  users/       # só o necessário para auth (pode viver dentro de auth/ se for enxuto)
  clients/     # CRUD completo de clientes
  contracts/   # CRUD de contratos + itens + aprovar + encerrar + resumo por status
infra/
  prisma/      # PrismaModule, PrismaService
  redis/       # RedisModule, RedisService (wrapper fino sobre ioredis)
  queue/       # BullMQ: registro da fila "contracts"
  i18n/        # traduções (pt-BR/en) carregadas pelo I18nModule
```

## Auth

- `POST /auth/register` — `{ name, email, password }` → cria `User` (senha
  com `bcrypt`, custo 10), retorna `{ accessToken, user }`.
- `POST /auth/login` — `{ email, password }` → valida credenciais, retorna
  `{ accessToken, user }`.
- Guard JWT global (`JwtAuthGuard` aplicado via `APP_GUARD` em `AppModule`,
  como no CodeHammer) + decorator `@Public()` nas rotas de auth.
- Payload do JWT: `{ sub: userId, email }`, expiração configurável via env
  `JWT_EXPIRES_IN_HOURS` (número, default `8`). Não é `JWT_EXPIRES_IN` como
  string tipo `"8h"`: o tipo de `expiresIn` do `@nestjs/jwt` só aceita
  `number` (segundos) ou o literal de template da lib `ms` — um `string`
  genérico vindo do `ConfigService` não tipa. `common/utils/jwt.util.ts`
  converte horas → segundos.
- `GET /auth/me` — retorna o usuário autenticado (usado pelo frontend para
  restaurar sessão a partir do token salvo).

## Clients

CRUD completo:

- `POST /clients` — cria cliente (`name`, `document` validado com dígito
  verificador de CPF/CNPJ no Zod schema).
- `GET /clients` — lista clientes (usado no select do form de contrato).
- `GET /clients/:id` — detalhe.
- `PATCH /clients/:id` — edita `name`/`document`.
- `DELETE /clients/:id` — remove cliente. O service verifica proativamente
  (`countContracts`) se há contrato vinculado antes de excluir e lança
  `BadRequestException('Cliente possui contratos vinculados e não pode ser excluído')`
  nesse caso — preferido a deixar o Postgres rejeitar por FK
  (`onDelete: Restrict`, que continua existindo como rede de segurança) e
  capturar o erro do driver, porque não depende de parsear código de erro
  específico do Postgres/Prisma.

## Contracts

- `POST /contracts` — cria contrato em `DRAFT`: `clientId`, `type`, `dueDate`
  e a lista inicial de `items` (`description`, `quantity`, `unitValue`).
  `number` é autogerado no service (sequencial `CTR-0001`). `value` é
  calculado a partir dos itens recebidos, não aceito como input direto.
  Tudo dentro de uma `prisma.$transaction` (contrato + itens).
- `GET /contracts` — lista contratos com filtro opcional por `status`/`type`
  e paginação simples (`page`, `limit`). **Passa pelo cache Redis.**
- `GET /contracts/summary` — `{ draft, active, expired, closed }` (contagem
  por status). **Passa pelo cache Redis.**
- `GET /contracts/:id` — detalhe de um contrato, incluindo `items`.
- `PATCH /contracts/:id` — edita `type`/`dueDate`/`clientId`; bloqueado se
  status atual for `CLOSED` (`BadRequestException`).
- `DELETE /contracts/:id` — remove contrato (cascata apaga os itens).
- `POST /contracts/:id/approve` — transiciona `DRAFT → ACTIVE`; exige pelo
  menos 1 item (`BadRequestException` caso contrário); erro se o contrato não
  estiver em `DRAFT`.
- `POST /contracts/:id/close` — transiciona para `CLOSED` (permitido a partir
  de `ACTIVE` ou `EXPIRED`; erro se `DRAFT` ou já `CLOSED`), seta
  `closedAt = now()`.
- `POST /contracts/:id/items` — adiciona item a um contrato em `DRAFT` ou
  `ACTIVE`/`EXPIRED`; recalcula e persiste `Contract.value` na mesma
  transação.
- `PATCH /contracts/:id/items/:itemId` / `DELETE /contracts/:id/items/:itemId`
  — edita/remove item, mesma regra de recálculo transacional de `value`.
  Bloqueado se o contrato estiver `CLOSED`.

Toda operação de escrita em `contracts` ou `contract items` (`create`,
`update`, `delete`, `approve`, `close`) deve invalidar as chaves de cache
antes de retornar.

## Cache Redis (cache-aside)

`RedisService` fino sobre `ioredis`, exposto ao service de `contracts`:

- Chave `contracts:summary` — TTL curto (ex. 30-60s). Invalidada em qualquer
  escrita de contrato/item e ao final da execução do job de expiração.
- Chave `contracts:list:<page>:<limit>:<status ?? 'all'>:<type ?? 'all'>` —
  TTL curto (ex. 30-60s), mesma invalidação.
- Padrão no service, usando os helpers de `RedisService`
  (`getJson`/`setJson`/`deleteByPrefix`, que fazem `JSON.parse`/`stringify` e
  `EX` por baixo dos panos):
  ```ts
  const cached = await this.redis.getJson<T>(key);
  if (cached) return cached;
  const data = await this.repository.findMany(filters);
  await this.redis.setJson(key, data, CONTRACTS_CACHE_TTL_SECONDS);
  return data;
  ```
- Invalidação: `this.redis.deleteByPrefix('contracts:list:')` (usa `KEYS` +
  `DEL` em lote — aceitável no volume deste teste, evitar em produção real)
  e `this.redis.del(CONTRACTS_SUMMARY_CACHE_KEY)`.

## Job assíncrono (BullMQ)

- Fila `contracts` registrada em `infra/queue/queue.module.ts` via
  `BullModule.registerQueue({ name: 'contracts' })`.
- Job repetível `expire-contracts`, registrado no `onModuleInit` do módulo de
  contracts (ou de queue) via
  `queue.add('expire-contracts', {}, { repeat: { every: EXPIRE_JOB_INTERVAL_MS }, jobId: 'expire-contracts' })`
  — usar `jobId` fixo para não duplicar o job repetível a cada restart da app.
- `EXPIRE_JOB_INTERVAL_MS` via env, default `60000` (1 min) — intervalo curto
  o suficiente para demonstrar o comportamento numa demo/entrevista sem
  precisar esperar horas.
- Processor (`@Processor('contracts')`) implementa `expire-contracts`:
  1. `UPDATE contracts SET status = 'EXPIRED' WHERE status = 'ACTIVE' AND "dueDate" < now()`
     (via `prisma.contract.updateMany`).
  2. Se `count > 0`, invalida o cache de `contracts:summary` e das listagens.
  3. Loga quantos contratos foram marcados como vencidos.
- Job puramente periódico (o README aceita "periódico OU disparado na
  consulta" — periódico já satisfaz o requisito e é mais simples de testar
  de forma determinística).

## Erros e validação

- Pipe global `ZodValidationPipe` (`nestjs-zod`).
- Um único `AllExceptionsFilter` global (`@Catch()`) trata tanto
  `HttpException` quanto erros genéricos — resposta de erro sempre
  `{ statusCode, timestamp, path, method, message }`. O CodeHammer registra
  dois filtros (`AllExceptionsFilter` + `HttpExceptionFilter`), mas como
  `AllExceptionsFilter` é registrado primeiro e usa `@Catch()` sem argumento,
  ele intercepta tudo — o segundo filtro nunca é alcançado (código morto no
  projeto de referência). Aqui um filtro só, correto, sem essa duplicação.
- Mensagens de validação e de negócio em português.

## Variáveis de ambiente (`backend/.env`)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webmais?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=
JWT_EXPIRES_IN_HOURS=8
EXPIRE_JOB_INTERVAL_MS=60000
PORT=3000
FRONTEND_URL=http://localhost:5173
```
