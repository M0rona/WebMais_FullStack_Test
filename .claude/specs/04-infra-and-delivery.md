# 04 — Infra, Docker, CI e deploy

Estes eram os "diferenciais" do README — aqui são tratados como entrega
obrigatória (ver `.claude/specs/00-overview.md`).

## docker-compose (raiz do repo)

`docker compose up -d` (comportamento default) sobe só a infra — Postgres e
Redis — para desenvolvimento local com `pnpm dev` em cada projeto. Os
serviços da aplicação (`backend`, `frontend`) ficam atrás do profile `full`,
para permitir também subir o sistema inteiro com um único comando usando as
imagens Docker da aplicação:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: webmais
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    profiles: ['full']
    build: ./backend
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/webmais?schema=public
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET:-dev-secret-change-me}
      PORT: 3000
      FRONTEND_URL: http://localhost:5173
    ports:
      - '3000:3000'

  frontend:
    profiles: ['full']
    build:
      context: ./frontend
      args:
        VITE_API_URL: http://localhost:3000
    depends_on:
      - backend
    ports:
      - '5173:80'

volumes:
  postgres_data:
```

Uso:
- Desenvolvimento (código local, hot reload): `docker compose up -d` +
  `pnpm dev` em `backend/` e `frontend/`.
- Demo/entrega "tudo em um comando": `docker compose --profile full up -d --build`.

## Dockerfiles da aplicação

**`backend/Dockerfile`** — multi-stage:
1. `deps`: `node:20-alpine`, instala dependências com `pnpm`.
2. `build`: copia código, roda `pnpm build` (compila TS) e `prisma generate`.
3. `runtime`: `node:20-alpine` enxuto, copia só `dist/`, `node_modules` de
   produção e `prisma/`, roda `prisma migrate deploy` no entrypoint antes de
   `node dist/main`.

**`frontend/Dockerfile`** — multi-stage:
1. `build`: `node:20-alpine`, `pnpm install` + `pnpm build` (Vite gera
   estático em `dist/`), recebendo `VITE_API_URL` como build arg.
2. `runtime`: `nginx:alpine` servindo `dist/` como estático, com um
   `nginx.conf` mínimo que faz fallback de rotas para `index.html` (SPA).

## CI (GitHub Actions)

`.github/workflows/ci.yml`, dois jobs paralelos (`backend`, `frontend`),
disparados em `push` e `pull_request` para `main`:

- `backend`: sobe Postgres + Redis como `services` do job, roda
  `pnpm install`, `pnpm lint`, `pnpm prisma migrate deploy`, `pnpm build`,
  `pnpm test` (unit) e `pnpm test:e2e`.
- `frontend`: `pnpm install`, `pnpm lint`, `pnpm test`, `pnpm build`.

Falha em qualquer step quebra o CI — é o gate de qualidade antes de qualquer
merge.

## Deploy

- **Backend + Postgres**: Render.com (free tier) — web service a partir do
  `backend/Dockerfile`, banco Postgres gerenciado do próprio Render.
- **Redis**: Upstash (free tier, Redis serverless com TLS) — Render não tem
  mais Redis gerenciado gratuito; Upstash é o padrão de mercado para esse
  caso e funciona direto com `ioredis` via `REDIS_URL` com `rediss://`.
- **Frontend**: Vercel — build estático do Vite, `VITE_API_URL` apontando
  para a URL pública do backend no Render.
- Requer contas/credenciais do próprio candidato — preparar os arquivos de
  config (`render.yaml` ou dashboard manual, `vercel.json` se necessário) faz
  parte da entrega; a execução do deploy em si (login, criação dos serviços)
  é um passo manual a fazer junto, não algo que se automatiza sem acesso às
  contas.

## README do projeto (raiz)

Substituir/complementar o README do desafio com uma seção própria de
instruções de execução:

1. Como subir a infra (`docker compose up -d`) ou o sistema completo
   (`docker compose --profile full up -d --build`).
2. Como rodar backend e frontend em modo dev (`pnpm install` + comandos de
   cada um).
3. Variáveis de ambiente necessárias (`.env.example` em `backend/` e
   `frontend/`, nunca commitar `.env` real).
4. Como rodar os testes (`pnpm test` em cada projeto).
5. Link do deploy (se publicado) e badge do CI.
6. **Seção "Uso de IA"** — obrigatória pelo enunciado: descrever onde o
   Claude Code foi usado (ex.: estruturação inicial do projeto via `.claude/`,
   scaffolding de módulos via skills, revisão antes de commit), de forma
   honesta e específica — inclusive que esta própria estrutura `.claude/` foi
   definida com apoio do Claude Code.
7. Lista dos diferenciais entregues, mapeada explicitamente aos checkboxes do
   README original do desafio.

## Checklist de entrega (mapeado ao README do desafio)

Usar esta lista como guia de progresso durante a implementação — cada item
corresponde a um checkbox do `README.md` original do desafio, incluindo a
seção "Diferenciais" inteira (tratada como obrigatória aqui).
