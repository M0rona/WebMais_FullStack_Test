# 01 — Banco de dados (Prisma / PostgreSQL)

## Schema

O Prisma 7 mudou a arquitetura do client: motor Rust removido, driver adapter
obrigatório, e a URL de conexão não fica mais no `datasource` do schema — vai
em `backend/prisma.config.ts` (`defineConfig` de `prisma/config`, campo
`datasource.url`). O `generator` usa `provider = "prisma-client"` com
`output` explícito (aqui, `../generated/prisma`, **não versionado no Git** —
regenerado via `prisma generate`, que já roda automaticamente no
`postinstall`). O runtime instancia o client com `@prisma/adapter-pg`:

```ts
// src/infra/prisma/prisma.service.ts (resumo)
const adapter = new PrismaPg({ connectionString: configService.getOrThrow('DATABASE_URL') });
super({ adapter });
```

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Client {
  id        String   @id @default(uuid())
  name      String
  document  String   @unique   // CPF ou CNPJ, sem formatação (só dígitos)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  contracts Contract[]

  @@map("clients")
}

model Contract {
  id        String         @id @default(uuid())
  number    String         @unique
  type      ContractType   @default(SERVICE)
  value     Decimal        @db.Decimal(12, 2)  // derivado: soma dos itens, recalculado a cada write de item
  dueDate   DateTime
  status    ContractStatus @default(DRAFT)
  closedAt  DateTime?
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  clientId String
  client   Client @relation(fields: [clientId], references: [id], onDelete: Restrict)

  items ContractItem[]

  @@index([status])
  @@index([dueDate])
  @@index([clientId])
  @@map("contracts")
}

model ContractItem {
  id          String   @id @default(uuid())
  description String
  quantity    Decimal  @db.Decimal(10, 2)
  unitValue   Decimal  @db.Decimal(12, 2)
  subtotal    Decimal  @db.Decimal(12, 2)  // quantity * unitValue, persistido para evitar recalcular em toda leitura
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  contractId String
  contract   Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)

  @@index([contractId])
  @@map("contract_items")
}

enum ContractType {
  SERVICE       // prestação de serviço
  SUPPLY        // fornecimento
  LEASE         // locação
}

enum ContractStatus {
  DRAFT
  ACTIVE
  EXPIRED
  CLOSED
}
```

## Notas de modelagem

- `document` é `@unique` em `Client` — evita cliente duplicado; validação de
  dígito verificador de CPF/CNPJ fica no DTO Zod do backend (ver
  `.claude/specs/02-backend.md`).
- `onDelete: Restrict` em `Contract.client` — não deixa apagar um cliente que
  tem contrato vinculado. O service de `clients` deve traduzir a violação de
  FK do Postgres numa `BadRequestException` com mensagem clara em português,
  não deixar vazar o erro cru do Prisma.
- `onDelete: Cascade` em `ContractItem.contract` — apagar um contrato apaga
  seus itens junto (não faz sentido item órfão).
- `value` (Contract) e `subtotal` (ContractItem) como `Decimal`, nunca
  `Float` — evita erro de arredondamento monetário. Serializar para `Number`
  explicitamente no mapper de resposta, nunca deixar o `Decimal` do Prisma
  vazar cru pro JSON.
- `Contract.value` é uma **cópia derivada e persistida** da soma de
  `ContractItem.subtotal` — não é a fonte de verdade (os itens são), é uma
  otimização de leitura para listagem/resumo não precisar agregar itens a
  cada request. Toda escrita em `ContractItem` (criar/editar/excluir item)
  recalcula e grava `Contract.value` na mesma transação (`prisma.$transaction`).
- Índices em `status` e `dueDate`: o job do BullMQ varre
  `WHERE status = 'ACTIVE' AND dueDate < now()`. Os dois índices simples
  cobrem isso razoavelmente para o volume de um teste técnico; um índice
  composto `@@index([status, dueDate])` seria a próxima otimização caso o
  volume de contratos cresça.
- `number` (número do contrato) é único e **autogerado** no backend (ex.
  `CTR-0001`, sequencial) — mais simples de garantir unicidade do que pedir
  ao usuário para digitar, e mais "profissional" na demo.
- Contrato nasce em `DRAFT` (ver `.claude/specs/00-overview.md`), com itens
  cadastrados nesse estado; a ação "aprovar" exige pelo menos 1 item antes de
  permitir a transição para `ACTIVE`.

## Migrations

Rodar `pnpm prisma:migrate` (alias para `prisma migrate dev`) a partir de
`backend/`, com o Postgres do `docker-compose` já no ar. Versionar as
migrations geradas (`backend/prisma/migrations/`) no Git — não adicionar ao
`.gitignore`.
