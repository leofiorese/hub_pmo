/**
 * EXEMPLO: Como usar o mock de dados financeiros no analyticsController
 *
 * Este arquivo demonstra como integrar os dados mock no fluxo do AI Analytics
 * conforme descrito em docs/fluxo_ia_analytics.md (Seção 5.3.2)
 */

// ========================================
// 1. IMPORTAÇÃO NO CONTROLLER
// ========================================
// No arquivo: server/src/controllers/analyticsController.js

const { mockFinancialData, getFilteredFinancialData } = require('../data/mockFinancialData');

// ========================================
// 2. ADICIONAR AO SEMANTIC LAYER
// ========================================
// No arquivo: server/src/config/semanticLayer.js

const SEMANTIC_LAYER = {
    // ... outras tabelas existentes ...

    MOCK_FINANCEIRO: {
        friendlyName: "Dados Financeiros (Mock)",
        tableName: "mock.financeiro",  // Prefixo 'mock' indica dados simulados
        description: "Dados financeiros simulados para testes e desenvolvimento",
        columns: {
            Data: {
                label: "Data do Lançamento",
                type: "date"
            },
            Valor: {
                label: "Valor (R$)",
                type: "money"
            },
            "Categoria de Gasto": {
                label: "Categoria de Gasto",
                type: "string"
            }
        }
    }
};

// ========================================
// 3. INTEGRAÇÃO NO EXECUTEQUERY
// ========================================
// No arquivo: server/src/controllers/analyticsController.js
// Dentro do método executeQuery

executeQuery: async (req, res) => {
    try {
        const { selectedTables, filters } = req.body;
        const resultData = {};

        for (const [tableKey, columns] of Object.entries(selectedTables)) {
            // Verificar se é a tabela mock
            if (tableKey === 'MOCK_FINANCEIRO') {
                console.log('[Analytics] Usando dados MOCK para MOCK_FINANCEIRO');

                // Aplicar filtros JavaScript (já que não é query SQL)
                let mockData = [...mockFinancialData];

                if (filters && filters[tableKey]) {
                    mockData = mockData.filter(row => {
                        return filters[tableKey].every(filter => {
                            const { column, operator, value } = filter;
                            const cellValue = row[column];

                            // Aplicar operadores
                            switch (operator) {
                                case '=':
                                    return String(cellValue) === String(value);
                                case '>':
                                    return parseFloat(cellValue) > parseFloat(value);
                                case '<':
                                    return parseFloat(cellValue) < parseFloat(value);
                                case '>=':
                                    return parseFloat(cellValue) >= parseFloat(value);
                                case '<=':
                                    return parseFloat(cellValue) <= parseFloat(value);
                                case '!=':
                                    return String(cellValue) !== String(value);
                                case 'LIKE':
                                    return String(cellValue).toLowerCase().includes(String(value).toLowerCase());
                                default:
                                    return true;
                            }
                        });
                    });
                }

                // Selecionar apenas colunas solicitadas
                mockData = mockData.map(row => {
                    const filtered = {};
                    columns.forEach(col => {
                        if (row.hasOwnProperty(col)) {
                            filtered[col] = row[col];
                        }
                    });
                    return filtered;
                });

                // Limitar a 50 registros (como nas queries reais)
                resultData[tableKey] = mockData.slice(0, 50);

                continue; // Pula a execução SQL
            }

            // ... lógica normal para tabelas reais ...
        }

        return res.json({ success: true, data: resultData });

    } catch (error) {
        console.error('[Analytics] Erro no executeQuery:', error);
        return res.status(500).json({ error: 'Erro ao processar query.' });
    }
}

// ========================================
// 4. EXEMPLO DE USO NO FRONTEND
// ========================================
// No arquivo: client/src/pages/Analytics/QueryBuilder.jsx

// Os dados mock aparecerão automaticamente na lista de tabelas disponíveis
// quando o schema for carregado via GET /api/analytics/schema

// Exemplo de seleção programática (útil para testes):
const handleSelectMockData = () => {
    setSelectedTables({
        'MOCK_FINANCEIRO': ['Data', 'Valor', 'Categoria de Gasto']
    });
};

// ========================================
// 5. EXEMPLO DE ANÁLISE COM IA
// ========================================
// Prompt de exemplo que pode ser usado no PromptBuilder:

const examplePrompts = [
    // Análise de Tendências
    `Analise a evolução dos gastos nos últimos 5 meses.
    Identifique as categorias com maior crescimento percentual.
    Gere um gráfico de linha mostrando a tendência temporal.`,

    // Análise de Distribuição
    `Calcule a participação percentual de cada categoria no total de gastos.
    Identifique os 3 maiores gastos.
    Gere um gráfico de pizza mostrando a distribuição por categoria.`,

    // Análise Comparativa
    `Compare os gastos mensais entre Janeiro e Fevereiro de 2026.
    Liste as categorias que tiveram aumento ou redução.
    Gere um gráfico de barras comparando os dois períodos.`,

    // Análise de Anomalias
    `Identifique outliers nos valores de cada categoria.
    Calcule a média e desvio padrão por categoria.
    Liste transações com valores acima de 2 desvios-padrão.`,

    // Projeção e Insights
    `Com base nos dados de Jan-Mai 2026, projete os gastos para Junho.
    Identifique padrões sazonais ou recorrentes.
    Sugira oportunidades de otimização de custos.`
];

