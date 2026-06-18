# Cardume

## Visão Geral

Cardume é uma plataforma colaborativa inspirada em quadros Kanban que combina gestão de tarefas com análise de dinâmicas de equipe. O sistema foi desenvolvido como MVP acadêmico para explorar o uso de Inteligência Artificial no apoio à colaboração, comunicação e bem-estar coletivo em projetos.

A proposta central é oferecer uma ferramenta que vá além do acompanhamento de produtividade, utilizando IA para identificar padrões de comunicação, sinais de colaboração, possíveis tensões e oportunidades de melhoria nas interações entre os membros da equipe.

---

## User Story

**Como membro de uma equipe de projeto**, quero registrar tarefas, discutir atividades e receber análises automáticas das conversas da equipe, para compreender melhor a dinâmica de trabalho e melhorar a colaboração entre os participantes.

---

## Funcionalidades

### Autenticação

* Cadastro de usuários com Supabase Auth.
* Login e logout.
* Persistência de sessão.
* Controle de acesso às áreas protegidas da aplicação.

### Gestão de Tarefas

* Criação de tarefas.
* Organização em quadro Kanban.
* Acompanhamento do progresso das atividades.

### Comunicação

* Sistema de mensagens associado às tarefas.
* Registro de discussões da equipe.

### Inteligência Artificial

* Análise automática das conversas.
* Identificação de sinais positivos de colaboração.
* Reconhecimento de padrões de comunicação.
* Identificação de potenciais tensões e riscos.
* Sugestões para melhoria da dinâmica da equipe.

### Saúde da Equipe

* Painel de insights gerados por IA.
* Resumo interpretativo da dinâmica do grupo.

---

## Tecnologias Utilizadas

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express

### Banco de Dados e Autenticação

* Supabase
* Supabase Auth

### Inteligência Artificial

* Google Gemini API

### Infraestrutura

* GitHub
* GitHub Codespaces
* Vercel

---

## Estrutura do Projeto

```text
src/
 ├── App.tsx
 ├── data.ts
 ├── types.ts
 ├── supabase.ts
 └── main.tsx

api/
 ├── analyze-task.ts
 └── analyze-team-health.ts

server.ts
```

---

## Execução Local

### Instalar dependências

```bash
npm install
```

### Configurar variáveis de ambiente

Criar arquivo `.env.local`:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

VITE_SUPABASE_URL=YOUR_SUPABASE_URL

VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

### Executar

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:3000
```

---

## Status do MVP

### Implementado

* Autenticação com Supabase.
* Login e cadastro.
* Quadro Kanban.
* Sistema de tarefas.
* Sistema de mensagens.
* Integração com IA para análise das conversas.
* Deploy na Vercel.

### Melhorias Futuras

* Histórico de análises.
* Métricas avançadas de colaboração.
* Dashboard analítico expandido.
* Notificações em tempo real.
* Persistência completa das tarefas por usuário.

