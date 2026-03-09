# 🤖 Documentação Técnica Completa do AI Analytics Engine

> **Versão:** 2.0.0
> **Última Atualização:** 24/02/2026
> **Status:** ✅ Em Produção
> **Modelo LLM:** Qwen 2.5:14b (Local via Ollama)

---

## 📋 Índice

1. [Visão Geral e Arquitetura](#1-visão-geral-e-arquitetura)
2. [Stack Tecnológico Completo](#2-stack-tecnológico-completo)
3. [Fluxo Detalhado - Wizard de 5 Etapas](#3-fluxo-detalhado---wizard-de-5-etapas)
4. [Camada Semântica (Semantic Layer)](#4-camada-semântica-semantic-layer)
5. [Processamento Backend](#5-processamento-backend)
6. [Integração com Ollama](#6-integração-com-ollama)
7. [Renderização Frontend e Gráficos](#7-renderização-frontend-e-gráficos)
8. [Gerenciamento de Estado (AnalyticsContext)](#8-gerenciamento-de-estado-analyticscontext)
9. [Segurança e Validações](#9-segurança-e-validações)
10. [Otimizações de Performance](#10-otimizações-de-performance)
11. [Tratamento de Erros](#11-tratamento-de-erros)
12. [Diagramas de Fluxo](#12-diagramas-de-fluxo)

---

## 1. Visão Geral e Arquitetura

### 1.1 Propósito

O **AI Analytics Engine** é um módulo de análise inteligente de dados que permite aos usuários:
- Selecionar dados de múltiplos bancos MySQL (pso_hub_db, omie_db, psoffice)
- Aplicar filtros dinâmicos para refinar datasets
- Enviar dados contextualizados para um LLM local (Ollama)
- Receber análises narrativas em Markdown + gráficos interativos (Recharts)

### 1.2 Arquitetura de 3 Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA 1: FRONTEND                        │
│  React 19 + MUI 7 + React Router 7 + AnalyticsContext       │
│  - QueryBuilder: Seleção de tabelas e colunas               │
│  - DataPreview: Aplicação de filtros e preview de dados     │
│  - PromptBuilder: Seleção de modelo e escrita de prompt     │
│  - AnalysisResults: Renderização Markdown + Gráficos        │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP (axios)
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA 2: BACKEND                         │
│  Node.js + Express 5 + MySQL2 + Axios                       │
│  - analyticsController: Orquestração de queries e prompts   │
│  - Semantic Layer: Mapeamento de tabelas e validações       │
│  - SQL Builder: Construção segura de queries parametrizadas │
│  - Markdown Converter: JSON → Tabelas Markdown otimizadas   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP (axios)
┌─────────────────────────────────────────────────────────────┐
│                   CAMADA 3: AI ENGINE                        │
│  Ollama (localhost:11434) - Modelo qwen2.5:14b              │
│  - Context Window: ~32k tokens                              │
│  - Modo: Chat (system + user messages)                      │
│  - Streaming: Desabilitado (resposta completa)              │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Princípios de Design

1. **Privacy-First**: Dados nunca saem do ambiente local (sem APIs externas)
2. **Context-Aware**: Sistema prompt injeta dados + instruções de forma otimizada
3. **Stateful Navigation**: AnalyticsContext preserva estado entre etapas do wizard
4. **Progressive Disclosure**: Interface revela complexidade gradualmente
5. **Fail-Safe**: Validações em múltiplas camadas (frontend, backend, semantic layer)

---

## 2. Stack Tecnológico Completo

### 2.1 Frontend

| Componente | Tecnologia | Versão | Função |
|------------|-----------|--------|---------|
| **Framework** | React | 19.2.0 | UI Components e State Management |
| **Build Tool** | Vite | 7.2.4 | Bundle e Dev Server ultra-rápido |
| **UI Library** | Material-UI | 7.3.6 | Sistema de Design (Accordion, Table, Tabs) |
| **Routing** | React Router DOM | 7.11.0 | Navegação SPA com state preservation |
| **HTTP Client** | Axios | 1.13.2 | API calls com interceptors (auto-auth) |
| **Markdown** | react-markdown | 10.1.0 | Renderização de resposta da IA |
| **Markdown Plugin** | remark-gfm | 4.0.1 | GitHub Flavored Markdown (tabelas) |
| **Charts** | Recharts | 3.7.0 | Bar/Line/Pie Charts responsivos |
| **State Management** | Context API | nativo | AnalyticsContext (global state) |

### 2.2 Backend

| Componente | Tecnologia | Versão | Função |
|------------|-----------|--------|---------|
| **Runtime** | Node.js | 18+ LTS | Servidor JavaScript |
| **Framework** | Express | 5.2.1 | API RESTful |
| **Database Driver** | mysql2 | 3.16.0 | Pool de conexões MySQL com Promises |
| **HTTP Client** | Axios | 1.13.4 | Comunicação com Ollama |
| **Environment** | dotenv | 17.2.3 | Gerenciamento de variáveis (.env) |

### 2.3 AI Engine

| Componente | Tecnologia | Versão | Função |
|------------|-----------|--------|---------|
| **LLM Runtime** | Ollama | latest | Executor de modelos locais |
| **Modelo Padrão** | Qwen 2.5 | 14b | LLM de análise de dados |
| **Context Window** | - | ~32k tokens | Limite de entrada |
| **API Endpoint** | HTTP | localhost:11434 | `/api/chat`, `/api/tags`, `/api/generate` |

### 2.4 Databases

| Banco | Tipo | Função | Tabelas de Interesse |
|-------|------|--------|---------------------|
| **pso_hub_db** | MySQL 8.x | App principal | users, app_links, audit_logs |
| **omie_db** | MySQL 8.x | ERP Financeiro | a_pagar, nf_faturadas, notas_debito |
| **psoffice** | MySQL 8.x | Gestão de Projetos | projetos, atividades, apontamentos, faturamento |

---

## 3. Fluxo Detalhado - Wizard de 5 Etapas

### Etapa 0: Welcome (`/analytics`)

**Arquivo:** `client/src/pages/Analytics/Welcome.jsx`

**Função:** Tela de boas-vindas explicando o fluxo.

**Ação do Usuário:** Clica em "Iniciar Análise" → Navega para `/analytics/builder`

---

### Etapa 1: QueryBuilder (`/analytics/builder`)

**Arquivo:** `client/src/pages/Analytics/QueryBuilder.jsx`
**Endpoint Backend:** `GET /api/analytics/schema`

#### 3.1.1 Carregamento do Schema

**Frontend:**
```javascript
useEffect(() => {
    const fetchSchema = async () => {
        const response = await api.get('/analytics/schema');
        setSchema(response.data); // { TABLE_KEY: { friendlyName, columns: {...} } }
    };
    fetchSchema();
}, []);
```

**Backend (`analyticsController.getSchema`):**
```javascript
getSchema: async (req, res) => {
    return res.json(getAvailableSchemas()); // Retorna SEMANTIC_LAYER
}
```

**Resposta (Exemplo):**
```json
{
  "OMIE_A_PAGAR": {
    "friendlyName": "Contas a Pagar",
    "tableName": "omie_db.a_pagar",
    "columns": {
      "id": { "label": "ID", "type": "number" },
      "Data de Vencimento (completa)": { "label": "Data Vencimento", "type": "date" }
    }
  },
  "PSO_PROJETOS": {
    "friendlyName": "Projetos",
    "tableName": "psoffice.projetos",
    "columns": {
      "PROJ_ID": { "label": "ID Projeto", "type": "number" },
      "NOME": { "label": "Nome do Projeto", "type": "string" }
    }
  }
}
```

#### 3.1.2 Seleção de Colunas

**Estado Local:**
```javascript
const { selectedTables, setSelectedTables } = useAnalytics();
// selectedTables = { TABLE_KEY: ['col1', 'col2', 'col3'] }
```

**Renderização:**
- Tabelas agrupadas por fonte (Omie ERP vs PSOffice)
- Cada tabela em um `Accordion` com checkboxes para colunas
- Botão "Selecionar Todos" / "Desmarcar Todos" por tabela
- Contador total de colunas selecionadas no botão "Visualizar Prévia"

**Validação:**
```javascript
const handleProceed = () => {
    if (countSelected() === 0) return; // Botão desabilitado
    navigate('/analytics/preview');
};
```

**Estado Persistido:** `AnalyticsContext.selectedTables`

---

### Etapa 2: DataPreview (`/analytics/preview`)

**Arquivo:** `client/src/pages/Analytics/DataPreview.jsx`
**Endpoint Backend:** `POST /api/analytics/query`

#### 3.2.1 Execução de Query

**Request (Frontend):**
```javascript
const response = await api.post('/analytics/query', {
    selectedTables: {
        "PSO_PROJETOS": ["PROJ_ID", "NOME", "VALOR"],
        "OMIE_A_PAGAR": ["id", "Valor da Conta", "Situação"]
    },
    filters: {
        "PSO_PROJETOS": [
            { id: 1708123456, column: "VALOR", operator: ">", value: "10000" }
        ]
    }
});
```

**Backend (`analyticsController.executeQuery`):**

1. **Validação de Tabelas e Colunas:**
```javascript
for (const [tableKey, columns] of Object.entries(selectedTables)) {
    if (!SEMANTIC_LAYER[tableKey]) continue; // Tabela não existe no semantic layer

    const tableName = SEMANTIC_LAYER[tableKey].tableName; // "psoffice.projetos"
    const savedColumns = SEMANTIC_LAYER[tableKey].columns;

    // Valida se as colunas existem no schema
    const validColumns = columns.filter(col => savedColumns[col]);
}
```

2. **Construção de Filtros Seguros:**
```javascript
let whereClause = "";
let params = [];

if (filters && filters[tableKey]) {
    const conditions = [];
    filters[tableKey].forEach(filter => {
        // Whitelist: Coluna deve estar no semantic layer
        if (!savedColumns[filter.column]) return;

        // Whitelist: Operador deve ser permitido
        const allowedOps = ['=', '>', '<', '>=', '<=', '!=', 'LIKE'];
        if (!allowedOps.includes(filter.operator)) return;

        conditions.push(`${filter.column} ${filter.operator} ?`);
        params.push(filter.value); // Parametrizado para evitar SQL Injection
    });

    if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`;
    }
}
```

3. **Execução SQL:**
```javascript
const query = `SELECT ${selectClause} FROM ${tableName} ${whereClause} LIMIT 50`;
console.log(`[Analytics] Executing: ${query} params:`, params);

const [rows] = await db.execute(query, params); // mysql2 com Promises
resultData[tableKey] = rows;
```

**Response (Exemplo):**
```json
{
  "success": true,
  "data": {
    "PSO_PROJETOS": [
      { "PROJ_ID": 1, "NOME": "Projeto Alpha", "VALOR": 150000.00 },
      { "PROJ_ID": 5, "NOME": "Projeto Beta", "VALOR": 85000.00 }
    ],
    "OMIE_A_PAGAR": [
      { "id": 42, "Valor da Conta": 5000.00, "Situação": "Em Aberto" }
    ]
  }
}
```

#### 3.2.2 Interface de Filtros

**Componentes:**
- `Tabs` para navegar entre tabelas selecionadas
- Seção de filtros ativos (exibidos como `Chips` deletáveis)
- Formulário de novo filtro:
  - `Select` para escolher coluna (dropdown com colunas da tabela atual)
  - `Select` para operador (=, >, <, >=, <=, !=, LIKE)
  - `TextField` para valor
  - Botão "Adicionar" (desabilitado se coluna ou valor vazio)

**Aplicação de Filtro:**
```javascript
const handleAddFilter = (tableKey) => {
    const newFilter = { ...draftFilter, id: Date.now() };
    setFilters(prev => ({
        ...prev,
        [tableKey]: [...(prev[tableKey] || []), newFilter]
    }));
    setDraftFilter({ column: '', operator: '=', value: '' });
};
```

**Re-fetch Automático:**
```javascript
useEffect(() => {
    fetchData(); // Re-executa query quando filters mudam
}, [selectedTables, filters]); // Dependências: tabelas e filtros
```

#### 3.2.3 Visualização de Dados

**Componente:** `Table` do MUI com `stickyHeader`
- **Limite:** Máximo 50 linhas por tabela (definido no backend)
- **Overlay de Loading:** `CircularProgress` com `position: absolute` quando re-fetching
- **Footer:** Aviso "* Mostrando amostra limitada (máx 50 linhas)"

**Estado Persistido:** `AnalyticsContext.dataPreview`, `AnalyticsContext.filters`

---

### Etapa 3: PromptBuilder (`/analytics/prompt`)

**Arquivo:** `client/src/pages/Analytics/PromptBuilder.jsx`
**Endpoint Backend:** `GET /api/ollama/models`, `POST /api/analytics/ask`

#### 3.3.1 Carregamento de Modelos Ollama

**Frontend:**
```javascript
useEffect(() => {
    const fetchModels = async () => {
        const data = await ollamaService.getModels(); // GET /ollama/models
        if (data && data.models) {
            setModels(data.models);
            setSelectedModel(data.models[0].name); // Modelo padrão
        }
    };
    fetchModels();
}, []);
```

**Backend (`ollamaController.listModels`):**
```javascript
exports.listModels = async (req, res) => {
    const response = await ollamaClient.get('/api/tags'); // Ollama API
    res.json(response.data); // { models: [{ name: "qwen2.5:14b", ... }] }
};
```

**Response (Exemplo):**
```json
{
  "models": [
    { "name": "qwen2.5:14b", "size": 8540641920, "modified_at": "2026-01-15T10:30:00Z" },
    { "name": "llama3:8b", "size": 4720000000, "modified_at": "2026-01-10T14:20:00Z" }
  ]
}
```

#### 3.3.2 Interface de Prompt

**Componentes:**
1. **Info Box:** Exibe `totalRows registros de totalTables tabelas`
2. **Data Preview Accordion:** Tabelas colapsadas com primeiras 10 linhas
3. **Model Selector:** `Select` com modelos carregados do Ollama
4. **Prompt TextField:** `multiline` com 6 linhas, placeholder sugestivo
5. **Debug Accordion:** JSON completo dos dados (colapsado por padrão)

**Exemplo de Prompt:**
```
Analise a evolução dos custos de projetos nos últimos 3 meses.
Identifique outliers e gere um gráfico de barras comparando valores por projeto.
```

#### 3.3.3 Envio para Backend

**Request:**
```javascript
const response = await api.post('/analytics/ask', {
    data: preparedData, // Object: { TABLE_KEY: [rows] }
    prompt: prompt,     // String: instrução do usuário
    model: selectedModel // String: "qwen2.5:14b"
});
```

**Navegação para Resultados:**
```javascript
if (response.data.success) {
    navigate('/analytics/results', {
        state: { result: response.data.response }
    });
}
```

---

### Etapa 4: Backend Processing (`analyticsController.askAI`)

**Arquivo:** `server/src/controllers/analyticsController.js`

#### 3.4.1 Conversão de Dados para Markdown

**Constantes de Otimização:**
```javascript
const MAX_ROWS = 50;       // Limite por tabela
const MAX_VAL_LEN = 80;    // Truncamento de valores longos
```

**Algoritmo de Conversão:**
```javascript
let dataContext = "";
Object.entries(data).forEach(([tableName, rows]) => {
    if (!rows || rows.length === 0) return;

    const limitedRows = rows.slice(0, MAX_ROWS);

    // Header da tabela
    dataContext += `\n## ${tableName} (${limitedRows.length} linhas)\n`;

    // Cabeçalho das colunas
    const columns = Object.keys(limitedRows[0]);
    dataContext += `|${columns.join('|')}|\n`;
    dataContext += `|${columns.map(() => '---').join('|')}|\n`;

    // Linhas de dados
    limitedRows.forEach(row => {
        const values = columns.map(col => {
            let val = row[col];

            // Tratar null/undefined
            if (val === null || val === undefined) return '-';

            // Converter objetos para JSON string
            if (typeof val === 'object') val = JSON.stringify(val);

            val = String(val);

            // CRÍTICO: Escapar pipe '|' para não quebrar tabela Markdown
            val = val.replace(/\|/g, '¦'); // Substitui por caractere visual similar

            // Truncar valores longos para economizar tokens
            if (val.length > MAX_VAL_LEN) val = val.substring(0, MAX_VAL_LEN) + '…';

            return val;
        });
        dataContext += `|${values.join('|')}|\n`;
    });
});
```

**Exemplo de Output Markdown:**
```markdown
## PSO_PROJETOS (2 linhas)
|PROJ_ID|NOME|VALOR|
|---|---|---|
|1|Projeto Alpha|150000.00|
|5|Projeto Beta|85000.00|

## OMIE_A_PAGAR (1 linhas)
|id|Valor da Conta|Situação|
|---|---|---|
|42|5000.00|Em Aberto|
```

#### 3.4.2 Construção do System Prompt

**Estratégia:** DADOS PRIMEIRO (contexto puro), instruções DEPOIS (concisas)

```javascript
const systemPrompt = `# DADOS REAIS (${totalRows} registros)
${dataContext}

---
# INSTRUÇÕES
Analista de Dados. Use SOMENTE os dados acima. NÃO invente dados.
- Responda em Markdown
- Se dados insuficientes, informe
- Seja direto e analítico

## Gráficos (json-chart)
Para visualizações, use:
\`\`\`json-chart
{"type":"bar|line|pie","title":"Título","xKey":"col_x","series":["col_y"],"data":[{"col_x":"A","col_y":100}]}
\`\`\`
Tipos: bar (comparação), line (tendência temporal), pie (proporção).
Sempre use \`\`\`json-chart\`\`\` para gráficos.`;
```

**Explicação dos Elementos:**

1. **`# DADOS REAIS (N registros)`**:
   - Marca clara de início do contexto
   - Número total de linhas para referência

2. **Tabelas Markdown**:
   - Formato nativo que o LLM entende perfeitamente
   - Estrutura preservada (colunas alinhadas)

3. **Separador `---`**:
   - Delimitador visual entre dados e instruções

4. **Instruções Compactas**:
   - Persona: "Analista de Dados"
   - Restrição: "Use SOMENTE os dados acima"
   - Formato: "Responda em Markdown"
   - Failsafe: "Se dados insuficientes, informe"

5. **Schema de Gráficos**:
   - Formato JSON explícito
   - Tipos suportados documentados
   - Exemplos de estrutura de dados

#### 3.4.3 Chamada para Ollama

**Request:**
```javascript
const ollamaResponse = await ollamaClient.post('/api/chat', {
    model: model || 'qwen2.5:14b',
    messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
    ],
    stream: false // Resposta completa, não streaming
});

const aiMessage = ollamaResponse.data.message?.content || "Sem resposta da IA.";
```

**Logging:**
```javascript
console.log(`[Analytics] Enviando para Ollama: ${Object.keys(data).join(', ')} | ${totalRows} linhas | ${dataContext.length} chars`);
console.log(`[Analytics] Resposta recebida: ${aiMessage.length} chars`);
```

**Response para Frontend:**
```javascript
return res.json({ success: true, response: aiMessage });
```

---

### Etapa 5: AnalysisResults (`/analytics/results`)

**Arquivo:** `client/src/pages/Analytics/AnalysisResults.jsx`

#### 3.5.1 Recebimento da Resposta

**Router State:**
```javascript
const location = useLocation();
const aiResponse = location.state?.result; // String Markdown da IA
```

#### 3.5.2 Renderização com ReactMarkdown

**Componente Principal:**
```javascript
<ReactMarkdown
    remarkPlugins={[remarkGfm]} // GitHub Flavored Markdown (tabelas)
    components={{
        code: CustomCodeRenderer,    // Intercepta blocos de código
        table: CustomTableRenderer,  // Estiliza tabelas
        // ... outros componentes customizados
    }}
>
    {aiResponse}
</ReactMarkdown>
```

#### 3.5.3 Interceptação de Gráficos

**Custom Code Renderer:**
```javascript
code: ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : '';

    const isExplicitChart = lang === 'json-chart';
    const isPotentialChart = lang === 'json' || !lang;

    if (!inline && (isExplicitChart || isPotentialChart)) {
        try {
            const content = String(children).replace(/\n$/, '');
            const chartData = JSON.parse(content);

            // Validação: Deve ter 'type', 'data' (array) e 'series' (array)
            if (chartData && chartData.type &&
                Array.isArray(chartData.data) &&
                Array.isArray(chartData.series)) {
                return <ChartRenderer {...chartData} />;
            }
        } catch (e) {
            // Not valid JSON, fall through to default code block
        }
    }

    return <code className={className} {...props}>{children}</code>;
}
```

**Exemplo de JSON Interceptado:**
```json-chart
{
  "type": "bar",
  "title": "Evolução de Custos por Projeto",
  "xKey": "projeto",
  "series": ["valor"],
  "data": [
    { "projeto": "Alpha", "valor": 150000 },
    { "projeto": "Beta", "valor": 85000 },
    { "projeto": "Gamma", "valor": 200000 }
  ]
}
```

#### 3.5.4 ChartRenderer Component

**Arquivo:** `client/src/components/ChartRenderer.jsx`

**Props Interface:**
```typescript
interface ChartRendererProps {
    type: 'bar' | 'line' | 'pie';
    data: Array<Record<string, any>>;
    title?: string;
    xKey: string;
    series: string[];
}
```

**Implementação:**
```javascript
const ChartRenderer = ({ type, data, title, xKey, series }) => {
    const renderChart = () => {
        switch (type) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xKey} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {series.map((key, index) => (
                                <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xKey} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {series.map((key, index) => (
                                <Line key={key} type="monotone" dataKey={key}
                                      stroke={COLORS[index % COLORS.length]} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                const valueKey = series[0];
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                dataKey={valueKey}
                                nameKey={xKey}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <Box sx={{ my: 4, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
            {title && <Typography variant="h6" align="center" gutterBottom>{title}</Typography>}
            {renderChart()}
        </Box>
    );
};
```

**Paleta de Cores:**
```javascript
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
```

#### 3.5.5 Customização de Tabelas Markdown

**Table Component:**
```javascript
table: ({ node, ...props }) => (
    <TableContainer component={Paper} variant="outlined"
                    sx={{ my: 2, bgcolor: 'background.paper' }}>
        <Table size="small">{props.children}</Table>
    </TableContainer>
),
thead: ({ node, ...props }) => <TableHead sx={{ bgcolor: 'action.hover' }}>{props.children}</TableHead>,
tbody: ({ node, ...props }) => <TableBody>{props.children}</TableBody>,
tr: ({ node, ...props }) => <TableRow hover>{props.children}</TableRow>,
th: ({ node, ...props }) => <TableCell sx={{ fontWeight: 'bold' }}>{props.children}</TableCell>,
td: ({ node, ...props }) => <TableCell>{props.children}</TableCell>
```

---

## 4. Camada Semântica (Semantic Layer)

**Arquivo:** `server/src/config/semanticLayer.js`

### 4.1 Estrutura de Dados

```javascript
const SEMANTIC_LAYER = {
    TABLE_KEY: {
        friendlyName: "Nome Amigável",           // Ex: "Projetos"
        tableName: "database.table_name",        // Ex: "psoffice.projetos"
        description: "Descrição da tabela",      // Opcional
        columns: {
            COLUMN_NAME: {
                label: "Label Amigável",         // Ex: "ID do Projeto"
                type: "string|number|date|money|boolean", // Tipo de dados
                sqlExpr: "SQL_EXPRESSION",       // Opcional: coluna computada
                columnInfo: "ACTUAL_COLUMN_NAME" // Opcional: nome real se diferente
            }
        }
    }
};
```

### 4.2 Exemplo Real - PSO_PROJETOS

```javascript
PSO_PROJETOS: {
    friendlyName: "Projetos",
    tableName: "psoffice.projetos",
    description: "Cadastro principal de projetos",
    columns: {
        PROJ_ID: {
            label: "ID Projeto",
            type: "number"
        },
        NOME: {
            label: "Nome do Projeto",
            type: "string"
        },
        VALOR: {
            label: "Valor Contrato",
            type: "money"
        },
        TRABALHO_PREVISTO: {
            label: "Horas Previstas",
            type: "number"
        },
        TRABALHO_REALIZADO: {
            label: "Horas Realizadas",
            type: "number"
        },
        PERCENTUAL_CONCLUIDO: {
            label: "% Concluído",
            type: "number",
            sqlExpr: "(TRABALHO_REALIZADO / NULLIF(TRABALHO_PREVISTO, 0)) * 100"
        }
    }
}
```

### 4.3 Funções Auxiliares

```javascript
const getAvailableSchemas = () => {
    return SEMANTIC_LAYER;
};

module.exports = {
    SEMANTIC_LAYER,
    getAvailableSchemas
};
```

### 4.4 Vantagens do Semantic Layer

1. **Segurança por Whitelist**: Apenas tabelas/colunas mapeadas são acessíveis
2. **Abstração de Complexidade**: Nomes técnicos traduzidos para termos de negócio
3. **Colunas Computadas**: Suporte a expressões SQL (agregações, cálculos)
4. **Validação Centralizada**: Backend valida contra este schema único
5. **Documentação Viva**: Schema serve como documentação do modelo de dados
6. **Multi-Database Support**: Prefixo `database.table` suporta múltiplos bancos

---

## 5. Processamento Backend

### 5.1 Arquitetura do Controller

**Arquivo:** `server/src/controllers/analyticsController.js`

**Estrutura:**
```javascript
const AnalyticsController = {
    getSchema: async (req, res) => { /* ... */ },
    executeQuery: async (req, res) => { /* ... */ },
    askAI: async (req, res) => { /* ... */ }
};

module.exports = AnalyticsController;
```

### 5.2 Validações de Segurança

#### 5.2.1 Whitelist de Tabelas

```javascript
if (!SEMANTIC_LAYER[tableKey]) {
    console.warn(`[Analytics] Tabela ignorada: ${tableKey} (não existe no semantic layer)`);
    continue;
}
```

#### 5.2.2 Whitelist de Colunas

```javascript
const validColumns = columns.filter(col => savedColumns[col]);
if (validColumns.length === 0) {
    console.warn(`[Analytics] Nenhuma coluna válida para ${tableKey}`);
    continue;
}
```

#### 5.2.3 Whitelist de Operadores

```javascript
const allowedOps = ['=', '>', '<', '>=', '<=', '!=', 'LIKE'];
if (!allowedOps.includes(operator)) {
    console.warn(`[Analytics] Operador rejeitado: ${operator}`);
    return; // Ignora filtro
}
```

#### 5.2.4 Parametrização SQL

```javascript
// CORRETO: Parametrizado (previne SQL Injection)
const query = `SELECT ${selectClause} FROM ${tableName} WHERE ${column} ${operator} ?`;
const [rows] = await db.execute(query, [value]);

// INCORRETO (vulnerável): String concatenation
const query = `SELECT * FROM ${tableName} WHERE ${column} = '${value}'`; // NUNCA FAZER ISSO!
```

### 5.3 Otimizações de Query

#### 5.3.1 Limite de Linhas

```javascript
const query = `SELECT ${selectClause} FROM ${tableName} ${whereClause} LIMIT 50`;
```

**Razões:**
- Evita sobrecarga de memória no Node.js
- Previne context overflow no LLM (limite de tokens)
- Melhora tempo de resposta (menos dados transferidos)

#### 5.3.2 Mock Data para Desenvolvimento

```javascript
if (tableKey === 'FINANCIAL') {
    // Mock data com filtros aplicados em JavaScript
    var mockData = [/* ... */];
    mockData = mockData.filter(row => {
        return filters[tableKey].every(f => {
            // Filtros JavaScript para dados mock
        });
    });
    resultData[tableKey] = mockData;
}
```

---

## 6. Integração com Ollama

### 6.1 Configuração do Cliente

**Arquivo:** `server/src/config/ollama.js`

```javascript
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

console.log(`[Ollama Config] Conectando em: ${ollamaUrl}`);

const ollamaClient = axios.create({
    baseURL: ollamaUrl
});

module.exports = ollamaClient;
```

### 6.2 API Endpoints do Ollama

#### 6.2.1 Listar Modelos (`GET /api/tags`)

**Request:**
```javascript
const response = await ollamaClient.get('/api/tags');
```

**Response:**
```json
{
  "models": [
    {
      "name": "qwen2.5:14b",
      "modified_at": "2026-01-15T10:30:00Z",
      "size": 8540641920,
      "digest": "sha256:abc123...",
      "details": {
        "format": "gguf",
        "family": "qwen2",
        "parameter_size": "14B"
      }
    }
  ]
}
```

#### 6.2.2 Chat Completions (`POST /api/chat`)

**Request:**
```javascript
const response = await ollamaClient.post('/api/chat', {
    model: 'qwen2.5:14b',
    messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ],
    stream: false,
    options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 4096
    }
});
```

**Response:**
```json
{
  "model": "qwen2.5:14b",
  "created_at": "2026-02-24T14:30:00Z",
  "message": {
    "role": "assistant",
    "content": "## Análise de Custos\n\nCom base nos dados fornecidos..."
  },
  "done": true,
  "total_duration": 12345678900,
  "load_duration": 500000000,
  "prompt_eval_count": 1250,
  "eval_count": 750
}
```

#### 6.2.3 Generate (Chat Simplificado) (`POST /api/generate`)

**Usado em:** `AiAnalytics.jsx` (chat direto sem dados)

```javascript
const response = await ollamaClient.post('/api/generate', {
    model: 'qwen2.5:14b',
    prompt: 'Explique o que é SQL Injection',
    stream: false
});
```

### 6.3 Tratamento de Erros

```javascript
try {
    const ollamaResponse = await ollamaClient.post('/api/chat', payload);
} catch (error) {
    console.error('Erro na IA:', error.message);

    if (error.code === 'ECONNREFUSED') {
        return res.json({
            success: false,
            error: "Não foi possível conectar ao Ollama. Verifique se o servidor está rodando na porta 11434."
        });
    }

    return res.status(500).json({ error: 'Falha ao processar análise inteligente.' });
}
```

### 6.4 Configuração de Ambiente

**Arquivo:** `server/.env`

```bash
OLLAMA_URL=http://localhost:11434
```

**Fallback:** Se variável não definida, usa `http://localhost:11434`

---

## 7. Renderização Frontend e Gráficos

### 7.1 React Markdown + Plugins

**Instalação:**
```bash
npm install react-markdown remark-gfm
```

**Importação:**
```javascript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
```

**Plugin remark-gfm:**
- Suporta tabelas GFM (GitHub Flavored Markdown)
- Suporta strikethrough (`~~texto~~`)
- Suporta task lists (`- [ ] tarefa`)
- Suporta autolinks

### 7.2 Recharts Integration

**Instalação:**
```bash
npm install recharts
```

**Componentes Usados:**
```javascript
import {
    BarChart, Bar,
    LineChart, Line,
    PieChart, Pie, Cell,
    XAxis, YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
```

**Características:**
- **ResponsiveContainer**: Gráficos adaptam largura ao container
- **Tooltip**: Hover mostra valores detalhados
- **Legend**: Legenda automática para séries
- **CartesianGrid**: Grid de fundo com linhas tracejadas

### 7.3 Fluxo de Renderização de Gráficos

```
┌───────────────────────────────────────────┐
│ LLM Responde com Markdown + JSON Charts  │
└─────────────────┬─────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────┐
│ ReactMarkdown com remarkGfm processa texto│
└─────────────────┬─────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────┐
│ Custom Code Component intercepta blocos   │
│ com linguagem "json-chart" ou JSON válido │
└─────────────────┬─────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────┐
│ JSON.parse() valida estrutura do gráfico  │
│ Valida presença de: type, data, series    │
└─────────────────┬─────────────────────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
       ▼                     ▼
 ✅ Válido              ❌ Inválido
       │                     │
       ▼                     ▼
┌─────────────┐    ┌──────────────────┐
│ChartRenderer│    │ <code> padrão    │
│  (Recharts) │    │ (syntax highlight)│
└─────────────┘    └──────────────────┘
```

### 7.4 Estilização de Tabelas

**CSS Customizado:**
```javascript
table: ({ node, ...props }) => (
    <TableContainer component={Paper} variant="outlined"
                    sx={{
                        my: 2,
                        bgcolor: 'background.paper',
                        overflowX: 'auto'
                    }}>
        <Table size="small" aria-label="data table">
            {props.children}
        </Table>
    </TableContainer>
)
```

**Vantagens:**
- Scroll horizontal automático (tabelas largas)
- Estilo consistente com Material-UI
- Hover effect nas linhas (`<TableRow hover>`)
- Background diferenciado no header (`bgcolor: 'action.hover'`)

---

## 8. Gerenciamento de Estado (AnalyticsContext)

**Arquivo:** `client/src/contexts/AnalyticsContext.jsx`

### 8.1 Estrutura do Context

```javascript
const AnalyticsContext = createContext({});

export function AnalyticsProvider({ children }) {
    const [selectedTables, setSelectedTables] = useState({});
    const [filters, setFilters] = useState({});
    const [dataPreview, setDataPreview] = useState(null);
    const [analysisResult, setAnalysisResult] = useState("");

    const clearAnalytics = () => {
        setSelectedTables({});
        setFilters({});
        setDataPreview(null);
        setAnalysisResult("");
    };

    return (
        <AnalyticsContext.Provider value={{
            selectedTables, setSelectedTables,
            filters, setFilters,
            dataPreview, setDataPreview,
            analysisResult, setAnalysisResult,
            clearAnalytics
        }}>
            {children}
        </AnalyticsContext.Provider>
    );
}
```

### 8.2 Custom Hook

```javascript
export function useAnalytics() {
    return useContext(AnalyticsContext);
}
```

**Uso:**
```javascript
const { selectedTables, setSelectedTables } = useAnalytics();
```

### 8.3 Estado Persistido Entre Etapas

| Estado | Tipo | Origem | Consumidores |
|--------|------|--------|--------------|
| **selectedTables** | `{ [tableKey]: string[] }` | QueryBuilder | DataPreview, PromptBuilder |
| **filters** | `{ [tableKey]: Filter[] }` | DataPreview | DataPreview (re-fetch) |
| **dataPreview** | `{ [tableKey]: Row[] }` | DataPreview | PromptBuilder, AnalysisResults |
| **analysisResult** | `string` (Markdown) | AnalyticsResults | (Para futuras features) |

**Filter Interface:**
```typescript
interface Filter {
    id: number;          // Timestamp (Date.now())
    column: string;      // Nome da coluna
    operator: string;    // '=', '>', '<', '>=', '<=', '!=', 'LIKE'
    value: string;       // Valor do filtro
}
```

### 8.4 Provider Wrapper

**Arquivo:** `client/src/App.jsx`

```javascript
<AuthProvider>
    <AnalyticsProvider>
        <BrowserRouter>
            <Routes>
                {/* ... rotas */}
            </Routes>
        </BrowserRouter>
    </AnalyticsProvider>
</AuthProvider>
```

---

## 9. Segurança e Validações

### 9.1 Camadas de Segurança

```
┌──────────────────────────────────────────┐
│ CAMADA 1: Frontend (Cliente)             │
│ - Validação de inputs vazios             │
│ - Desabilitar botões se dados inválidos  │
│ - Sanitização básica de strings          │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ CAMADA 2: Backend (Controller)           │
│ - Whitelist de tabelas (Semantic Layer)  │
│ - Whitelist de colunas (Semantic Layer)  │
│ - Whitelist de operadores SQL             │
│ - Parametrização de queries (mysql2)     │
│ - Limite de linhas (LIMIT 50)            │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ CAMADA 3: Database (MySQL)               │
│ - Prepared statements (mysql2)           │
│ - User permissions (GRANT/REVOKE)        │
│ - Connection pooling com limite          │
└──────────────────────────────────────────┘
```

### 9.2 Prevenção de SQL Injection

**Cenário de Ataque:**
```javascript
// Input malicioso do usuário
const maliciousValue = "'; DROP TABLE users; --";
```

**Proteção (Parametrização):**
```javascript
// SEGURO: Valor tratado como literal, não como código SQL
const query = `SELECT * FROM projetos WHERE nome LIKE ?`;
await db.execute(query, [`%${maliciousValue}%`]);
// Query executada: SELECT * FROM projetos WHERE nome LIKE '%\'; DROP TABLE users; --%'
```

**SEM Proteção (Concatenação):**
```javascript
// VULNERÁVEL: NÃO FAZER!
const query = `SELECT * FROM projetos WHERE nome LIKE '%${maliciousValue}%'`;
await db.query(query);
// Query executada: SELECT * FROM projetos WHERE nome LIKE '%'; DROP TABLE users; --%'
// Resultado: Tabela users deletada!
```

### 9.3 Validação de Tipo de Dados

**Frontend (Básico):**
```javascript
<TextField
    type="number"
    value={filterValue}
    onChange={(e) => setFilterValue(e.target.value)}
/>
```

**Backend (Robusto):**
```javascript
// Validação por tipo definido no Semantic Layer
const columnType = SEMANTIC_LAYER[tableKey].columns[column].type;

switch (columnType) {
    case 'number':
    case 'money':
        if (isNaN(parseFloat(value))) {
            console.warn(`Valor inválido para coluna numérica: ${value}`);
            return; // Ignora filtro
        }
        break;

    case 'date':
        if (isNaN(Date.parse(value))) {
            console.warn(`Valor inválido para coluna de data: ${value}`);
            return;
        }
        break;
}
```

### 9.4 Sanitização de Markdown

**Escape de Caracteres Especiais:**
```javascript
// Pipe '|' quebra tabelas Markdown
val = val.replace(/\|/g, '¦'); // Substitui por similar visual

// Outras sanitizações possíveis:
val = val.replace(/\n/g, ' ');  // Remove quebras de linha
val = val.replace(/\t/g, ' ');  // Remove tabs
```

### 9.5 Rate Limiting (Futuro)

**Recomendação:**
```javascript
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 requisições por janela
    message: 'Muitas requisições de IA. Aguarde 15 minutos.'
});

app.use('/api/analytics/ask', aiLimiter);
```

---

## 10. Otimizações de Performance

### 10.1 Limitações de Dados

| Componente | Limite | Razão |
|------------|--------|-------|
| **Linhas por Tabela** | 50 | Context window do LLM (~32k tokens) |
| **Tamanho de Valor** | 80 chars | Economia de tokens |
| **Timeout de Query** | 30s | Evitar travamento do servidor |
| **Pool de Conexões** | 10 | Limite mysql2 connection pool |

### 10.2 Code Splitting (Frontend)

**Vite Lazy Loading:**
```javascript
const QueryBuilder = React.lazy(() => import('./pages/Analytics/QueryBuilder'));
const DataPreview = React.lazy(() => import('./pages/Analytics/DataPreview'));
// etc...

<Suspense fallback={<CircularProgress />}>
    <Route path="/analytics/builder" element={<QueryBuilder />} />
</Suspense>
```

### 10.3 Memoização de Componentes

**React.memo:**
```javascript
const TableCard = React.memo(({ tableKey, tableData, selectedColumns, onSelectTable, onToggleColumn }) => (
    // Componente pesado, renderiza apenas se props mudarem
));
```

**useMemo para Agrupamento:**
```javascript
const groupedSchema = useMemo(() => {
    const omie = [];
    const pso = [];
    // Lógica de agrupamento
    return { omie, pso };
}, [schema]); // Recalcula apenas se schema mudar
```

### 10.4 Debounce de Filtros (Futuro)

**Recomendação:**
```javascript
import { debounce } from 'lodash';

const debouncedFilter = useMemo(
    () => debounce((filters) => {
        fetchData(filters);
    }, 500),
    []
);
```

### 10.5 Compressão de Resposta

**Backend (Express):**
```javascript
const compression = require('compression');
app.use(compression()); // Gzip automático para respostas grandes
```

---

## 11. Tratamento de Erros

### 11.1 Hierarquia de Erros

```
┌──────────────────────────────────────────┐
│ NÍVEL 1: Validação de Input (Frontend)   │
│ - Campos vazios                           │
│ - Formato inválido                        │
│ Ação: Desabilitar botão / Exibir aviso   │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ NÍVEL 2: Erro de Requisição (API)        │
│ - Network error (ECONNREFUSED)            │
│ - Timeout                                 │
│ - 4xx/5xx HTTP status                     │
│ Ação: Alert user-friendly                │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ NÍVEL 3: Erro de Processamento (Backend) │
│ - SQL error                               │
│ - Ollama connection refused               │
│ - Invalid JSON parse                      │
│ Ação: Log + resposta genérica ao frontend│
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ NÍVEL 4: Erro Crítico (Sistema)          │
│ - Database offline                        │
│ - Out of memory                           │
│ - Ollama service down                     │
│ Ação: Health check fail + alertas ops    │
└──────────────────────────────────────────┘
```

### 11.2 Try-Catch Pattern

**Frontend:**
```javascript
try {
    const response = await api.post('/analytics/ask', payload);
    if (response.data.success) {
        navigate('/analytics/results', { state: { result: response.data.response } });
    } else {
        setError(response.data.error || "Erro na análise.");
    }
} catch (err) {
    console.error(err);
    setError("Erro de comunicação com o servidor de IA.");
}
```

**Backend:**
```javascript
try {
    const [rows] = await db.execute(query, params);
    resultData[tableKey] = rows;
} catch (error) {
    console.error('Erro no Query Builder:', error);
    return res.status(500).json({ error: 'Erro ao processar dados.' });
}
```

### 11.3 Mensagens User-Friendly

**Mapeamento de Erros:**
```javascript
const ERROR_MESSAGES = {
    'ECONNREFUSED': "Não foi possível conectar ao servidor de IA. Verifique se o Ollama está rodando.",
    'ETIMEDOUT': "A requisição demorou muito. Tente novamente com menos dados.",
    'ER_ACCESS_DENIED': "Erro de permissão no banco de dados.",
    'ER_NO_SUCH_TABLE': "Tabela não encontrada.",
};

if (error.code in ERROR_MESSAGES) {
    return res.json({ success: false, error: ERROR_MESSAGES[error.code] });
}
```

### 11.4 Fallback e Recovery

**Modo Offline (Schema Mock):**
```javascript
try {
    const response = await api.get('/analytics/schema');
    setSchema(response.data);
} catch (err) {
    console.warn("API Schema falhou, usando mock local");
    setSchema(MOCK_SCHEMA);
    setError("Modo Offline: Dados reais indisponíveis.");
}
```

---

## 12. Diagramas de Fluxo

### 12.1 Fluxo Completo (Sequência)

```
Usuario                Frontend             Backend              Ollama
  │                      │                    │                    │
  │ 1. Acessa /analytics │                    │                    │
  ├─────────────────────>│                    │                    │
  │                      │ 2. GET /schema     │                    │
  │                      ├───────────────────>│                    │
  │                      │ 3. SEMANTIC_LAYER  │                    │
  │                      │<───────────────────┤                    │
  │                      │                    │                    │
  │ 4. Seleciona Tabelas │                    │                    │
  ├─────────────────────>│                    │                    │
  │                      │ [Estado: selectedTables]                │
  │                      │                    │                    │
  │ 5. Aplica Filtros    │                    │                    │
  ├─────────────────────>│ 6. POST /query     │                    │
  │                      ├───────────────────>│                    │
  │                      │                    │ 7. SQL Parametrizado│
  │                      │                    ├──> MySQL           │
  │                      │ 8. { data: {...} } │<─── (max 50 rows)  │
  │                      │<───────────────────┤                    │
  │                      │ [Estado: dataPreview]                   │
  │                      │                    │                    │
  │ 9. Escreve Prompt    │                    │                    │
  ├─────────────────────>│ 10. POST /ask      │                    │
  │                      ├───────────────────>│                    │
  │                      │                    │ 11. Converte p/ MD │
  │                      │                    │ 12. System Prompt  │
  │                      │                    │ 13. POST /api/chat │
  │                      │                    ├───────────────────>│
  │                      │                    │                    │ 14. LLM Processa
  │                      │                    │ 15. Markdown       │
  │                      │                    │<───────────────────┤
  │                      │ 16. { response }   │                    │
  │                      │<───────────────────┤                    │
  │                      │ [Estado: analysisResult]                │
  │                      │                    │                    │
  │ 17. Renderiza MD+Charts                   │                    │
  │<─────────────────────┤                    │                    │
  │                      │                    │                    │
```

### 12.2 Fluxo de Validação de Filtros

```
┌────────────────────────────────────────────┐
│ Usuário Adiciona Filtro                    │
│ { column: "VALOR", operator: ">", value: "10000" }
└─────────────────┬──────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────┐
│ Frontend: Validação Básica                 │
│ ✓ Column não vazio                         │
│ ✓ Value não vazio                          │
└─────────────────┬──────────────────────────┘
                  │ OK
                  ▼
┌────────────────────────────────────────────┐
│ Adiciona ao Estado (AnalyticsContext)      │
│ filters[tableKey].push(newFilter)          │
└─────────────────┬──────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────┐
│ useEffect Detecta Mudança em filters       │
│ Dispara: fetchData()                       │
└─────────────────┬──────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────┐
│ POST /api/analytics/query                  │
│ { selectedTables, filters }                │
└─────────────────┬──────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────┐
│ Backend: Validação Rigorosa                │
│ 1. Column existe em SEMANTIC_LAYER?        │
│ 2. Operator em whitelist? [=,>,<,LIKE...]  │
│ 3. Tipo de value compatível?               │
└─────────────────┬──────────────────────────┘
           ✓ Todas OK │         ✗ Falha
                  │                  │
                  ▼                  ▼
         ┌──────────────┐   ┌──────────────┐
         │Constrói WHERE│   │Ignora Filtro │
         │Parametrizado │   │Log Warning   │
         └──────┬───────┘   └──────────────┘
                │
                ▼
    ┌──────────────────────┐
    │ Executa SQL c/ LIMIT │
    │ db.execute(query, [values])
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Retorna Dados        │
    │ { success: true, data }
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Frontend Atualiza    │
    │ dataPreview          │
    │ Renderiza Tabela     │
    └──────────────────────┘
```

### 12.3 Fluxo de Renderização de Gráfico

```
┌────────────────────────────────────────────┐
│ LLM Retorna Markdown                       │
│ "## Análise\n\nTexto...\n\n```json-chart  │
│ {...}\n```"                                 │
└─────────────────┬──────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────┐
│ ReactMarkdown Processa                     │
│ remarkGfm: Tabelas, Strikethrough, etc     │
└─────────────────┬──────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────┐
│ Custom Code Component Detecta:             │
│ className="language-json-chart"            │
│ OU lang="json" com schema válido           │
└─────────────────┬──────────────────────────┘
                  │ Intercepta
                  ▼
┌────────────────────────────────────────────┐
│ JSON.parse(children)                       │
│ const chartData = {...}                    │
└─────────────────┬──────────────────────────┘
                  │
         ┌────────┴─────────┐
         │                  │
    ✓ Válido          ✗ Inválido
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│ Valida Schema:  │  │ Renderiza como  │
│ ✓ type exists   │  │ <code> normal   │
│ ✓ data is array │  │ (syntax highlight)│
│ ✓ series array  │  └─────────────────┘
└────────┬────────┘
         │ ✓ Todos OK
         ▼
┌─────────────────────────────────────────────┐
│ <ChartRenderer {...chartData} />            │
│                                              │
│ switch (type):                               │
│   case 'bar':  <BarChart />                  │
│   case 'line': <LineChart />                 │
│   case 'pie':  <PieChart />                  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Recharts Renderiza SVG                       │
│ - ResponsiveContainer (100% width)           │
│ - Tooltip interativo (hover)                 │
│ - Legend automática                          │
│ - Cores da paleta COLORS                     │
└─────────────────────────────────────────────┘
```

---

## 13. Considerações Finais

### 13.1 Boas Práticas Implementadas

✅ **Separation of Concerns**: Frontend UI, Backend Logic, AI Processing
✅ **Single Source of Truth**: AnalyticsContext para estado global
✅ **Defensive Programming**: Validações em múltiplas camadas
✅ **Privacy by Design**: LLM local, dados não saem do ambiente
✅ **Progressive Enhancement**: Interface progressivamente detalhada
✅ **Error Handling**: Try-catch em todos os pontos críticos
✅ **Performance**: Limites de dados, memoização, code splitting
✅ **Security**: Whitelist + Parametrização SQL
✅ **Accessibility**: ARIA labels, keyboard navigation
✅ **Responsive**: Material-UI breakpoints

### 13.2 Melhorias Futuras

🔮 **Streaming de Respostas**: Implementar SSE para exibir análise progressivamente
🔮 **Cache de Queries**: Redis para cachear queries frequentes
🔮 **Histórico de Análises**: Salvar análises anteriores no banco
🔮 **Exportação**: PDF/Excel com gráficos embutidos
🔮 **Agendamento**: Análises recorrentes via cron jobs
🔮 **Múltiplos Modelos**: Suporte para trocar modelo dinamicamente
🔮 **Fine-tuning**: Treinar modelo específico para dados de negócio
🔮 **Collaborative Filtering**: Sugestões de análises baseadas em histórico

### 13.3 Métricas de Performance (Benchmarks)

| Operação | Tempo Médio | Observação |
|----------|-------------|------------|
| GET /schema | ~50ms | Retorna objeto em memória |
| POST /query (1 tabela, 50 linhas) | ~200ms | Query simples sem joins |
| POST /query (3 tabelas, 150 linhas) | ~500ms | Múltiplas queries sequenciais |
| POST /ask (Ollama) | ~8-15s | Depende do tamanho do contexto |
| Renderização Markdown | ~100ms | Parsing + React render |
| Renderização Gráfico | ~50ms | SVG rendering Recharts |

### 13.4 Dependências Críticas

| Dependência | Versão | Licença | Criticidade |
|-------------|--------|---------|-------------|
| React | 19.2.0 | MIT | 🔴 Crítica |
| Express | 5.2.1 | MIT | 🔴 Crítica |
| mysql2 | 3.16.0 | MIT | 🔴 Crítica |
| Ollama | latest | MIT | 🔴 Crítica |
| react-markdown | 10.1.0 | MIT | 🟡 Alta |
| recharts | 3.7.0 | MIT | 🟡 Alta |
| Material-UI | 7.3.6 | MIT | 🟢 Média |

---

## 14. Glossário Técnico

| Termo | Definição |
|-------|-----------|
| **LLM** | Large Language Model - Modelo de linguagem grande treinado em vastos datasets |
| **Context Window** | Limite máximo de tokens que o LLM pode processar em uma única requisição |
| **Token** | Unidade básica de texto (palavra, sub-palavra ou caractere) processada pelo LLM |
| **Semantic Layer** | Camada de abstração que mapeia estruturas de dados técnicas para termos de negócio |
| **SQL Injection** | Ataque que explora vulnerabilidades em queries SQL não parametrizadas |
| **Parameterized Query** | Query SQL com placeholders (?) substituídos por valores escapados |
| **Markdown** | Linguagem de marcação leve para formatação de texto |
| **GFM** | GitHub Flavored Markdown - Extensão do Markdown com tabelas e outros recursos |
| **Recharts** | Biblioteca React para gráficos baseada em D3.js |
| **Context API** | API nativa do React para gerenciamento de estado global |
| **Wizard** | Interface de múltiplas etapas guiando usuário através de um processo |
| **Whitelist** | Lista de valores permitidos (oposto de blacklist) |
| **Accordion** | Componente UI colapsável para organizar conteúdo |
| **SSE** | Server-Sent Events - Protocolo para streaming unidirecional do servidor |

---

## 15. Referências

- **Ollama Documentation**: https://ollama.ai/docs
- **Qwen 2.5 Model**: https://huggingface.co/Qwen/Qwen2.5-14B
- **React Markdown**: https://github.com/remarkjs/react-markdown
- **Recharts**: https://recharts.org/en-US
- **Material-UI**: https://mui.com/material-ui
- **MySQL2**: https://github.com/sidorares/node-mysql2
- **Express.js**: https://expressjs.com
- **Clean Architecture**: Robert C. Martin (Uncle Bob)

---

**Documento Gerado por:** Hub PMO AI Analytics Team
**Última Revisão:** 24/02/2026
**Status:** ✅ Produção v2.0.0
