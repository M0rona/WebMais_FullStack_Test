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
```

## Auth

- `POST /auth/register` — `{ name, email, password }` → cria `User` (senha
  com `bcrypt`, custo 10), retorna `{ accessToken, user }`.
- `POST /auth/login` — `{ email, password }` → valida credenciais, retorna
  `{ accessToken, user }`.
- Guard JWT global (`JwtAuthGuard` aplicado via `APP_GUARD` em `AppModule`,
  como no CodeHammer) + decorator `@Public()` nas rotas de auth.
- Payload do JWT: `{ sub: userId, email }`, expiração configurável via env
  `JWT_EXPIRES_IN` (default `8h`).
- `GET /auth/me` — retorna o usuário autenticado (usado pelo frontend para
  restaurar sessão a partir do token salvo).

## Clients

CRUD completo:

- `POST /clients` — cria cliente (`name`, `document` validado com dígito
  verificador de CPF/CNPJ no Zod schema).
- `GET /clients` — lista clientes (usado no select do form de contrato).
- `GET /clients/:id` — detalhe.
- `PATCH /clients/:id` — edita `name`/`document`.
- `DELETE /clients/:id` — remove cliente; se houver contrato vinculado, o
  Postgres rejeita por FK (`onDelete: Restrict`) — o service captura e
  relança como `BadRequestException('Cliente possui contratos vinculados e não pode ser excluído')`.

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
- Padrão no service:
  ```ts
  const cached = await this.redis.get(key);
  if (cached) return JSON.parse(cached);
  const data = await this.repository.findMany(filters);
  await this.redis.set(key, JSON.stringify(data), 'EX', TTL_SECONDS);
  return data;
  ```
- Invalidação: `await this.redis.del(key)` (ou `keys('contracts:list:*')` +
  `del` em lote se cachear múltiplas combinações de filtro — para o volume
  deste teste, um `del` por padrão de chave conhecida é suficiente; evitar
  `KEYS` em produção real, mas aceitável aqui dado o escopo).

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
- Filtros globais de exception (`AllExceptionsFilter` + `HttpExceptionFilter`,
  padrão do CodeHammer) — resposta de erro sempre
  `{ statusCode, timestamp, path, method, message }`.
- Mensagens de validação e de negócio em português.

## Variáveis de ambiente (`backend/.env`)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webmais?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=
JWT_EXPIRES_IN=8h
EXPIRE_JOB_INTERVAL_MS=60000
PORT=3000
FRONTEND_URL=http://localhost:5173
```
