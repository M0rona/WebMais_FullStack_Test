# 05 — Testes

Testes fazem parte do escopo firme deste projeto (diferencial promovido a
obrigatório — ver `.claude/specs/00-overview.md`), não um extra condicional.

## Backend (Jest)

Transform via **ts-jest**, não `@swc/jest`. SWC continua sendo o builder do
`nest-cli.json` (build/dev, rápido), mas `@swc/jest` entra em pânico (bug no
renderizador de diagnósticos `miette` do swc) ao compilar o client gerado do
Prisma 7 dentro de um `Test.createTestingModule` do Nest — reproduzido de
forma isolada, não é algo do nosso código. Como já pinamos TypeScript 5.9
(compatível com o teto `<7` do `ts-jest`), usar `ts-jest` só para testes
evita o bug sem abrir mão de nada.

**Unitários dos services** — o alvo principal, maior retorno por esforço:

- `contracts.service`: transições de status (`DRAFT→ACTIVE` exige item,
  `ACTIVE/EXPIRED→CLOSED`, bloqueio de edição em `CLOSED`, bloqueio de
  aprovar sem item), recálculo de `value` a partir dos itens, comportamento
  de cache-aside (mockar `RedisService`: hit não chama o repository, miss
  chama e grava, escrita invalida).
- `clients.service`: bloqueio de exclusão com contrato vinculado — verifica
  a contagem de contratos do cliente antes de excluir (não depende de
  capturar erro de FK do driver).
- `auth.service`: hash de senha, rejeição de credencial inválida, geração de
  token.
- `document.util` (validador de CPF/CNPJ): função pura, fácil 100% de
  cobertura — CPF/CNPJ válido, dígito verificador errado, todos os dígitos
  iguais, tamanho inválido.
- Repository e Prisma são mockados nos testes de service — service é a
  unidade sob teste, não o banco.

**E2E (supertest)** — fluxo real contra banco de teste (Postgres do
`docker-compose`, schema isolado ou banco `webmais_test`):

- Registro + login retornando token válido.
- Criar contrato com itens → `value` bate com a soma esperada.
- Aprovar contrato sem item → 400. Aprovar com item → 200 e status `ACTIVE`.
- Encerrar contrato → status `CLOSED`, edição depois disso → 400.
- Rota protegida sem token → 401.

Rodar com `pnpm test` (unit) e `pnpm test:e2e` — ambos precisam passar no CI.

## Frontend (Vitest + Testing Library)

Foco nos `.model.ts` — é onde a lógica mora no padrão MVVM deste projeto, e
são hooks isolados, testáveis com `renderHook` sem precisar montar a view:

- `contract-form-dialog.model`: cálculo de total ao adicionar/remover/editar
  item, validação Zod do form, submit chamando o service correto (create vs.
  update conforme `contract` recebido via prop).
- `contract-list.model`: montagem correta dos filtros pro service, handler de
  aprovar/encerrar/excluir chamando a mutation certa e invalidando as queries
  certas.
- `use-auth` (ou equivalente): login/logout atualizando o `auth-store`
  corretamente.

Mockar `*.service.ts` (não o `axios` diretamente) nos testes de model — o
service já é o boundary certo pra isolar. Views (JSX puro) não precisam de
teste próprio a menos que tenham lógica condicional de renderização não
trivial — nesse caso, um teste leve de render com Testing Library basta.

## O que não precisa de teste

Getters/setters triviais, mappers puramente estruturais (só reformatam
campos), `index.tsx` (é fiação, sem lógica própria) e código gerado pelo
shadcn CLI (`common/components/ui/*`).
