const { getAvailableSchemas, SEMANTIC_LAYER } = require('../config/semanticLayer');
const db = require('../config/db');
const ollamaClient = require('../config/ollama');

const AnalyticsController = {
    // 1. Schema
    getSchema: async (req, res) => {
        try {
            return res.json(getAvailableSchemas());
        } catch (error) {
            console.error('Erro ao buscar schema:', error);
            return res.status(500).json({ error: 'Erro interno ao buscar schema de dados.' });
        }
    },

    // 2. Query Data
    executeQuery: async (req, res) => {
        try {
            const { selectedTables, filters } = req.body; // filters: { TABLE_KEY: [ { column, operator, value } ] }

            if (!selectedTables || Object.keys(selectedTables).length === 0) {
                return res.status(400).json({ error: 'Nenhuma tabela selecionada.' });
            }

            let resultData = {};

            for (const [tableKey, columns] of Object.entries(selectedTables)) {
                if (!SEMANTIC_LAYER[tableKey]) continue;

                const tableName = SEMANTIC_LAYER[tableKey].tableName;
                const savedColumns = SEMANTIC_LAYER[tableKey].columns;

                // Validate Columns
                const validColumns = columns.filter(col => savedColumns[col]);
                if (validColumns.length === 0) continue;

                const selectClause = validColumns.join(', ');

                // Validate and Build Filters
                let whereClause = "";
                let params = [];

                if (filters && filters[tableKey] && Array.isArray(filters[tableKey])) {
                    const conditions = [];
                    filters[tableKey].forEach(filter => {
                        const { column, operator, value } = filter;

                        // Security Check: Column must be whitelisted
                        if (!savedColumns[column]) return;

                        // Security Check: Operator must be whitelisted
                        const allowedOps = ['=', '>', '<', '>=', '<=', '!=', 'LIKE'];
                        if (!allowedOps.includes(operator)) return;

                        conditions.push(`${column} ${operator} ?`);
                        params.push(value);
                    });

                    if (conditions.length > 0) {
                        whereClause = `WHERE ${conditions.join(' AND ')}`;
                    }
                }

                // Executar Query (Mock vs Real)
                if (tableKey === 'FINANCIAL') {
                    // Mock Data Implementation with filtering
                    var mockData = [
                        { date: '2023-01-01', value: 1500.00, category: 'Software', description: 'Licença' },
                        { date: '2023-01-05', value: 200.00, category: 'Infra', description: 'Cabo' },
                        { date: '2023-02-10', value: 3500.00, category: 'Serviços', description: 'Consultoria' },
                        { date: '2023-03-15', value: 12000.00, category: 'Software', description: 'Dev Outsourcing' },
                    ];

                    // Simple JS Filter for Mock Data
                    if (filters && filters[tableKey]) {
                        mockData = mockData.filter(row => {
                            return filters[tableKey].every(f => {
                                const val = row[f.column];
                                const target = f.value;
                                switch (f.operator) {
                                    case '=': return val == target;
                                    case '!=': return val != target;
                                    case '>': return val > target;
                                    case '<': return val < target;
                                    case '>=': return val >= target;
                                    case '<=': return val <= target;
                                    case 'LIKE': return String(val).toLowerCase().includes(String(target).toLowerCase());
                                    default: return true;
                                }
                            });
                        });
                    }

                    resultData[tableKey] = mockData;
                } else {
                    // Real DB Query Construction
                    const query = `SELECT ${selectClause} FROM ${tableName} ${whereClause} LIMIT 50`;
                    console.log(`[Analytics] Executing: ${query} params:`, params);

                    const [rows] = await db.execute(query, params);
                    resultData[tableKey] = rows;
                }
            }

            return res.json({ success: true, data: resultData });

        } catch (error) {
            console.error('Erro no Query Builder:', error);
            return res.status(500).json({ error: 'Erro ao processar dados.' });
        }
    },

    // 3. Ask AI
    askAI: async (req, res) => {
        try {
            const { data, prompt, model } = req.body;

            if (!data || !prompt) {
                return res.status(400).json({ error: "Dados e Prompt são obrigatórios." });
            }

            // 1. Converter Dados para Markdown Table
            let dataContext = "";
            Object.entries(data).forEach(([tableName, rows]) => {
                if (rows.length === 0) return;

                dataContext += `\n### Tabela: ${tableName}\n`;

                // Header
                const columns = Object.keys(rows[0]);
                dataContext += `| ${columns.join(' | ')} |\n`;
                dataContext += `| ${columns.map(() => '---').join(' | ')} |\n`;

                // Rows
                rows.forEach(row => {
                    const values = columns.map(col => {
                        const val = row[col];
                        return typeof val === 'object' ? JSON.stringify(val) : val;
                    });
                    dataContext += `| ${values.join(' | ')} |\n`;
                });
            });

            // 2. Montar Prompt System
            const systemPrompt = `
Você é um Analista de Dados Sênior da empresa.
Sua função é analisar os dados fornecidos e responder à pergunta do usuário.
Responda SEMPRE em formato Markdown.
Seja direto, analítico e profissional.
Use tópicos (bullet points) para organizar insights.
Se houver dados financeiros, sugira tendências.


Siga as instruções para a criação de um gráfico caso seja necessário....

## Data Visualization (Charts)
If the data analysis suggests a trend or comparison that is best visualized with a chart (and the user didn't explicitly forbid it), you MUST include a chart definition in your response.

To create a chart, output a specific JSON block wrapped in a code block with the language identifier \`json-chart\`.

### Chart Format
\`\`\`json-chart
{
  "type": "bar" | "line" | "pie",
  "title": "Chart Title",
  "xKey": "key_for_x_axis_labels",
  "series": ["key_for_y_axis_values", "second_series_key"],
  "data": [
    { "key_for_x_axis_labels": "Label 1", "key_for_y_axis_values": 100 },
    { "key_for_x_axis_labels": "Label 2", "key_for_y_axis_values": 150 }
  ]
}
\`\`\`

### Examples

**Bar Chart Example:**
\`\`\`json-chart
{
  "type": "bar",
  "title": "Project Budget Analysis",
  "xKey": "name",
  "series": ["budget"],
  "data": [
    { "name": "Alpha", "budget": 50000 },
    { "name": "Beta", "budget": 75000 }
  ]
}
\`\`\`

**Pie Chart Example:**
\`\`\`json-chart
{
  "type": "pie",
  "title": "Project Status Distribution",
  "xKey": "status",
  "series": ["count"],
  "data": [
    { "status": "Active", "count": 10 },
    { "status": "Completed", "count": 5 }
  ]
}
\`\`\`

DO NOT output raw JSON without the \`\`\`json-chart\`\`\` wrapper.
DO NOT use generic markdown tables if a chart is more appropriate.

Dados Disponíveis:
${dataContext}
          `;

            // 3. Chamar Ollama
            // Nota: Endpoint /api/chat ou /api/generate dependendo da versão
            const ollamaResponse = await ollamaClient.post('/api/chat', {
                model: model || 'qwen2.5:14b',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                stream: false
            });

            const aiMessage = ollamaResponse.data.message?.content || "Sem resposta da IA.";

            return res.json({ success: true, response: aiMessage });

        } catch (error) {
            console.error('Erro na IA:', error.message);

            if (error.code === 'ECONNREFUSED') {
                return res.json({
                    success: false,
                    error: "Não foi possível conectar ao Ollama. Verifique se o servidor de IA está rodando na porta 11434."
                });
            }

            return res.status(500).json({ error: 'Falha ao processar análise inteligente.' });
        }
    }
};

module.exports = AnalyticsController;
