# Resumo da Implementação: Módulo de Análise Inteligente (IA)

Este documento detalha as modificações e novas funcionalidades implementadas na branch `Ia_analytics` para habilitar a análise de dados assistida por Inteligência Artificial no **Hub PMO**.

## 1. Visão Geral
O módulo permite que o usuário selecione dados do banco de dados (Projetos, Usuários, Financeiro), pré-visualize essas informações e envie perguntas em linguagem natural para um modelo de IA local (**Ollama**), recebendo insights estratégicos como resposta.

---

## 2. Frontend (React)

### Novas Páginas (`client/src/pages/Analytics/`)
*   **`Welcome.jsx`**: Tela inicial com o fluxo passo-a-passo e avisos sobre o uso de IA.
*   **`QueryBuilder.jsx`**: Construtor de consultas. Permite ao usuário selecionar Tabelas e Colunas baseadas na configuração do backend.
*   **`DataPreview.jsx`**: Exibe os dados retornados pelo backend em formato tabular para conferência antes do envio à IA.
*   **`PromptBuilder.jsx`**: Interface para o usuário digitar sua pergunta/instrução (Prompt) para a análise.
*   **`AnalysisResults.jsx`**: Renderiza a resposta da IA em Markdown, com opções de "Replay" e exportação (PDF via Print).

### Alterações Estruturais
*   **`client/src/App.jsx`**: Novas rotas adicionadas:
    *   `/analytics`
    *   `/analytics/builder`
    *   `/analytics/preview`
    *   `/analytics/prompt`
    *   `/analytics/results`
*   **`client/src/components/Layout/Sidebar.jsx`**: Adicionado novo item de menu **"Análise IA"** com ícone de destaque, facilitando o acesso à ferramenta.

---

## 3. Backend (Node.js)

### Nova Lógica de Negócio (`server/src/controllers/`)
*   **`analyticsController.js`**:
    *   `getSchema()`: Retorna a estrutura de tabelas/colunas permitidas (Camada Semântica).
    *   `executeQuery()`: Busca os dados no banco (ou Mock) baseado na seleção do usuário. Implementa lógica de segurança (Whitelist de colunas).
    *   `askAI()`: Formata os dados em tabela Markdown, constrói o System Prompt e se comunica com o **Ollama** via HTTP.

### Configuração (`server/src/config/`)
*   **`semanticLayer.js`**: Arquivo de configuração que define quais tabelas e colunas estão disponíveis para análise e seus nomes amigáveis (ex: `projects.budget` -> "Orçamento (R$)").
*   **`db.js`**: (Correção) Ajuste na importação da conexão com banco de dados.

### Rotas (`server/src/routes/`)
*   **`analyticsRoutes.js`**: Endpoints da API:
    *   `GET /schema`
    *   `POST /query`
    *   `POST /ask`
*   **`app.js`**: Registro das novas rotas sob o prefixo `/api/analytics`.

### Infraestrutura
*   **Dependências**: Adição do pacote `axios` para requisições HTTP ao servidor Ollama.
*   **Variáveis de Ambiente (`.env`)**: Adição de `OLLAMA_URL` para configurar o IP do servidor de inferência.

---

## 4. Fluxo de Dados (Data Flow)

1.  **Seleção**: Front pede `GET /schema` -> Back retorna opções.
2.  **Consulta**: Usuário escolhe colunas -> Front posta `POST /query` -> Back executa SQL -> Retorna JSON.
3.  **Análise**: Usuário digita prompt -> Front posta `POST /ask` com (JSON + Prompt).
4.  **Inferência**: Back converte JSON para Texto (Markdown Table) -> Envia para Ollama (`http://IP:11434/api/chat`).
5.  **Resposta**: Ollama processa -> Back recebe texto -> Front renderiza Markdown.

---

## 5. Próximos Passos
*   Configurar o IP correto do Ollama no `.env`.
*   Substituir os Mocks da tabela `FINANCIAL` por consultas SQL reais quando o banco financeiro estiver conectado.
