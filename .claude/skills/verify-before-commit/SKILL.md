---
name: verify-before-commit
description: Roda lint, build e testes de backend e/ou frontend antes de um commit — use antes de qualquer `git commit` neste repositório, ou quando o usuário pedir para "verificar" ou "validar" o projeto antes de entregar.
---

# Verificação antes de commit/entrega

Este projeto é avaliado, entre outros critérios, por "qualidade de código" e
"boas práticas de Git". Nunca crie um commit com lint/build quebrado.

## Passos

1. Identifique o que mudou desde o último commit (`git status`, `git diff`).
2. Para cada projeto afetado (`backend/`, `frontend/`), rode nesta ordem,
   parando e corrigindo se algo falhar:
   ```bash
   pnpm lint
   pnpm build
   pnpm test
   ```
   Testes fazem parte da entrega (não são opcionais) — se a mudança alterou
   lógica de negócio (backend `service`) ou um `.model.ts` não trivial e
   ainda não tem teste, escreva o teste antes de commitar.
3. Se `pnpm lint` apontar erros, corrija a causa raiz — não desabilite regras
   do ESLint nem adicione `// eslint-disable` para contornar, a menos que o
   usuário peça explicitamente.
4. Se o build do frontend passar mas você alterou UI, valide visualmente:
   suba `pnpm dev` e confira o fluxo alterado antes de reportar como concluído.
5. Só depois de tudo verde, monte o commit seguindo a convenção de
   `CLAUDE.md` (`tipo: descrição curta`, em português, granular).
