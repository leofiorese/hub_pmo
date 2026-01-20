# Implementation Plan - AI Analytics & Query Builder

The goal is to implement a "Self-Service" BI tool where users can query the database using a semantic layer (friendly names) and analyze the results using a local AI (Ollama).

## User Review Required
> [!IMPORTANT]
> This feature requires a running instance of **Ollama** (or compatible LLM API) accessible from the server (e.g., `http://localhost:11434`).
> The "Semantic Layer" will initially map existing tables: `users` and `links`. We can add mock tables `projects` if desired for demonstration.

## Proposed Changes

### 1. Backend - The Engine (`server/src`)

#### [NEW] Semantic Layer Configuration
- **File**: `server/src/config/semanticLayer.js`
- **Purpose**: Defines the "Configurable" database schema for **Multi-DB Support**.
- **Structure**:
    ```javascript
    export const DATABASES = {
      PSOFFICE: {
        friendlyName: "PS Office (Projetos)",
        tables: {
          projetos: {
            friendlyName: "Projetos",
            columns: {
              NOME: { label: "Nome do Projeto", type: "string" },
              CODIGO: { label: "Código Interno", type: "string" },
              DT_INICIO: { label: "Data Início", type: "date" },
              DT_FIM: { label: "Data Fim", type: "date" },
              STATUS: { label: "Status", type: "string" }
            }
          },
          info_colabs: {
            friendlyName: "Colaboradores",
            columns: {
              NOME: { label: "Nome Completo", type: "string" },
              EMAIL: { label: "E-mail", type: "string" },
              CPF: { label: "CPF", type: "string" },
              DT_ADMISSAO: { label: "Data Admissão", type: "date" }
            }
          },
          apontamentos: {
            friendlyName: "Apontamento de Horas",
            columns: {
              DT_INICIO: { label: "Data do Apontamento", type: "date" },
              MINUTOS: { label: "Duração (Minutos)", type: "number" },
              COMENTARIOS: { label: "Descrição da Atividade", type: "string" }
            }
          },
          faturamento: {
            friendlyName: "Faturamento e Notas",
            columns: {
              VALOR: { label: "Valor (R$)", type: "money" },
              DT_EMISSAO: { label: "Data Emissão", type: "date" },
              NOTA_FISCAL: { label: "Número NF", type: "string" }
            }
          }
        }
      },
      OMIE_DB: {
        friendlyName: "Omie (Financeiro)",
        tables: {
          a_pagar: {
            friendlyName: "Contas a Pagar",
            columns: {
              "Data de Vencimento (completa)": { label: "Vencimento", type: "date" },
              "Cliente ou Fornecedor (Nome Fantasia)": { label: "Fornecedor", type: "string" },
              "Valor da Conta": { label: "Valor Original (R$)", type: "money" },
              "Valor Líquido": { label: "Valor Líquido (R$)", type: "money" },
              "Situação": { label: "Status do Pagamento", type: "string" },
              "Categoria": { label: "Categoria Financeira", type: "string" }
            }
          },
          nf_faturadas: {
            friendlyName: "Notas Fiscais Faturadas",
            columns: {
              "Data de Emissão (completa)": { label: "Emissão", type: "date" },
              "Cliente ou Fornecedor (Nome Fantasia)": { label: "Cliente", type: "string" },
              "Valor Líquido": { label: "Valor da Nota (R$)", type: "money" },
              "Impostos Retidos": { label: "Impostos (R$)", type: "money" },
              "Situação": { label: "Status da Nota", type: "string" }
            }
          },
          notas_debito: {
            friendlyName: "Notas de Débito",
            columns: {
              "Data de Emissão (completa)": { label: "Emissão", type: "date" },
              "Valor da Conta": { label: "Valor (R$)", type: "money" },
              "Cliente ou Fornecedor (Nome Fantasia)": { label: "Cliente", type: "string" }
            }
          }
        }
      }
    };
    ```

#### [NEW] Analytics Controller & Routes
- **File**: `server/src/controllers/analyticsController.js`
- **File**: `server/src/routes/analyticsRoutes.js`
- **Functionality**:
    1.  `GET /databases`: Returns available DBs (PSOFFICE, OMIE).
    2.  `GET /schema/:dbName`: Returns tables/columns for the selected DB.
    3.  `POST /query`: Receives JSON query + `dbContext`.

### 2. Frontend - The Interface (`client/src`)

