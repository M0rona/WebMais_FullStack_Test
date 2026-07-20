# WebMais — Gestão de Contratos

Teste técnico para vaga senior. O README descreve um escopo mínimo pensado para
caber em 6-8h — mas a entrega aqui **inclui os diferenciais** (bônus do README)
como parte do escopo real, não como algo condicional a sobrar tempo. O objetivo
é código de nível senior: limpo, bem organizado, testado e completo. Ver
`README.md` para o enunciado original e `.claude/specs/` para o detalhamento de
domínio, banco, backend, frontend, infra e testes.

Sempre que for implementar uma feature, leia o spec correspondente em
`.claude/specs/` antes de escrever código. Se o spec e o código divergirem
depois de uma decisão tomada durante a implementação, atualize o spec — ele
deve continuar sendo a fonte de verdade.

## Stack

- Backend: Node.js + TypeScript, NestJS, Prisma (PostgreSQL), Redis (`ioredis`),
  BullMQ (`@nestjs/bullmq`), validação com Zod (`nestjs-zod`)
- Frontend: React + Vite + TypeScript, shadcn/ui + Tailwind, TanStack Query,
  React Hook Form + Zod, Zustand (apenas estado global mínimo, ex.: sessão)
- Gerenciador de pacotes: **pnpm** (workspaces não são necessários — `backend/`
  e `frontend/` são projetos irmãos independentes, cada um com seu próprio
  `package.json`, como no projeto de referência)
- Infra local: `docker-compose.yml` na raiz subindo Postgres e Redis

## Arquitetura de referência

