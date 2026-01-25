const { getAvailableSchemas, SEMANTIC_LAYER } = require('../config/semanticLayer');
const db = require('../config/db');
const axios = require('axios'); // Agora disponível

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

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
            const { selectedTables } = req.body;

            if (!selectedTables || Object.keys(selectedTables).length === 0) {
                return res.status(400).json({ error: 'Nenhuma tabela selecionada.' });
            }

            let resultData = {};

            for (const [tableKey, columns] of Object.entries(selectedTables)) {
                if (!SEMANTIC_LAYER[tableKey]) continue;

                const tableName = SEMANTIC_LAYER[tableKey].tableName;
                const savedColumns = SEMANTIC_LAYER[tableKey].columns;
                const validColumns = columns.filter(col => savedColumns[col]);

                if (validColumns.length === 0) continue;

                const selectClause = validColumns.join(', ');

                // Executar Query (Mock vs Real)
                if (tableKey === 'FINANCIAL') {
                    // Mock Data
                    resultData[tableKey] = [
                        { date: '2023-01-01', value: 1500.00, category: 'Software', description: 'Licença' },
                        { date: '2023-01-05', value: 200.00, category: 'Infra', description: 'Cabo' },
                        { date: '2023-02-10', value: 3500.00, category: 'Serviços', description: 'Consultoria' },
                    ];
                } else {
                    // Real DB (Se conexão estiver pronta)
                    // const query = `SELECT ${selectClause} FROM ${tableName} LIMIT 50`;
                    // ... implementação real

                    // Mock para Demo enquanto não conecta no DB real
                    resultData[tableKey] = [
                        { name: 'Projeto Alpha', status: 'Em Andamento', budget: 50000 },
                        { name: 'Projeto Beta', status: 'Concluído', budget: 120000 },
                    ];
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

Dados Disponíveis:
${dataContext}
          `;

            // 3. Chamar Ollama
            // Nota: Endpoint /api/chat ou /api/generate dependendo da versão
            const ollamaResponse = await axios.post(`${OLLAMA_URL}/api/chat`, {
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
