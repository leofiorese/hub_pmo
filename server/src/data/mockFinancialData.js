/**
 * Mock de Dados Financeiros para AI Analytics
 *
 * Estrutura compatível com o sistema de análise inteligente
 * Pode ser usado em desenvolvimento/testes quando dados reais não estão disponíveis
 */

const mockFinancialData = [
    // Janeiro 2026
    { "Data": "2026-01-05", "Valor": 15000.00, "Categoria de Gasto": "Folha de Pagamento" },
    { "Data": "2026-01-08", "Valor": 3500.00, "Categoria de Gasto": "Aluguel" },
    { "Data": "2026-01-10", "Valor": 850.00, "Categoria de Gasto": "Energia Elétrica" },
    { "Data": "2026-01-12", "Valor": 1200.00, "Categoria de Gasto": "Material de Escritório" },
    { "Data": "2026-01-15", "Valor": 5000.00, "Categoria de Gasto": "Consultoria Externa" },
    { "Data": "2026-01-18", "Valor": 2300.00, "Categoria de Gasto": "Hospedagem e Viagens" },
    { "Data": "2026-01-20", "Valor": 450.00, "Categoria de Gasto": "Telecomunicações" },
    { "Data": "2026-01-22", "Valor": 1800.00, "Categoria de Gasto": "Software e Licenças" },
    { "Data": "2026-01-25", "Valor": 900.00, "Categoria de Gasto": "Marketing Digital" },
    { "Data": "2026-01-28", "Valor": 650.00, "Categoria de Gasto": "Manutenção Equipamentos" },

    // Fevereiro 2026
    { "Data": "2026-02-05", "Valor": 16200.00, "Categoria de Gasto": "Folha de Pagamento" },
    { "Data": "2026-02-08", "Valor": 3500.00, "Categoria de Gasto": "Aluguel" },
    { "Data": "2026-02-10", "Valor": 920.00, "Categoria de Gasto": "Energia Elétrica" },
    { "Data": "2026-02-12", "Valor": 800.00, "Categoria de Gasto": "Material de Escritório" },
    { "Data": "2026-02-14", "Valor": 7500.00, "Categoria de Gasto": "Consultoria Externa" },
    { "Data": "2026-02-16", "Valor": 3200.00, "Categoria de Gasto": "Treinamento e Capacitação" },
    { "Data": "2026-02-18", "Valor": 1850.00, "Categoria de Gasto": "Hospedagem e Viagens" },
    { "Data": "2026-02-20", "Valor": 480.00, "Categoria de Gasto": "Telecomunicações" },
    { "Data": "2026-02-22", "Valor": 2100.00, "Categoria de Gasto": "Software e Licenças" },
    { "Data": "2026-02-24", "Valor": 1200.00, "Categoria de Gasto": "Marketing Digital" },

    // Março 2026 (Projeções)
    { "Data": "2026-03-05", "Valor": 15800.00, "Categoria de Gasto": "Folha de Pagamento" },
    { "Data": "2026-03-08", "Valor": 3500.00, "Categoria de Gasto": "Aluguel" },
    { "Data": "2026-03-10", "Valor": 880.00, "Categoria de Gasto": "Energia Elétrica" },
    { "Data": "2026-03-12", "Valor": 950.00, "Categoria de Gasto": "Material de Escritório" },
    { "Data": "2026-03-15", "Valor": 6000.00, "Categoria de Gasto": "Consultoria Externa" },
    { "Data": "2026-03-17", "Valor": 2500.00, "Categoria de Gasto": "Hospedagem e Viagens" },
    { "Data": "2026-03-19", "Valor": 500.00, "Categoria de Gasto": "Telecomunicações" },
    { "Data": "2026-03-21", "Valor": 1800.00, "Categoria de Gasto": "Software e Licenças" },
    { "Data": "2026-03-23", "Valor": 1500.00, "Categoria de Gasto": "Marketing Digital" },
    { "Data": "2026-03-25", "Valor": 4200.00, "Categoria de Gasto": "Equipamentos e Hardware" },
    { "Data": "2026-03-27", "Valor": 800.00, "Categoria de Gasto": "Manutenção Equipamentos" },
    { "Data": "2026-03-29", "Valor": 1100.00, "Categoria de Gasto": "Serviços Contábeis" },

    // Abril 2026 (Projeções)
    { "Data": "2026-04-05", "Valor": 16500.00, "Categoria de Gasto": "Folha de Pagamento" },
    { "Data": "2026-04-08", "Valor": 3500.00, "Categoria de Gasto": "Aluguel" },
    { "Data": "2026-04-10", "Valor": 790.00, "Categoria de Gasto": "Energia Elétrica" },
    { "Data": "2026-04-12", "Valor": 1350.00, "Categoria de Gasto": "Material de Escritório" },
    { "Data": "2026-04-15", "Valor": 8000.00, "Categoria de Gasto": "Consultoria Externa" },
    { "Data": "2026-04-17", "Valor": 2800.00, "Categoria de Gasto": "Hospedagem e Viagens" },
    { "Data": "2026-04-19", "Valor": 520.00, "Categoria de Gasto": "Telecomunicações" },
    { "Data": "2026-04-21", "Valor": 2200.00, "Categoria de Gasto": "Software e Licenças" },
    { "Data": "2026-04-23", "Valor": 1800.00, "Categoria de Gasto": "Marketing Digital" },
    { "Data": "2026-04-25", "Valor": 950.00, "Categoria de Gasto": "Manutenção Equipamentos" },

    // Maio 2026 (Projeções)
    { "Data": "2026-05-05", "Valor": 15900.00, "Categoria de Gasto": "Folha de Pagamento" },
    { "Data": "2026-05-08", "Valor": 3500.00, "Categoria de Gasto": "Aluguel" },
    { "Data": "2026-05-10", "Valor": 830.00, "Categoria de Gasto": "Energia Elétrica" },
    { "Data": "2026-05-12", "Valor": 700.00, "Categoria de Gasto": "Material de Escritório" },
    { "Data": "2026-05-14", "Valor": 5500.00, "Categoria de Gasto": "Consultoria Externa" },
    { "Data": "2026-05-16", "Valor": 1900.00, "Categoria de Gasto": "Hospedagem e Viagens" },
    { "Data": "2026-05-18", "Valor": 490.00, "Categoria de Gasto": "Telecomunicações" },
    { "Data": "2026-05-20", "Valor": 1800.00, "Categoria de Gasto": "Software e Licenças" },
    { "Data": "2026-05-22", "Valor": 2200.00, "Categoria de Gasto": "Marketing Digital" },
    { "Data": "2026-05-24", "Valor": 3500.00, "Categoria de Gasto": "Treinamento e Capacitação" },
    { "Data": "2026-05-26", "Valor": 1200.00, "Categoria de Gasto": "Serviços Contábeis" },
];

