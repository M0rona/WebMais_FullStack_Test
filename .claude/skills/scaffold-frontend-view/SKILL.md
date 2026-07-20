---
name: scaffold-frontend-view
description: Gera o trio de arquivos MVVM (index.tsx, *.model.ts, *.view.tsx) para uma nova página ou componente do frontend, com a pasta em kebab-case — use sempre que for criar uma página nova em modules/<domain>/pages ou um componente novo em modules/<domain>/components ou common/components.
---

# Scaffold de página/componente MVVM (frontend)

Gera uma pasta nova seguindo exatamente o padrão MVVM descrito em `CLAUDE.md`.
**Nunca** crie um componente React como arquivo único fora desse padrão — nem
mesmo componentes pequenos (exceção: sub-partes puramente visuais sem lógica,
que podem viver como um arquivo simples dentro da pasta do componente pai).

## Quando usar

O usuário pede uma página ou componente novo (ex.: "cria a tela de listagem de
contratos", "preciso de um componente de badge de status").

## Passos

1. Defina o nome em kebab-case (ex.: `contract-list`, `client-form`,
   `contract-status-badge`).
2. Decida a localização:
   - Página de rota → `frontend/src/modules/<domain>/pages/<nome>/`
   - Componente reutilizável de um domínio → `frontend/src/modules/<domain>/components/<nome>/`
   - Componente cross-domain (ex. Header, layout) → `frontend/src/common/components/<nome>/`
3. Crie os três arquivos:

### `<nome>/<nome>.model.ts`

```ts
export const use<Nome>Model = (props: <Nome>Props) => {
  // useQuery/useMutation (TanStack Query) para dados de servidor
  // useState para estado de UI local
  // handlers de evento
  return {
    // tudo que a view precisa: dados, flags de loading/error, handlers
  };
};

export type <Nome>Model = ReturnType<typeof use<Nome>Model>;
```

Se o componente não recebe props externas (páginas de rota simples), omita o
parâmetro `props`.

### `<nome>/<nome>.view.tsx`

```tsx
import type { <Nome>Model } from './<nome>.model';

export const <Nome>View = ({ /* campos do model */ }: <Nome>Model) => {
  return (
    // JSX puro — componentes shadcn de common/components/ui, sem chamadas
    // a service/store/query aqui
  );
};
```

Se a view precisar de alguma informação que vem de fora (prop recebida pelo
`index.tsx`) e que é puramente visual — não afeta estado/lógica, então não faz
sentido o model conhecer — estenda o tipo do model em vez de duplicar campos
à mão: `type <Nome>ViewProps = <Nome>Model & { propExtra: Tipo }`. O
`index.tsx` repassa essa prop direto para a view. Nunca reescreva à mão um
campo que o model já retorna.

### `<nome>/index.tsx`

```tsx
import { use<Nome>Model } from './<nome>.model';
import { <Nome>View } from './<nome>.view';

const <Nome> = (props: <Nome>Props) => {
  const model = use<Nome>Model(props);
  return <<Nome>View {...model} />;
};

export default <Nome>;
```

4. Se a página/componente precisa de dados do backend, crie (ou reutilize) a
   função correspondente em `modules/<domain>/services/<domain>.service.ts` —
   o `.model.ts` chama o service via TanStack Query, nunca `axios`/`fetch`
   diretamente.
5. Se a página é uma rota, registre-a no router (`App.tsx` ou arquivo de
   rotas) e, se exigir autenticação, envolva com `ProtectedRoute`.
6. Prefira compor com componentes shadcn já instalados em
   `common/components/ui/`. Se faltar um componente shadcn necessário, rode
   `npx shadcn@latest add <componente>` dentro de `frontend/` em vez de
   escrevê-lo à mão. **Bug conhecido do CLI neste ambiente (Windows/git-bash,
   shadcn 4.13.1):** ele cria os arquivos numa pasta `@/` literal na raiz de
   `frontend/` em vez de resolver o alias para `src/`. Depois de rodar
   `shadcn add`, sempre confira se apareceu uma pasta `@/` — se sim, mova o
   conteúdo para `src/common/components/ui/` e apague a pasta `@/`.
7. Se o `.model.ts` tem lógica não trivial (validação, cálculo, transformação
   de dados, condicional de UI), escreva um teste com Vitest +
   `@testing-library/react` (`renderHook`), mockando os services — o model é
   um hook isolado, então é testável sem montar a view. Ver
   `.claude/specs/05-testing.md`. Essa é uma das vantagens do MVVM: aproveite.
8. Rode `pnpm lint` e, se houver teste novo, `pnpm test` dentro de `frontend/`
   para validar antes de considerar a tarefa concluída.
