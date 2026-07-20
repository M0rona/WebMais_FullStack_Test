# 00 — Visão geral

Este projeto entrega o escopo mínimo do README **e os diferenciais**
(bônus) — a entrega não para no mínimo obrigatório, o objetivo é impressionar
num teste para vaga senior. As únicas exceções deliberadas estão em
"Diferenciais não perseguidos", com a justificativa.

## Domínio

Módulo de Gestão de Contratos:

- **Cliente**: quem assina o contrato (nome + documento). CRUD completo
  (criar, listar, editar, excluir).
- **Contrato**: pertence a um cliente, tem número, tipo, data de vencimento e
  status (`DRAFT` / `ACTIVE` / `EXPIRED` / `CLOSED` — Rascunho / Ativo /
  Vencido / Encerrado). O valor do contrato é **derivado da soma dos seus
  itens**, não um campo digitado livremente.
- **Item de contrato**: pertence a um contrato — descrição, quantidade, valor
  unitário, subtotal. Um contrato tem 1+ itens; o valor total do contrato é a
  soma dos subtotais.
- **Usuário**: quem acessa o sistema (login), não é a mesma coisa que Cliente.

## Escopo obrigatório (README)

1. Login (JWT) com cadastro simples de usuário.
2. Cadastro de cliente vinculado aos contratos.
3. CRUD de contratos completo (criar, listar, editar, excluir, encerrar).
4. Resumo por status (contagem Ativos/Vencidos/Encerrados).
5. Cache Redis na listagem de contratos e no resumo por status.
6. Job BullMQ periódico que marca contratos vencidos automaticamente.
7. `docker-compose` com Postgres + Redis.

## Diferenciais incluídos no escopo

| Diferencial do README | Como é implementado aqui |
|---|---|
| Dockerfile da aplicação | Multi-stage build para `backend/` e `frontend/`, além do `docker-compose` de infra — ver `.claude/specs/04-infra-and-delivery.md` |
| Deploy em cloud | Backend + Postgres + Redis numa cloud gratuita, frontend estático em outra — ver `.claude/specs/04-infra-and-delivery.md` |
| Testes automatizados | Backend: Jest (unit dos services + e2e dos endpoints principais). Frontend: Vitest + Testing Library nos `.model.ts` — ver `.claude/specs/05-testing.md` |
| Pipeline de CI | GitHub Actions rodando lint + build + test de backend e frontend em push/PR — ver `.claude/specs/04-infra-and-delivery.md` |
| Domínio de negócio mais rico | Tipo de contrato (`ContractType`), fluxo de aprovação leve (`DRAFT → ACTIVE`), itens do contrato com valor total calculado — ver seções abaixo e `.claude/specs/01-database.md` |
| Editar/excluir cliente | CRUD completo de cliente, não só criar/listar |
| Itens do contrato | `ContractItem` — múltiplos itens por contrato, valor total = soma dos subtotais |

### Diferenciais não perseguidos (com justificativa)

- **RabbitMQ/Kafka no lugar do BullMQ**: o README lista BullMQ como parte da
  **stack obrigatória** e, na seção de diferenciais, RabbitMQ/Kafka como
  alternativa a ela — são mutuamente excludentes por definição. Manter BullMQ
  (obrigatório) e não duplicar a infra de fila só para marcar um segundo
  checkbox que contradiz o primeiro.
- **RBAC / múltiplos papéis de usuário**: não é um diferencial listado no
  README; fica fora para não inflar escopo sem retorno de avaliação. O
  "fluxo de aprovação" pedido no README é atendido pela transição
  `DRAFT → ACTIVE` sem precisar de papéis diferentes de usuário.

## Decisões de escopo já tomadas

- **Um único tipo de usuário**, sem papéis — qualquer usuário autenticado
  pode operar tudo, inclusive aprovar um contrato em `DRAFT`.
- **JWT sem refresh token**: token de acesso com expiração de algumas horas
  (ex. 8h), guardado no client. Simplificação documentada no README do
  projeto — não é o foco de avaliação e refresh token adicionaria complexidade
  sem valor demonstrável aqui.
- **Status de contrato é derivado + persistido**: `EXPIRED` é calculado
  (dueDate no passado) mas gravado no banco pelo job do BullMQ — assim a
  listagem/filtro por status não recalcula em runtime, e o job tem função
  real (não decorativa).
- **Encerrar contrato é uma ação explícita e manual** (`CLOSED`), distinta de
  vencer automaticamente (`EXPIRED`). `CLOSED` é terminal.
- **Aprovação é um degrau simples, não um fluxo multi-etapa**: `DRAFT` é o
  estado inicial de todo contrato novo (com itens já cadastrados); "Aprovar"
  é uma ação manual que transiciona para `ACTIVE`. Não há múltiplos
  aprovadores nem histórico de aprovação — o objetivo é demonstrar domínio
  mais rico sem construir uma engine de workflow.
- **Valor do contrato é sempre derivado dos itens**: nunca um input livre no
  formulário de contrato. Recalculado (e persistido no campo `value` do
  contrato, para performance de listagem) toda vez que os itens mudam.

## Regras de transição de status

```
DRAFT   --(ação manual "aprovar", exige >= 1 item)-->  ACTIVE
ACTIVE  --(dueDate passou, job BullMQ)-->              EXPIRED
ACTIVE  --(ação manual do usuário)-->                  CLOSED
EXPIRED --(ação manual do usuário)-->                  CLOSED   # pode encerrar um vencido
CLOSED  --> (terminal, sem transição de volta)
```

Edição de contrato e de seus itens é permitida em `DRAFT` e `ACTIVE`/`EXPIRED`
(recalculando `value`); bloqueada em `CLOSED`. O job de expiração do BullMQ só
considera contratos `ACTIVE` (nunca `DRAFT`).

Ver `.claude/specs/01-database.md` para o schema, `.claude/specs/02-backend.md`
para os endpoints e a implementação do job/cache, `.claude/specs/03-frontend.md`
para as telas, `.claude/specs/04-infra-and-delivery.md` para Docker/CI/deploy e
`.claude/specs/05-testing.md` para a estratégia de testes.
