---
name: scaffold-backend-module
description: Gera um módulo NestJS completo (controller, service, repository, dto, module) seguindo o padrão arquitetural deste repositório — use ao criar um novo domínio no backend (ex. clients, contracts) ou ao adicionar uma entidade nova que precisa de CRUD via API REST.
---

# Scaffold de módulo backend (NestJS)

Gera a estrutura de um novo módulo de domínio em `backend/src/modules/<domain>/`
seguindo exatamente o padrão descrito em `CLAUDE.md` e usado nos módulos
existentes do projeto. Antes de gerar, leia um módulo já existente no repo (se
houver) para replicar o estilo exato.

## Quando usar

O usuário pede para criar um novo recurso/domínio no backend (ex.: "cria o
módulo de clientes", "preciso de CRUD de contratos").

## Passos

1. Pergunte-se (ou infira do pedido) o nome do domínio no singular em inglês
   (ex.: `client`, `contract`) e o plural para a pasta/rota (ex.: `clients`).
2. Confirme o schema Prisma da entidade já existe em `backend/prisma/schema.prisma`
   (`.claude/specs/01-database.md` é a fonte de verdade). Se não existir, crie o
   model Prisma primeiro e rode a migration antes de gerar o módulo.
3. Crie os arquivos abaixo. Não pule nenhuma camada mesmo que pareça
   redundante para um CRUD simples — é o padrão do projeto.

### `dto/<domain>.dto.ts`

Zod schemas para create/update + `createZodDto` (padrão `nestjs-zod`) + tipos
inferidos exportados (`z.infer<typeof Schema>`). Mensagens de validação em
português.

```ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const Create<Domain>Schema = z.object({
  // campos com validação e mensagens em pt-BR
});

export const Update<Domain>Schema = Create<Domain>Schema.partial();

export class Create<Domain>Dto extends createZodDto(Create<Domain>Schema) {}
export class Update<Domain>Dto extends createZodDto(Update<Domain>Schema) {}

export type Create<Domain>DtoType = z.infer<typeof Create<Domain>Schema>;
export type Update<Domain>DtoType = z.infer<typeof Update<Domain>Schema>;
```

### `repositories/<domain>.repository.ts`

Único arquivo do módulo que importa `PrismaService`. Um método por operação
(`create`, `findMany`, `findOne`, `update`, `delete`, mais os métodos
específicos do domínio, ex. `countByStatus`). Sem regra de negócio aqui —
apenas queries Prisma.

### `<domain>.service.ts`

Regras de negócio: valida invariantes, lança `NotFoundException` /
`BadRequestException` do Nest quando aplicável, orquestra
repository + cache Redis (se o módulo usa cache) + fila BullMQ (se aplicável).
Nunca importa `PrismaService` diretamente — só o repository.

### `<domain>.controller.ts`

Só rotas HTTP: decorators (`@Controller`, `@Get`, `@Post`, `@Patch`,
`@Delete`), `@Public()` quando a rota não exige autenticação, injeta e chama
o service. Sem lógica de negócio.

### `<domain>.module.ts`

Registra controller, service e repository. Importa `PrismaModule` (via
`infra/prisma`) e, se necessário, `RedisModule`/`BullMQ` register.

4. Registre o novo módulo em `backend/src/app.module.ts`.
5. Escreva testes unitários do `service` (Jest, mockando repository e, se
   houver, Redis/queue) cobrindo as regras de negócio e transições de status
   — ver `.claude/specs/05-testing.md`. Testes fazem parte da entrega, não são
   opcionais.
6. Rode `pnpm lint`, `pnpm build` e `pnpm test` dentro de `backend/` para
   validar antes de considerar a tarefa concluída (ou use a skill
   `verify-before-commit`).
7. Se o módulo expõe uma listagem que deveria ter cache (ver
   `.claude/specs/02-backend.md`), implemente o padrão cache-aside no service:
   tenta ler do Redis → se miss, busca no repository → grava no Redis com TTL
   → invalida a chave em qualquer operação de escrita do mesmo domínio.
