# Documentação Técnica e Stack Tecnológico

> **Versão:** 2.0.0
> **Última Atualização:** Fevereiro 2026
> **Status:** Em Produção

Este documento detalha as tecnologias, frameworks, linguagens e arquitetura de software utilizados no projeto **Hub PMO**.

---

## 1. Visão Geral da Arquitetura

O projeto segue uma arquitetura **Client-Server** desacoplada, comunicando-se via **API RESTful**.

*   **Frontend (SPA)**: Responsável pela interface do usuário e interações (React 19).
*   **Backend (API Monolítica)**: Responsável pelas regras de negócios, segurança e integração com IA (Node.js + Express 5).
*   **Múltiplos Bancos de Dados**: Três bancos MySQL 8.x para segregação de domínios.
*   **AI Engine**: LLM local (Ollama) para análise inteligente de dados.

O Backend implementa uma **Arquitetura em Camadas (Clean Architecture + MSC Pattern)** para separação de responsabilidades e testabilidade.

---

## 2. Tecnologias do Frontend (Client)

Localizado na pasta `/client`.

### Linguagens & Core
*   **JavaScript (ES6+)**: Linguagem principal do frontend.
*   **React 19**: Biblioteca para construção de interfaces de usuário (última versão estável).
*   **Vite 7**: Build tool moderna e servidor de desenvolvimento ultra-rápido (substituto do Create React App).

### Bibliotecas & Frameworks
*   **Material UI (MUI) v7**: Biblioteca de componentes de UI (Design System) com suporte completo a temas.
*   **@mui/icons-material**: Biblioteca de ícones integrada ao MUI.
*   **Emotion**: Engine de CSS-in-JS (utilizado internamente pelo MUI).
*   **React Router DOM v7**: Gerenciamento de rotas SPA com proteção de rotas privadas.
*   **Axios**: Cliente HTTP para comunicação com a API (com interceptors para autenticação automática).
*   **React Markdown v10**: Renderização de conteúdo Markdown com suporte a tabelas e formatação avançada.
*   **remark-gfm**: Plugin para GitHub Flavored Markdown (tabelas, strikethrough, task lists).
*   **Recharts v3**: Biblioteca de gráficos responsivos (Bar, Line, Pie, Area Charts) para visualização de dados da IA.

### Gerenciamento de Estado
*   **React Context API**: Utilizada para estados globais:
    *   `AuthContext`: Autenticação e informações do usuário logado.
    *   `ThemeContext`: Modo claro/escuro persistido no localStorage.
    *   `AnalyticsContext`: Estado do wizard de análise com IA (dados, filtros, prompts).
*   **Custom Hooks**: Encapsulamento de lógica reutilizável (`useAuth`, `useTheme`).

### Organização de Pastas
```
client/src/
├── contexts/           # Contextos globais (AuthContext, ThemeContext, AnalyticsContext)
├── hooks/              # Hooks customizados (useAuth, useTheme)
├── pages/              # Páginas/Telas da aplicação
│   ├── Admin/          # Gestão de usuários e aprovações
│   ├── Analytics/      # Wizard de análise com IA (5 etapas)
│   ├── Login/          # Autenticação
│   └── PowerBI/        # Visualização de dashboards externos
├── components/         # Componentes reutilizáveis
│   ├── Layout/         # Shell da aplicação (Sidebar, Topbar)
│   ├── UI/             # Componentes de UI customizados
│   └── ChartRenderer.jsx  # Renderização de gráficos da IA
└── services/           # Camada de integração com a API (axios instances)
```

---

## 3. Tecnologias do Backend (Server)

Localizado na pasta `/server`.

### Linguagens & Core
*   **Node.js**: Runtime JavaScript server-side (LTS recomendado: v18+).
*   **Express v5**: Framework web minimalista para construção da API RESTful.

### Bibliotecas Principais
*   **MySQL2**: Driver nativo de alta performance para MySQL com suporte a Promises.
*   **bcryptjs**: Hashing seguro de senhas (algoritmo bcrypt com salt).
*   **jsonwebtoken (JWT)**: Autenticação stateless baseada em tokens (expiração de 1 dia).
*   **cors**: Middleware para controle de acesso CORS (Cross-Origin Resource Sharing).
*   **dotenv**: Gerenciamento de variáveis de ambiente (.env).
*   **axios**: Cliente HTTP para comunicação com Ollama (LLM).

### Arquitetura Interna (Clean Architecture + MSC Pattern)
A aplicação backend segue o padrão de camadas para organizar o código em `/src`:

1.  **Interfaces (Routes/Controllers)**:
    *   `routes/`: Definição dos endpoints da API (Express Router).
    *   `controllers/`: Lida com requisições HTTP, validação de entrada e respostas JSON.
    *   Controladores: `authController`, `adminController`, `profileController`, `linkController`, `analyticsController`, `ollamaController`.

2.  **Business Logic (Services)**:
    *   `services/`: Contém as regras de negócio puras, isoladas de frameworks.
    *   Exemplos: `authService` (lógica de login/registro/reset de senha).

3.  **Data Access (Repositories)**:
    *   `repositories/`: Abstração de acesso ao banco de dados com queries SQL parametrizadas.
    *   Exemplos: `userRepository`, `linkRepository`.

4.  **Middlewares**:
    *   `authMiddleware`: Validação de token JWT e extração de `userId`, `userRole`.
    *   `checkRole`: Controle de acesso baseado em papéis (RBAC).