// ========================================
// 6. RESPOSTA ESPERADA DA IA (Exemplo)
// ========================================
// A IA deve retornar Markdown + JSON Charts como:

const exampleAIResponse = `
## Análise de Gastos - Janeiro a Maio 2026

### Resumo Executivo
Analisando os 54 lançamentos financeiros, identificamos um total de **R$ 182.650,00** em gastos
distribuídos em 12 categorias diferentes.

### Top 3 Categorias por Volume
1. **Folha de Pagamento**: R$ 80.400,00 (44%)
2. **Consultoria Externa**: R$ 32.000,00 (17,5%)
3. **Aluguel**: R$ 17.500,00 (9,6%)

### Evolução Mensal

\`\`\`json-chart
{
  "type": "line",
  "title": "Evolução de Gastos Mensais",
  "xKey": "mes",
  "series": ["total"],
  "data": [
    { "mes": "Jan/26", "total": 30650 },
    { "mes": "Fev/26", "total": 37550 },
    { "mes": "Mar/26", "total": 38530 },
    { "mes": "Abr/26", "total": 37410 },
    { "mes": "Mai/26", "total": 38510 }
  ]
}
\`\`\`

### Distribuição por Categoria

\`\`\`json-chart
{
  "type": "pie",
  "title": "Distribuição de Gastos por Categoria",
  "xKey": "categoria",
  "series": ["valor"],
  "data": [
    { "categoria": "Folha", "valor": 80400 },
    { "categoria": "Consultoria", "valor": 32000 },
    { "categoria": "Aluguel", "valor": 17500 },
    { "categoria": "Software", "valor": 9700 },
    { "categoria": "Outros", "valor": 42950 }
  ]
}
\`\`\`

### Insights e Recomendações
- **Estabilidade**: Gastos mensais oscilam entre R$ 30k-38k (variação de ~26%)
- **Fixos Dominantes**: 71% dos gastos são de categorias fixas (Folha + Aluguel + Utilidades)
- **Oportunidade**: Consultoria Externa teve pico em Fev (R$ 7.500) - avaliar ROI
- **Atenção**: Marketing Digital cresceu 133% de Jan para Fev - monitorar efetividade
`;

// ========================================
// 7. TESTES ÚTEIS
// ========================================

// Teste 1: Filtro por categoria
const testFilter1 = {
    selectedTables: {
        'MOCK_FINANCEIRO': ['Data', 'Valor', 'Categoria de Gasto']
    },
    filters: {
        'MOCK_FINANCEIRO': [
            {
                id: Date.now(),
                column: 'Categoria de Gasto',
                operator: '=',
                value: 'Folha de Pagamento'
            }
        ]
    }
};
// Resultado esperado: 5 registros (um por mês)

// Teste 2: Filtro por valor mínimo
const testFilter2 = {
    selectedTables: {
        'MOCK_FINANCEIRO': ['Data', 'Valor', 'Categoria de Gasto']
    },
    filters: {
        'MOCK_FINANCEIRO': [
            {
                id: Date.now(),
                column: 'Valor',
                operator: '>',
                value: '10000'
            }
        ]
    }
};
// Resultado esperado: Apenas registros de Folha de Pagamento

// Teste 3: Filtro por período
const testFilter3 = {
    selectedTables: {
        'MOCK_FINANCEIRO': ['Data', 'Valor', 'Categoria de Gasto']
    },
    filters: {
        'MOCK_FINANCEIRO': [
            {
                id: Date.now(),
                column: 'Data',
                operator: '>=',
                value: '2026-02-01'
            },
            {
                id: Date.now() + 1,
                column: 'Data',
                operator: '<=',
                value: '2026-02-28'
            }
        ]
    }
};
// Resultado esperado: 10 registros de fevereiro

// ========================================
// 8. DEBUGGING
// ========================================

// Para verificar dados disponíveis:
const { getCategories, getFinancialStats } = require('../data/mockFinancialData');

console.log('Categorias disponíveis:', getCategories());
console.log('Estatísticas:', getFinancialStats());

/* Output esperado:
Categorias disponíveis: [
  'Aluguel',
  'Consultoria Externa',
  'Energia Elétrica',
  'Equipamentos e Hardware',
  'Hospedagem e Viagens',
  'Marketing Digital',
  'Material de Escritório',
  'Manutenção Equipamentos',
  'Serviços Contábeis',
  'Software e Licenças',
  'Telecomunicações',
  'Treinamento e Capacitação'
]

Estatísticas: {
  total: 182650,
  media: 3382.41,
  maximo: 16500,
  minimo: 450,
  totalRegistros: 54,
  totalPorCategoria: { ... }
}
*/

module.exports = {
    examplePrompts,
    exampleAIResponse,
    testFilter1,
    testFilter2,
    testFilter3
};
