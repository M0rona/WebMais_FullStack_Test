# WebMais — Gestão de Contratos

Módulo de gestão de contratos (cadastro de clientes, contratos com itens,
controle de status Rascunho/Ativo/Vencido/Encerrado) desenvolvido para o
teste técnico da WebMais. Enunciado original preservado no fim deste arquivo.

**Stack:** NestJS 11 + Prisma 7 (PostgreSQL) + Redis + BullMQ no backend;
React 19 + Vite 8 + shadcn/ui (Tailwind v4) no frontend, arquitetura MVVM.
Detalhes de arquitetura e decisões em [`.claude/specs/`](.claude/specs/).

## Como rodar (desenvolvimento)

Pré-requisitos: Node 24+, pnpm, Docker.

```bash
# 1. Infra (Postgres + Redis)
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
pnpm install
pnpm prisma:migrate
pnpm start:dev          # http://localhost:3000

# 3. Frontend (em outro terminal)
cd frontend
cp .env.example .env
pnpm install
pnpm dev                # http://localhost:5173
```

Não há tela de cadastro de usuário no frontend (só login — decisão de
escopo, ver `.claude/specs/03-frontend.md`). Crie o primeiro usuário via API:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@webmais.com","password":"123456"}'
```

## Como rodar tudo com Docker

Além do `docker-compose up -d` (só infra), dá pra subir o sistema inteiro
(backend + frontend + Postgres + Redis) com um comando, usando os
Dockerfiles da aplicação:

```bash
docker compose --profile full up -d --build
```

Backend em `http://localhost:3000`, frontend em `http://localhost:5173`.

## Testes

```bash
# backend (unit + e2e — precisa do Postgres/Redis do docker-compose no ar)
cd backend && pnpm test && pnpm test:e2e

# frontend
cd frontend && pnpm test
```

CI (`.github/workflows/ci.yml`) roda lint, typecheck, testes e build dos
dois projetos em todo push/PR para `main`.

## Variáveis de ambiente

Ver `backend/.env.example` e `frontend/.env.example`.

## Diferenciais implementados

- [x] Dockerfile da aplicação (multi-stage, além do docker-compose de infra)
- [ ] Deploy em cloud — não feito ainda; plano em `.claude/specs/04-infra-and-delivery.md`
- [x] Testes automatizados (backend: Jest unit + e2e; frontend: Vitest)
- [x] Pipeline de CI (lint/typecheck/test/build no GitHub Actions)
- [ ] RabbitMQ/Kafka no lugar do BullMQ — deliberadamente não feito: o
      enunciado lista BullMQ como stack **obrigatória** e esse diferencial
      como alternativa a ela, são mutuamente excludentes
- [x] Domínio de negócio mais rico: tipo de contrato (`SERVICE`/`SUPPLY`/`LEASE`)
      e fluxo de aprovação (`DRAFT → ACTIVE`, exige ao menos um item)
- [x] Editar/excluir cliente (CRUD completo, não só criar/listar)
- [x] Itens do contrato: múltiplos itens por contrato, valor total sempre
      derivado da soma dos itens (nunca um campo editável direto)

## Decisões técnicas

- **Client gerado do Prisma vive dentro de `src/`** (`src/generated/prisma`,
  reexportado por um barrel único em `backend/src/infra/prisma/prisma-client.ts`
  — todo o resto do app importa daqui, não do caminho gerado diretamente, então
  se o Prisma mudar o output de novo só esse arquivo muda). O motivo de ficar
  dentro de `src/` e não em `backend/generated/` (mais convencional) é que o
  build de produção usa SWC (via `nest-cli.json`), e o SWC só compila o
  diretório `src/` — um client gerado fora dele não entra no `dist/`, e
  `node dist/main.js` quebra em produção com "module not found". Isso foi
  descoberto testando o boot real da aplicação compilada, não assumido de
  antemão.
- **Número do contrato usa uma sequence do Postgres (`contract_number_seq`),
  não `count() + 1`**: `ContractRepository.generateNumber()` faz
  `SELECT nextval('contract_number_seq')`, que o Postgres garante ser atômico
  entre conexões concorrentes. Um `count() + 1` (ou até um `findFirst` +
  incremento em JS) tem uma janela de corrida real — duas criações de
  contrato ao mesmo tempo podem ler a mesma contagem antes de qualquer uma
  escrever, gerando números duplicados. A sequence é criada manualmente na
  migration inicial (`CREATE SEQUENCE "contract_number_seq" START 1;`), já
  que não existe um jeito idiomático de declarar isso no `schema.prisma`.

## Uso de IA

Todo o projeto foi desenvolvido com o **Claude Code**, de forma bem
integrada ao processo (não só autocomplete pontual). Resumo honesto de como:

