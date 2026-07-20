# deps: instala dependências uma vez, reaproveitada nos outros estágios. --ignore-scripts
# porque o postinstall roda `prisma generate`, que precisa de prisma/schema.prisma — ainda
# não copiado aqui. O estágio build gera o client explicitamente depois de copiar tudo.
FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# build: gera o client do Prisma (dentro de src/, ver schema.prisma) e compila com SWC.
# `prisma generate` não conecta no banco, só precisa que DATABASE_URL exista e seja uma URL
# válida (prisma.config.ts resolve via env() e falha se a variável não existir) — valor
# fake aqui, a URL real vem em runtime via docker-compose/plataforma de deploy.
FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN pnpm prisma:generate && pnpm build

# runtime: reaproveita node_modules completo (inclui a CLI do prisma, usada no entrypoint
# pra rodar as migrations) — imagem não é a menor possível, mas evita reinstalar/duplicar
# lógica de dependências prod-only pra um teste técnico.
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
COPY --from=build /app/package.json ./

EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main.js"]