#### [NEW] Analytics Page (Page 1: Builder)
- **File**: `client/src/pages/Analytics/QueryBuilder.jsx`
- **Layout (Based on Sketch)**:
    -   **Header**: "Análise com IA" | Model: "Llama 3 (Locale)"
    -   **Left Column**: "Seleção dos Campos" (Checkbox Tree)
        -   Start with **Database Selector** (Dropdown/Tabs).
        -   **Tables** (Checkbox): `[ ] Tabela 1`
            -   **Columns** (Nested Checkbox): `[ ] Coluna 1`, `[ ] Coluna 2`
    -   **Right Column**: "Filtros e Parâmetros"
        -   Inputs mapped to specific fields:
            -   "Código do Projeto" (Text Input)
            -   "Nome do Colaborador" (Text Input)
            -   "Período (Início - Fim)" (Date Range Picker)
    -   **Footer**: Button "Prosseguir ->" (Navigate to Page 2).

#### [NEW] Analytics Page (Page 2: Preview & Analysis Mode)
- **File**: `client/src/pages/Analytics/DataPreview.jsx`
- **Layout (Based on Sketch)**:
    -   **Header**: "Seleção do Modo de Análise" (Dropdown/Cards).
        -   Modes: "Financeiro", "Comportamental", "Operacional".
    -   **Main Content**: "Preview dos Dados" (Data Grid).
        -   Interactive table with pagination.
    -   **Footer Actions**:
        -   *Left*: "Tela Cheia", "Adicionar Colunas" (Back), "Salvar Campos" (Save Query), "Exportar" (Excel/CSV).
        -   *Right*: "Prosseguir para Prompt ->" (Navigate to Page 3).

#### [NEW] Analytics Page (Page 3: Prompt Engineering)
- **File**: `client/src/pages/Analytics/PromptBuilder.jsx`
- **Layout (Based on Sketch)**:
    -   **Header**: "Escrita do Prompt".
    -   **Context Info**: "Dados selecionados: X linhas, Y colunas" (Subtle).
    -   **Main Content**: Large Text Area for custom instructions.
        -   *System Action*: The selected data is silently converted to a Markdown Table and appended to this prompt context.
    -   **Footer Actions**:
        -   *Left*: "Retornar" (Back to Data), "Salvar Prompt" (Save template).
        -   *Right*: "Prosseguir para Análise ->" (Execute LLM).

#### [NEW] Analytics Page (Page 4: Results & Insights)
- **File**: `client/src/pages/Analytics/AnalysisResults.jsx`
- **Layout**:
    -   **Header**: "Resultado da Análise".
    -   **Split View**:
        -   *Left (Text)*: Markdown renderer for the AI's textual response (bullet points, strategic insights).
        -   *Right (Visuals)*: Chart.js/Recharts canvas. Front-end logic to render basic charts (Bar/Line) based on the selected columns from Page 2.
    -   **Footer**: "Nova Análise" (Reset Flow), "Exportar Relatório" (PDF/Print).

#### [MODIFY] Sidebar
- Add link to the new **Analysis Engine** page.

## 3. Architecture & Security

### Distributed processing
The system will operate on a **Client-Server-Worker** model to leverage dedicated hardware for AI:

1.  **User (Client)**:
    -   Builds the query (JSON).
    -   Receives final results.
    -   *Never* talks directly to the AI Server or Database.
2.  **Web Server (Hub PMO - Node.js)**:
    -   **Role**: Orchestrator & Security Gate.
    -   **Action**:
        -   Receives request from User.
        -   Queries the SQL Databases (`PSOFFICE`, `OMIE`) locally.
        -   Sanitizes and formats data (JSON/CSV).
        -   Sends encrypted request to the **AI Server**.
3.  **AI Server (Dedicated GPU Machine)**:
    -   **Role**: Heavy Lifting (LLM Inference).
    -   **Software**: Ollama (or Python wrapper) exposing a private API.
    -   **Action**: Receives Context + Prompt, generates text, returns to Web Server.

### Security Measures
-   **Network Isolation**: The AI Server should *not* be exposed to the public internet. It should only accept requests from the Web Server's IP (Allowlist).
-   **Tunneling**: Use **SSH Tunneling** or **VPN** if the machines are not on the same physical LAN.
-   **HTTPS**: All traffic between User <-> Web Server and Web Server <-> AI Server must be encrypted.
-   **Data Sanitization**: The Web Server must filter sensitive columns (e.g., passwords, rigid PII) *before* sending data to the AI.

## Verification Plan

### Automated/Manual Tests
1.  **Schema Check**: UI loads and displays "Colaboradores" and "Contas a Pagar".
2.  **Query Execution**: Select "Nome" and "Valor", click "Run". Verify table shows data.
3.  **AI Integration**: Ensure backend talks to Ollama (Simulated for now) and frontend displays analysis.