5.  **Configuration (Config)**:
    *   `config/db.js`: Pool de conexão MySQL com Promises.
    *   `config/ollama.js`: Cliente Axios para comunicação com Ollama.
    *   `config/semanticLayer.js`: Camada semântica que mapeia tabelas e colunas do banco para nomes amigáveis.

### Integrações Implementadas
*   **Ollama (Local LLM)**: Integração **ativa e funcional** via HTTP (`POST /api/chat`).
    *   Modelo padrão: `qwen2.5:14b` (execução local).
    *   Uso: Análise inteligente de dados tabulares com geração de insights e gráficos.

---

## 4. Banco de Dados

### Infraestrutura Multi-Database
O sistema conecta-se a **três bancos MySQL 8.x** distintos via um único pool de conexão:

1.  **pso_hub_db**: Banco principal da aplicação.
    *   Tabelas: `users`, `app_links`, `audit_logs`, `projects`, `project_kpis`.
    *   Função: Autenticação, RBAC, gestão de links, logs de auditoria.

2.  **omie_db**: Dados financeiros do ERP Omie.
    *   Tabelas: `a_pagar`, `nf_faturadas`, `notas_debito`.
    *   Função: Contas a pagar, notas fiscais faturadas, notas de débito.

3.  **psoffice**: Dados de gerenciamento de projetos (PSOffice).
    *   Tabelas: `projetos`, `atividades`, `apontamentos`, `faturamento`, `empresas`, `colaboradores`, `despesas`, `atribuicoes`.
    *   Função: Projetos, atividades, horas trabalhadas, faturamento, despesas.

### Características Técnicas
*   **Engine**: InnoDB (suporte a transações ACID e chaves estrangeiras).
*   **Driver**: `mysql2` com Promises (async/await).
*   **Queries**: SQL direto com parametrização (proteção contra SQL Injection).
*   **Semantic Layer**: Camada de abstração em `config/semanticLayer.js` para:
    *   Mapear nomes técnicos para nomes amigáveis.
    *   Definir tipos de dados (string, number, date, money, boolean).
    *   Suportar colunas computadas via `sqlExpr`.

---

## 5. Infraestrutura & DevOps

### Containerização
*   **Docker**: Containerização da aplicação (Frontend Nginx + Backend Node.js).
*   **Docker Compose**: Orquestração dos containers para produção.
    *   Backend: Porta 7000
    *   Frontend: Porta 7001 (servido no subpath `/pmohub`)
*   **Dockerfiles**: Separados para client e server com multi-stage builds.

### Gerenciamento de Processos
*   **PM2**: Gerenciador de processos Node.js para ambientes Windows (VM de produção).
    *   Configuração: `server/ecosystem.config.js`
    *   Modo: Cluster (múltiplas instâncias)
    *   Reload: Zero downtime

### Proxy Reverso
*   **Nginx**: Servidor web e reverse proxy (configuração em `nginx.deploy.conf`).
    *   Serve frontend estático no subpath `/pmohub`
    *   Proxy para backend em `/pmohub/api`

---

## 6. Ferramentas de Desenvolvimento

*   **VS Code**: Editor de código recomendado.
*   **ESLint**: Linter para padronização de código JavaScript/React (configurado no client).
*   **Nodemon**: Auto-reload para desenvolvimento backend (script `npm run dev`).
*   **Git**: Controle de versão com convenções de commit (`feat:`, `fix:`, `ui/ux:`, `chore:`).

---

## 7. Fluxo de Dados da IA (AI Analytics)

### Componentes
1.  **Semantic Layer** (`config/semanticLayer.js`): Define tabelas e colunas permitidas para análise.
2.  **Analytics Controller** (`analyticsController.js`): Orquestra queries SQL e comunicação com Ollama.
3.  **Ollama Client** (`config/ollama.js`): Axios instance para comunicação com LLM local.
4.  **Chart Renderer** (`ChartRenderer.jsx`): Componente React para renderizar gráficos JSON retornados pela IA.

### Pipeline
1.  Usuário seleciona tabelas e aplica filtros (QueryBuilder).
2.  Backend executa query SQL limitada a 50 linhas por tabela (DataPreview).
3.  Usuário escreve prompt de análise (PromptBuilder).
4.  Backend converte dados para Markdown, injeta system prompt e envia para Ollama.
5.  IA retorna resposta em Markdown (texto + blocos ```json-chart```).
6.  Frontend renderiza Markdown com `react-markdown` + `remark-gfm` e intercepta blocos de gráfico com `ChartRenderer`.

---

## 8. Segurança

*   **Autenticação**: JWT com expiração de 1 dia, armazenado em localStorage.
*   **Autorização**: RBAC (4 papéis: admin, pmo, manager, viewer).
*   **Hashing**: bcryptjs com salt automático (10 rounds).
*   **SQL Injection**: Queries parametrizadas com placeholders `?`.
*   **XSS**: React escapa automaticamente; validação adicional em inputs críticos.
*   **CORS**: Configurado via middleware `cors()`.
*   **Email Whitelist**: Apenas emails `@sandech.com.br` permitidos no registro.

---

## 9. Versionamento e Atualizações

| Componente | Versão Atual | Última Atualização |
|------------|--------------|-------------------|
| React | 19.2.0 | Fev/2026 |
| Material-UI | 7.3.6 | Fev/2026 |
| Express | 5.2.1 | Fev/2026 |
| MySQL2 | 3.16.0 | Fev/2026 |
| Vite | 7.2.4 | Fev/2026 |
| Recharts | 3.7.0 | Fev/2026 |
| React Router | 7.11.0 | Fev/2026 |