/**
 * Retorna dados financeiros filtrados por categoria e/ou período
 * @param {Object} filters - Filtros a aplicar
 * @param {string[]} filters.categorias - Categorias para filtrar
 * @param {string} filters.dataInicio - Data inicial (YYYY-MM-DD)
 * @param {string} filters.dataFim - Data final (YYYY-MM-DD)
 * @returns {Array} Dados filtrados
 */
function getFilteredFinancialData(filters = {}) {
    let filtered = [...mockFinancialData];

    if (filters.categorias && filters.categorias.length > 0) {
        filtered = filtered.filter(item =>
            filters.categorias.includes(item["Categoria de Gasto"])
        );
    }

    if (filters.dataInicio) {
        filtered = filtered.filter(item => item.Data >= filters.dataInicio);
    }

    if (filters.dataFim) {
        filtered = filtered.filter(item => item.Data <= filters.dataFim);
    }

    return filtered;
}

/**
 * Retorna lista única de categorias de gasto
 * @returns {string[]} Lista de categorias
 */
function getCategories() {
    return [...new Set(mockFinancialData.map(item => item["Categoria de Gasto"]))].sort();
}

/**
 * Retorna estatísticas agregadas dos dados financeiros
 * @returns {Object} Estatísticas
 */
function getFinancialStats() {
    const total = mockFinancialData.reduce((sum, item) => sum + item.Valor, 0);
    const avg = total / mockFinancialData.length;
    const max = Math.max(...mockFinancialData.map(item => item.Valor));
    const min = Math.min(...mockFinancialData.map(item => item.Valor));

    const porCategoria = {};
    mockFinancialData.forEach(item => {
        const cat = item["Categoria de Gasto"];
        if (!porCategoria[cat]) {
            porCategoria[cat] = 0;
        }
        porCategoria[cat] += item.Valor;
    });

    return {
        total,
        media: avg,
        maximo: max,
        minimo: min,
        totalRegistros: mockFinancialData.length,
        totalPorCategoria: porCategoria
    };
}

module.exports = {
    mockFinancialData,
    getFilteredFinancialData,
    getCategories,
    getFinancialStats
};
