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
  * [ ] Login (pode usar usuário/senha fixos ou um cadastro simples)
  * [ ] Cadastrar cliente (nome e documento) para vincular aos contratos
  * [ ] Listar contratos (número, cliente, valor, vencimento, status)
  * [ ] Cadastrar novo contrato, selecionando o cliente
  * [ ] Editar um contrato
  * [ ] Excluir um contrato
  * [ ] Encerrar um contrato manualmente, com feedback visual da mudança
  * [ ] Ver um resumo/contagem de contratos por status (Ativos / Vencidos / Encerrados)
  * [ ] Logoff

* Backend
  * [ ] Todas as operações do front expostas via API REST
  * [ ] Autenticação via Token JWT
  * [ ] Persistência em PostgreSQL, com contrato relacionado a um cliente
  * [ ] Cache em Redis para a listagem de contratos (ou para o resumo por status)
  * [ ] Job assíncrono com BullMQ: ao vencer a data de um contrato, atualizar seu status automaticamente para "Vencido" (pode ser um job periódico ou disparado no cadastro/consulta)

* Geral
  * [ ] Git com histórico de commits organizado
  * [ ] `docker-compose` subindo Postgres e Redis
  * [ ] README explicando como rodar o projeto
  * [ ] Relatar no README se/onde usou ferramentas de IA (Claude Code, Copilot, etc.) durante o desenvolvimento — não é demérito, queremos entender como você usa essas ferramentas
  * [ ] Subir o projeto no github e encaminhar o link do repositóiro para o contato do RH da WebMais (Em até 5 dias)

## :sparkles: Diferenciais (bônus, não obrigatório)

* [ ] Dockerfile da aplicação (além do docker-compose de infra)
* [ ] Deploy em alguma cloud
* [ ] Testes automatizados
* [ ] Pipeline de CI simples (lint/test no GitHub Actions)
* [ ] Uso de RabbitMQ/Kafka no lugar do BullMQ
* [ ] Domínio de negócio mais rico (múltiplos tipos de contrato, fluxo de aprovação, dados financeiros)
* [ ] Editar/excluir cliente
* [ ] Itens do contrato (múltiplos itens/produtos por contrato, com valor total calculado a partir da soma dos itens)

## :green_heart: Critérios de avaliação

* [ ] Qualidade de código (Clean Code, SOLID)
* [ ] Organização e estrutura do projeto
* [ ] Modelagem do banco de dados (schema, relacionamentos, tipos)
* [ ] Uso correto de PostgreSQL, Redis e BullMQ
* [ ] Features funcionais conforme requisitos mínimos
* [ ] Tratamento de erros
* [ ] Boas práticas de Git
* [ ] Uso de ferramentas de IA no processo de desenvolvimento