- **Estruturação inicial**: pedi pra estruturar `.claude/` (regras em
  `CLAUDE.md`, skills de scaffold, specs de domínio/banco/backend/frontend/
  infra/testes) antes de escrever qualquer código, usando como referência de
  arquitetura outro projeto meu ([CodeHammer](https://github.com/M0rona/CodeHammer)).
  As specs em `.claude/specs/` foram atualizadas ao longo do desenvolvimento
  sempre que uma decisão de implementação divergiu do plano original —
  ficaram como registro vivo das decisões, não um documento estático.
- **Implementação**: todo o código (backend, frontend, testes, Dockerfiles,
  CI) foi gerado pela IA, em commits pequenos e granulares, com lint,
  typecheck e teste rodando a cada pedaço antes de cada commit — não só no
  final.
- **Decisões técnicas que exigiram investigação real**, não só geração de
  código: TypeScript foi pinado em 5.9 (não a major mais nova, 7) porque
  `typescript-eslint` e `ts-jest` ainda não suportam a 7; Prisma 7 mudou
  bastante de arquitetura (driver adapter obrigatório, sem mais `url` no
  `datasource` do schema) e isso foi descoberto rodando `prisma generate` de
  verdade contra o erro, não assumido de antemão; um bug real no `@swc/jest`
  (pânico do Rust ao compilar o client do Prisma dentro de um teste do Nest)
  levou à troca por `ts-jest`; o client gerado do Prisma precisou ficar
  dentro de `src/` porque o build via SWC só compila esse diretório —
  descoberto testando o boot real da aplicação compilada (`node dist/main.js`),
  não só o `pnpm build` passando.
- **Verificação real, não só "parece certo"**: os Dockerfiles foram
  efetivamente buildados e a stack completa (`docker compose --profile full up`)
  foi testada de ponta a ponta, incluindo dois bugs que só apareceram no
  build real (ordem do `prisma generate` no Dockerfile, `DATABASE_URL`
  ausente em build time). O frontend foi testado no navegador de verdade
  (Chrome via automação) cobrindo o fluxo completo: login, criar contrato
  com itens (conferindo o cálculo do total em tempo real), aprovar, encerrar,
  bloqueio de exclusão de cliente com contrato vinculado, logout e proteção
  de rota — não apenas `pnpm build` sem erro.
- **Onde eu intervim diretamente**: pedi correções de arquitetura durante a
  estruturação inicial (regra de extensão de tipo view/model no MVVM,
  mover specs para dentro de `.claude/`, promover os diferenciais de
  "bônus condicional" para escopo obrigatório) e cobrei disciplina de
  commits pequenos por unidade lógica várias vezes ao longo da sessão.

## Enunciado original do desafio

<details>
<summary>Clique para expandir</summary>

## :WebMais_Full_Stack: Sobre o desafio

Neste desafio você vai construir uma versão simplificada de um módulo de **Gestão de Contratos**: cadastro de contratos com controle de status (Ativo / Vencido / Encerrado) :scroll:.

Stack obrigatória:
* Backend: **Node.js + TypeScript**, API REST
* Frontend: **React + Vite**
* Banco: **PostgreSQL**
* **Redis** (cache) e **BullMQ** (processamento assíncrono)

O escopo foi pensado para caber em **um dia de trabalho (6 a 8h)**. Não precisa de tela bonita nem cobrir todo caso de borda — priorize um fluxo funcional e código limpo.

## :heavy_check_mark: Requisitos mínimos

* Frontend
  * [x] Login (pode usar usuário/senha fixos ou um cadastro simples)
  * [x] Cadastrar cliente (nome e documento) para vincular aos contratos
  * [x] Listar contratos (número, cliente, valor, vencimento, status)
  * [x] Cadastrar novo contrato, selecionando o cliente
  * [x] Editar um contrato
  * [x] Excluir um contrato
  * [x] Encerrar um contrato manualmente, com feedback visual da mudança
  * [x] Ver um resumo/contagem de contratos por status (Ativos / Vencidos / Encerrados)
  * [x] Logoff

* Backend
  * [x] Todas as operações do front expostas via API REST
  * [x] Autenticação via Token JWT
  * [x] Persistência em PostgreSQL, com contrato relacionado a um cliente
  * [x] Cache em Redis para a listagem de contratos (ou para o resumo por status)
  * [x] Job assíncrono com BullMQ: ao vencer a data de um contrato, atualizar seu status automaticamente para "Vencido" (pode ser um job periódico ou disparado no cadastro/consulta)

* Geral
  * [x] Git com histórico de commits organizado
  * [x] `docker-compose` subindo Postgres e Redis
  * [x] README explicando como rodar o projeto
  * [x] Relatar no README se/onde usou ferramentas de IA (Claude Code, Copilot, etc.) durante o desenvolvimento — não é demérito, queremos entender como você usa essas ferramentas
  * [ ] Subir o projeto no github e encaminhar o link do repositóiro para o contato do RH da WebMais (Em até 5 dias)

## :sparkles: Diferenciais (bônus, não obrigatório)

* [x] Dockerfile da aplicação (além do docker-compose de infra)
* [ ] Deploy em alguma cloud
* [x] Testes automatizados
* [x] Pipeline de CI simples (lint/test no GitHub Actions)
* [ ] Uso de RabbitMQ/Kafka no lugar do BullMQ
* [x] Domínio de negócio mais rico (múltiplos tipos de contrato, fluxo de aprovação, dados financeiros)
* [x] Editar/excluir cliente
* [x] Itens do contrato (múltiplos itens/produtos por contrato, com valor total calculado a partir da soma dos itens)

## :green_heart: Critérios de avaliação

* [ ] Qualidade de código (Clean Code, SOLID)
* [ ] Organização e estrutura do projeto
* [ ] Modelagem do banco de dados (schema, relacionamentos, tipos)
* [ ] Uso correto de PostgreSQL, Redis e BullMQ
* [ ] Features funcionais conforme requisitos mínimos
* [ ] Tratamento de erros
* [ ] Boas práticas de Git
* [ ] Uso de ferramentas de IA no processo de desenvolvimento

</details>
