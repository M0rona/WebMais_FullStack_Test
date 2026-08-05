# Gestão de Contratos

[![CI](https://github.com/M0rona/WebMais_FullStack_Test/actions/workflows/ci.yml/badge.svg)](https://github.com/M0rona/WebMais_FullStack_Test/actions/workflows/ci.yml)

Sistema completo de gestão de contratos: cadastro de clientes, contratos com
múltiplos itens, fluxo de aprovação e atualização automática de status via
fila assíncrona.

**Stack:** NestJS 11 + Prisma 7 (PostgreSQL) + Redis + BullMQ no backend;
React 19 + Vite 8 + shadcn/ui (Tailwind v4) no frontend, arquitetura MVVM.
Detalhes de arquitetura e decisões em [`.claude/specs/`](.claude/specs/).

Este projeto nasceu como um teste técnico e foi mantido público como peça
de portfólio, mostrando meu processo do zero ao deploy. O enunciado
original está no fim deste README.

## Deploy

- **Frontend**: https://web-mais-full-stack-test.vercel.app
- **Backend**: https://webmais-backend-gpw0.onrender.com

Stack de deploy: **Render** (backend via Dockerfile + Postgres gerenciado),
**Upstash** (Redis serverless com TLS) e **Vercel** (frontend estático) — free
tier nos três, ver justificativa em `.claude/specs/04-infra-and-delivery.md`.

O backend está no free tier do Render, que hiberna depois de um tempo sem
uso — a primeira requisição depois disso demora alguns segundos (cold start)
enquanto o serviço acorda. Não há tela de cadastro (ver seção abaixo), então
pra testar é preciso um usuário já existente ou registrar um via API.

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

## Arquitetura

Organização por domínio nos dois lados, com camada de apresentação e camada
de lógica bem separadas. Detalhe completo (specs, decisões, exemplos) em
[`.claude/specs/`](.claude/specs/); aqui vai o resumo de como back e front
se organizam.

### Backend (NestJS): modular por domínio

```
backend/src/
  modules/
    clients/          # controller, service, repository, dto
    contracts/
    auth/
  common/              # constants, decorators, dto, filters, guards, interceptors, mappers, types
  infra/
    prisma/            # PrismaModule + PrismaService
    redis/             # RedisModule + RedisService (cache-aside)
    queue/             # registro das filas BullMQ
  app.module.ts
  main.ts
```

- **Controller**: só rotas e decorators, nunca fala com Prisma/Redis direto.
- **Service**: regra de negócio; decide cache hit/miss, enfileira jobs, lança
  as exceptions do Nest (`NotFoundException`, `BadRequestException` etc).
- **Repository**: única camada que importa o `PrismaService`, um método por
  operação de acesso a dado, sem lógica de negócio dentro dele.
- DTOs de entrada são schemas **Zod** (`createZodDto`), não `class-validator`.
- Rotas autenticadas por padrão (guard JWT global); rota pública usa
  `@Public()` explícito, nunca o contrário.

### Frontend (Vite + React): MVVM por componente/página

Cada componente ou página vive em pasta própria (kebab-case), com um trio
fixo de arquivos:

```
client-form-dialog/
  index.tsx                     # wiring: liga model e view, único export default
  client-form-dialog.model.ts   # hook use<Nome>Model: estado, queries, handlers
  client-form-dialog.view.tsx   # apresentação pura, zero chamada a service/store
```

- `index.tsx` recebe as props externas do componente, chama o hook do model
  e repassa o resultado como props pra view.
- `*.model.ts` concentra a lógica: TanStack Query pra estado de servidor,
  `react-hook-form` pra formulário, `useState` pra estado de UI local.
  Exporta o tipo de retorno via `ReturnType`, que vira a base do tipo de
  props da view.
- `*.view.tsx` é só JSX. Quando a view precisa de uma prop puramente visual
  que não faz sentido passar pelo model (ex.: uma variante de estilo), o
  tipo da view estende o do model (`ModelType & { propExtra }`) em vez de
  duplicar o que o model já expõe.
- Estado global de verdade (sessão autenticada) fica em **Zustand**
  (`store/`); estado de servidor nunca é duplicado lá, é sempre TanStack
  Query.
- Páginas de rota em `modules/<domain>/pages/`, componentes reutilizáveis de
  um domínio em `modules/<domain>/components/`, componentes cross-domain em
  `common/components/`.

`clients` e `contracts` seguem exatamente essa mesma estrutura dos dois
lados, então basta olhar um módulo ou componente já existente como
referência antes de criar um novo (há inclusive uma skill de scaffold pra
gerar o trio MVVM automaticamente).

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
- **Swagger não foi adicionado**: decisão consciente, não esquecimento. O
  enunciado do teste não pede documentação de API formal, e os critérios de
  avaliação (Clean Code, modelagem, uso de Postgres/Redis/BullMQ, testes,
  Git) não dependem disso — adicionar `@nestjs/swagger` aqui entraria na
  categoria de dependência/config que o escopo não pediu, o mesmo raciocínio
  usado para descartar RBAC e RabbitMQ/Kafka (ver
  `.claude/specs/00-overview.md`).
- **Paginação por offset (`page`/`limit`), não por cursor**: `GET /contracts`
  e `GET /clients` paginam com `skip`/`take` clássico, não com cursor
  (`WHERE id > :cursor`). Cursor pagination evita o custo O(n) do `OFFSET`
  em tabelas grandes e não sofre deslocamento de página quando um registro é
  inserido/removido durante a navegação — seria a escolha certa em escala de
  produção real, especialmente para scroll infinito. Mas cursor não permite
  "ir direto pra página N" nem contagem total barata, que é exatamente o que
  a listagem atual usa (tabela com número de páginas, `totalPages`
  calculado). No volume esperado deste teste (script de seed com ~100
  registros), o custo do `OFFSET` é irrelevante, então offset pagination é a
  escolha pragmática aqui.
- **`PATCH /contracts/:id` aceita `items` opcional e substitui a lista inteira
  numa única transação** (`ContractRepository.updateWithItems`), em vez de o
  cliente chamar os endpoints granulares de item (`POST`/`PATCH`/`DELETE
  /contracts/:id/items/...`) um por um. Uma revisão pós-entrega apontou que o
  frontend fazia exatamente isso — `update()` do contrato seguido de um loop
  de `deleteItem`/`updateItem`/`addItem` por item alterado, várias requisições
  HTTP independentes sem transação nem rollback: uma falha no meio do loop
  deixava o contrato com itens parcialmente alterados. Os endpoints
  granulares continuam existindo (API mais flexível para outros clientes),
  mas o form de edição do frontend usa só o `PATCH` em lote.

## Uso de IA

A maior parte do código deste projeto foi escrita pelo **Claude Code**, mas
não como "pedi e aceitei o que veio". A arquitetura, o que entrava em cada
commit, as bibliotecas escolhidas e a revisão do resultado foram decisão
minha o tempo todo; a IA foi a mão no teclado, guiada de perto. Em alguns
pontos entrei direto no código também, quando era mais rápido ajustar do que
descrever o ajuste. Resumo honesto de como foi o processo:

- **Estruturação inicial**: pedi pra estruturar `.claude/` (regras em
  `CLAUDE.md`, skills de scaffold, specs de domínio/banco/backend/frontend/
  infra/testes) antes de escrever qualquer código, usando como referência de
  arquitetura outro projeto meu ([CodeHammer](https://github.com/M0rona/CodeHammer)).
  Fui eu quem definiu essa referência e os padrões (módulo por domínio no
  backend, trio MVVM no frontend); a IA formalizou em texto o que eu já tinha
  decidido, e eu revisei regra por regra antes de aceitar. As specs em
  `.claude/specs/` foram atualizadas ao longo do desenvolvimento sempre que
  uma decisão de implementação divergia do plano original: ficaram como
  registro vivo das decisões, não um documento estático.
- **Implementação**: a maior parte do código (backend, frontend, testes,
  Dockerfiles, CI) foi gerada pela IA sob acompanhamento direto meu, em
  commits pequenos e granulares que eu revisava, com lint, typecheck e teste
  rodando a cada pedaço antes de cada commit (não só no final).
- **Decisões técnicas que exigiram investigação real**, não só geração de
  código: TypeScript foi pinado em 5.9 (não a major mais nova, 7) porque
  `typescript-eslint` e `ts-jest` ainda não suportam a 7; Prisma 7 mudou
  bastante de arquitetura (driver adapter obrigatório, sem mais `url` no
  `datasource` do schema) e isso foi descoberto rodando `prisma generate` de
  verdade contra o erro, não assumido de antemão; um bug real no `@swc/jest`
  (pânico do Rust ao compilar o client do Prisma dentro de um teste do Nest)
  levou à troca por `ts-jest`; o client gerado do Prisma precisou ficar
  dentro de `src/` porque o build via SWC só compila esse diretório (descoberto
  testando o boot real da aplicação compilada com `node dist/main.js`, não só
  o `pnpm build` passando). A IA investigou e propôs cada caminho, mas qual
  seguir foi decisão minha em cada um desses casos.
- **Verificação real, não só "parece certo"**: os Dockerfiles foram
  efetivamente buildados e a stack completa (`docker compose --profile full up`)
  foi testada de ponta a ponta, incluindo dois bugs que só apareceram no
  build real (ordem do `prisma generate` no Dockerfile, `DATABASE_URL`
  ausente em build time). O frontend foi testado no navegador de verdade
  (Chrome via automação) cobrindo o fluxo completo: login, criar contrato
  com itens (conferindo o cálculo do total em tempo real), aprovar, encerrar,
  bloqueio de exclusão de cliente com contrato vinculado, logout e proteção
  de rota (não apenas `pnpm build` sem erro).
- **Onde intervim diretamente**: pedi correções de arquitetura durante a
  estruturação inicial (regra de extensão de tipo view/model no MVVM, mover
  specs para dentro de `.claude/`, promover os diferenciais de "bônus
  condicional" para escopo obrigatório), cobrei disciplina de commits
  pequenos por unidade lógica várias vezes ao longo da sessão, e em alguns
  pontos pontuais (ex.: um ajuste de classe Tailwind no seletor de idioma do
  header, formatação do `tsconfig.app.json`) simplesmente editei o arquivo eu
  mesmo em vez de pedir pra IA.
- **Rodada de revisão pós-entrega**: depois da entrega inicial, fiz uma
  revisão manual de código (back e front) e levantei ~40 pontos: bugs reais
  encontrados testando a UI, pedidos de reestruturação e perguntas de
  arquitetura. Antes de qualquer mudança, pedi um plano discutido e revisado
  em conjunto (Plan Mode) e só autorizei a execução depois de concordar com
  ele; a execução em si rodou depois em fases por múltiplos agentes em
  paralelo (backend e reestruturação de frontend simultâneos, componentes de
  contrato depois). Cada bug relatado foi confirmado por causa raiz no
  código antes do fix, e revalidado ao vivo no navegador depois (não só
  "parece resolvido").
- **i18n bilíngue (pt-BR/en)**, adicionado por último de propósito (depois da
  base estabilizada): `nestjs-i18n` no backend, `react-i18next` no frontend,
  idioma padrão pela localidade do navegador. Um bug real apareceu na
  verificação ao vivo: com `nonExplicitSupportedLngs: true`, o i18next reduz
  qualquer código pra sua parte de idioma (`pt-BR` → `pt`) antes de checar
  contra `supportedLngs`; como minha lista usava o código completo
  (`['pt-BR', 'en']`), `pt-BR` deixava de bater com ela mesma, zerando a
  hierarquia de resolução e fazendo todo `t()` cair no fallback (a chave
  crua) mesmo com os recursos carregados corretamente na store interna. Só
  foi encontrado inspecionando o estado da instância de i18next ao vivo no
  navegador (`i18n.services.languageUtils.toResolveHierarchy(...)`), não
  seria visível só lendo o código.
- **Segunda rodada de ajustes pontuais**: lote de 9 correções pequenas
  pedidas em sequência (não uma feature só), cada uma definida e priorizada
  por mim antes de qualquer edição: reorganização de pastas (`i18n` saiu da
  raiz de `src/` pra `lib/` no front e `infra/` no back; componentes shadcn
  saíram de `components/ui/` pra `common/components/shadcn/`), conversão de
  três componentes wrapper (`Button`, `InputField`, `NumberField`) pro trio
  MVVM, busca de cliente e paginação (tanto no modal de seleção de cliente
  quanto na listagem `/clients`) trocando filtro em memória por
  `GET /clients?search=&page=` de verdade, e um script de seed com ~100
  clientes/contratos. Feito em Plan Mode com pesquisa paralela (3 agentes
  Explore) antes de qualquer edição. Dois achados que só apareceram
  investigando/testando, não só lendo o pedido: o "ERROR" no log do teste do
  `AllExceptionsFilter` não era bug (o teste lança um erro de propósito; só
  faltava mockar o `Logger`); o "\*" de campo obrigatório aparecia longe do
  texto por causa do `flex items-center gap-2` do `Label` do shadcn tratando
  o asterisco como um segundo item flex, não por falta de espaço no JSX. E um
  bug real introduzido pela própria reorganização foi pego só ao subir a
  aplicação de verdade (não só `pnpm build`/`pnpm test`): mover `src/i18n/`
  pra `src/infra/i18n/` no backend quebrou o boot em `nest start:dev`/produção
  porque o `nest-cli.json` ainda apontava os assets pro caminho antigo, então
  o `dist/` saía sem os JSONs de tradução.
- **Terceira rodada, máscara de CPF/CNPJ no cadastro de cliente**: pedi pra
  formatar o documento em tempo real enquanto o usuário digita, reusando a
  mesma função de formatação já usada na listagem, tanto no cadastro quanto
  na edição. A IA generalizou `formatDocument` pra formatar progressivamente
  (não só em documentos completos de 11/14 dígitos) e ligou isso ao
  formulário via `react-hook-form`, mas fui eu quem decidiu que a máscara
  tinha que ser a mesma função da listagem (não uma nova, duplicada) e quem
  validou ao vivo no navegador que CPF e CNPJ formatam corretamente em cada
  estágio da digitação, e que só os dígitos (sem pontuação) chegam pra API.
  Nessa mesma sessão também ajustei eu mesmo, sem passar pela IA, o
  `w-[130px]` do seletor de idioma do header pra `w-32.5` (utilitário nativo
  do Tailwind v4) e a formatação do `tsconfig.app.json`, em commit separado.

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
