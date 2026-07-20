# 03 — Frontend (Vite + React + MVVM + shadcn)

Padrão de pastas/MVVM: ver `CLAUDE.md` → "Frontend (Vite + React)". Use a
skill `scaffold-frontend-view` para gerar cada página/componente novo.

## Estrutura

```
frontend/src/
  modules/
    auth/
      pages/login/
      services/auth.service.ts
    clients/
      pages/client-list/
      components/client-form-dialog/
      services/client.service.ts
    contracts/
      pages/contract-list/
      components/contract-form-dialog/
      components/contract-item-list/
      components/contract-status-badge/
      components/contract-type-badge/
      components/contract-summary-cards/
      services/contract.service.ts
  common/
    components/
      ui/              # shadcn (button, card, dialog, table, input, ...)
      header/
      protected-route.tsx
    services/api.service.ts     # instância axios + interceptor de auth/erro
    hooks/
    utils/
    types/
    constants/
  store/
    auth-store.ts        # zustand: user, token, setAuth, clearAuth
  App.tsx
  main.tsx
```

## Rotas

| Rota                | Página            | Protegida |
|----------------------|-------------------|-----------|
| `/login`             | `auth/pages/login`| não       |
| `/`                  | redirect → `/contracts` | sim  |
| `/contracts`         | `contracts/pages/contract-list` (inclui cards de resumo por status) | sim |
| `/clients`           | `clients/pages/client-list` | sim |

Criar/editar contrato e criar cliente usam **Dialog do shadcn** em vez de rota
própria (menos código, mais rápido de entregar, consistente com o "não precisa
de tela bonita, priorize fluxo funcional" do enunciado) — mas com bom
acabamento visual via shadcn.

## Telas / componentes principais

- **`login`**: form (email, senha) com `react-hook-form` + `zod`, chama
  `authService.login`, salva token via `auth-store` (zustand), redireciona.
- **`header`** (`common/components/header`): nome do usuário logado + botão
  de logout (`common/components/header/header.model.ts` chama
  `authStore.clearAuth()` e redireciona pro login).
- **`contract-list`**: `contract-summary-cards` (contagem Rascunho/Ativos/
  Vencidos/Encerrados, via `GET /contracts/summary`) + tabela (shadcn `Table`)
  com número, cliente, tipo (`contract-type-badge`), valor (derivado dos
  itens), vencimento, status (`contract-status-badge` com cor por status),
  ações contextuais por status: `DRAFT` → editar/aprovar/excluir; `ACTIVE`/
  `EXPIRED` → editar/encerrar/excluir; `CLOSED` → só visualizar. Excluir,
  aprovar e encerrar usam `AlertDialog` de confirmação do shadcn (evita
  clique acidental em ação destrutiva ou irreversível).
- **`contract-form-dialog`**: form com `react-hook-form` + `zod` — cliente
  (select, populado via `GET /clients`), tipo (select `ContractType`),
  vencimento, e `contract-item-list` (lista dinâmica de itens: descrição,
  quantidade, valor unitário; adicionar/remover linha; subtotal por linha e
  total geral calculados no client em tempo real espelhando a regra do
  backend). Mesmo componente serve para criar e editar (recebe `contract?`
  como prop opcional no `index.tsx`/model). O total exibido é sempre a soma
  dos itens — nunca um campo de valor editável à parte.
- **`client-list`**: tabela de clientes com CRUD completo — `client-form-dialog`
  para criar/editar, `AlertDialog` de confirmação para excluir (mostrando a
  mensagem do backend caso o cliente tenha contratos vinculados).
- Ações de mudança de status (aprovar, encerrar): feedback visual imediato —
  `toast` de sucesso (`sonner`, já usado no CodeHammer) + invalidação de
  query (`queryClient.invalidateQueries(['contracts'])` e
  `['contracts', 'summary']`) para refletir a badge de status na hora.

## Estado

- **TanStack Query** para tudo que vem do backend: `contracts`, `clients`,
  `contracts/summary`, `auth/me`. Chaves de query centralizadas por domínio
  no próprio `*.service.ts` ou em um `query-keys.ts` por módulo se a lista
  crescer.
- **Zustand** só para `auth-store` (token + usuário atual, persistido em
  `localStorage` via middleware `persist` do zustand — simplificação
  documentada em `.claude/specs/00-overview.md`, sem refresh token).
- **React Hook Form + Zod** para todo formulário — schema Zod compartilhável
  entre validação de form e (idealmente) espelhando o schema do backend nos
  campos, sem precisar ser o mesmo código.

## shadcn/ui

Inicializar com `npx shadcn@latest init` (style `new-york`, base color
`neutral`, `cssVariables: true`, alias `@/*` apontando para `src/*`, igual ao
`components.json` do CodeHammer). Componentes esperados, adicionar sob
demanda com `npx shadcn@latest add <nome>`:

`button`, `input`, `label`, `card`, `table`, `dialog`, `alert-dialog`,
`select`, `badge`, `form`, `sonner`, `skeleton` (loading), `alert` (estado de
erro/vazio).

## API service

`common/services/api.service.ts`: instância `axios` com `baseURL` de
`VITE_API_URL`, interceptor de request que injeta
`Authorization: Bearer <token>` a partir do `auth-store`, interceptor de
response que em `401` limpa a sessão e redireciona para `/login`, e mostra
`toast.error` com a mensagem vinda do backend nos demais erros — mesmo
padrão do `error-handler.ts` do CodeHammer.

## Variáveis de ambiente (`frontend/.env`)

```
VITE_API_URL=http://localhost:3000
```