A organização de pastas segue o padrão do projeto
[CodeHammer](https://github.com/M0rona/CodeHammer) (mesmo autor), adaptado às
regras abaixo. Ao criar algo novo, procure primeiro um exemplo análogo já
existente no repo e siga o mesmo padrão — consistência > preferência pessoal.

### Backend (NestJS) — modular, por domínio

```
backend/src/
  modules/
    <domain>/                    # ex.: clients, contracts, auth
      dto/<domain>.dto.ts        # Zod schemas + createZodDto + tipos inferidos
      repositories/<domain>.repository.ts   # única camada que fala com o Prisma
      <domain>.controller.ts     # HTTP: rotas, decorators, sem lógica de negócio
      <domain>.service.ts        # regras de negócio, orquestra repository/cache/queue
      <domain>.module.ts
  common/
    constants/  decorators/  dto/  filters/  guards/  interceptors/  mappers/  types/
  infra/
    prisma/    # PrismaModule + PrismaService
    redis/     # RedisModule + RedisService (cache-aside)
    queue/     # BullMQ: registro de filas
  app.module.ts
  main.ts
```

Regras:
- **Controller** nunca acessa o Prisma/Redis diretamente — só chama o `service`.
- **Service** contém as regras de negócio e lança as exceptions do Nest
  (`NotFoundException`, `BadRequestException`, `ForbiddenException`). É o único
  lugar que decide cache hit/miss e enfileira jobs.
- **Repository** é a única camada que importa `PrismaService`. Um método por
  operação de acesso a dados, sem lógica de negócio dentro dele.
- DTOs de entrada são schemas Zod (`createZodDto`), nunca `class-validator` —
  mantenha consistência com o padrão já usado.
- Toda rota autenticada por padrão (guard JWT global); rotas públicas usam o
  decorator `@Public()` explicitamente — nunca o contrário.
- Erros sempre em português para o usuário final (mensagens de exception),
  nomes de código sempre em inglês.

### Frontend (Vite + React) — modular, MVVM por componente/página

Todo componente ou página vive em uma pasta própria, **nome em minúsculo e
separado por hífen** (kebab-case), com exatamente três arquivos:

```
contract-list/
  index.tsx                 # camada "view-model wiring"
  contract-list.model.ts    # camada model (lógica/estado)
  contract-list.view.tsx    # camada view (apresentação pura)
```

**`index.tsx`** — só faz a ligação entre model e view. Recebe as props externas
do componente (se houver), repassa o que for necessário para o model, chama o
hook do model, e passa o resultado como props para a view. É o único arquivo
que faz `export default`.

```tsx
import { useContractListModel } from './contract-list.model';
import { ContractListView } from './contract-list.view';

type ContractListProps = {
  clientId?: string;
};

const ContractList = (props: ContractListProps) => {
  const model = useContractListModel(props);
  return <ContractListView {...model} />;
};

export default ContractList;
```

**`contract-list.model.ts`** — um custom hook `use<Nome>Model` com toda a
lógica de estado: chamadas a services (TanStack Query), stores (Zustand),
handlers de evento, formulários (`react-hook-form`). Exporta o tipo de retorno
via `ReturnType` — é a base do tipo de props da view:

```ts
export const useContractListModel = (props: ContractListProps) => {
  // estado, queries, handlers...
  return { contracts, isLoading, onDelete };
};

export type ContractListModel = ReturnType<typeof useContractListModel>;
```

**`contract-list.view.tsx`** — apresentação pura: JSX, composição de outros
componentes/UI do shadcn, formatação visual. Zero chamada a service/store/API
aqui — tudo já vem pronto via props.

```tsx
import type { ContractListModel } from './contract-list.model';

export const ContractListView = ({ contracts, isLoading, onDelete }: ContractListModel) => {
  // apenas JSX
};
```

O tipo de props da view **pode estender** o tipo do model, quando a view
precisa de algo que vem de fora (prop recebida pelo `index.tsx`) mas que não
faz sentido passar pelo model — geralmente informação puramente visual, que
não participa de estado/lógica (ex.: uma variante de estilo, uma flag de
layout). Nesse caso, `index.tsx` repassa a prop direto pra view, e o tipo da
view é `ModelType & { propExtra: Tipo }`:

```tsx
// contract-form-dialog.view.tsx
import type { ContractFormDialogModel } from './contract-form-dialog.model';

type ContractFormDialogViewProps = ContractFormDialogModel & {
  triggerLabel?: string; // só estilo/copy, não afeta lógica — não precisa passar pelo model
};

export const ContractFormDialogView = ({ triggerLabel, ...model }: ContractFormDialogViewProps) => {
  // ...
};
```

```tsx
// contract-form-dialog/index.tsx
const ContractFormDialog = (props: ContractFormDialogProps) => {
  const model = useContractFormDialogModel(props);
  return <ContractFormDialogView {...model} triggerLabel={props.triggerLabel} />;
};
```

O que não vale é reescrever à mão, na view, campos que o model já retorna —
isso é a duplicação que a regra original queria evitar. Estender com props
externas que o model não precisa conhecer, sim; duplicar o que o model já
expõe, não.

Regras adicionais:
- Uma pasta = um componente. Se um componente cresce e precisa de subpartes
  visuais sem lógica própria, elas vivem dentro da mesma pasta como arquivos
  simples (ex.: `contract-status-badge.tsx`), não precisam do trio MVVM.
- Páginas de rota ficam em `modules/<domain>/pages/<nome-da-pagina>/`;
  componentes reutilizáveis de um domínio em `modules/<domain>/components/`;
  componentes cross-domain em `common/components/`.
- Comunicação com a API HTTP fica em `modules/<domain>/services/<domain>.service.ts`
  (funções puras que usam o `api` axios configurado em `common/services/`),
  nunca dentro do `.model.ts` diretamente com `fetch`/`axios` cru.
- Estado de servidor = TanStack Query. Estado de UI local = `useState` dentro
  do model. Estado global de verdade (sessão autenticada) = Zustand em
  `store/`. Não duplique estado de servidor em Zustand.
- Existe uma skill (`scaffold-frontend-view`) que gera esse trio de arquivos
  automaticamente — use-a em vez de copiar manualmente uma pasta existente.

## Convenções gerais

- TypeScript estrito, **proibido `any`** (mesma regra do ESLint do CodeHammer:
  `@typescript-eslint/no-explicit-any: error`). Se não souber o tipo, modele-o.
- Sem comentários óbvios. Comente só o que não é óbvio pelo código (uma
  decisão não trivial, uma limitação conhecida).
- Não adicionar abstração, config ou dependência que o escopo do teste não
  pede. Prefira simples e correto a "genérico e flexível".
- Commits pequenos e organizados, em português, no padrão
  `tipo: descrição curta` (ex.: `feat: cadastro de clientes`,
  `fix: cache de contratos não invalida no encerramento`). Um commit por
  unidade lógica de trabalho — isso é item de avaliação explícito no README.
- Sempre que usar IA (Claude Code) para gerar uma parte relevante do código,
  anote no `README.md` do projeto, na seção "Uso de IA" — é item avaliado.
  Não é demérito, é para o avaliador entender o processo.

## Comandos

```bash
# infra
docker compose up -d                 # sobe Postgres + Redis

# backend (cd backend)
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm start:dev
pnpm lint
pnpm test

# frontend (cd frontend)
pnpm install
pnpm dev
pnpm lint
pnpm build
```

## Specs

- `.claude/specs/00-overview.md` — escopo, domínio, decisões de escopo
- `.claude/specs/01-database.md` — schema Prisma, relacionamentos, índices
- `.claude/specs/02-backend.md` — módulos, endpoints, auth, cache Redis, job BullMQ
- `.claude/specs/03-frontend.md` — rotas, páginas, componentes shadcn, estado
- `.claude/specs/04-infra-and-delivery.md` — docker-compose, Dockerfile, CI, deploy
- `.claude/specs/05-testing.md` — estratégia e cobertura de testes esperada
