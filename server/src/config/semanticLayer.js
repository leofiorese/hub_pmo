// Mapeamento "Amigável" do Banco de Dados para a IA e para o Usuário
export const SEMANTIC_LAYER = {
    PROJECTS: {
        friendlyName: "Projetos",
        tableName: "projects",
        columns: {
            id: { label: "ID do Projeto", type: "number", description: "Identificador único do projeto" },
            name: { label: "Nome do Projeto", type: "string", description: "Nome comercial do projeto" },
            description: { label: "Descrição", type: "string", description: "Escopo e detalhamento do projeto" },
            status: { label: "Status", type: "string", description: "Status atual (planejamento, execucao, etc)" },
            start_date: { label: "Data de Início", type: "date", description: "Data de início" },
            end_date: { label: "Data de Término", type: "date", description: "Data prevista para término" },
            budget: { label: "Orçamento (R$)", type: "money", description: "Orçamento total aprovado" }
        }
    },
    USERS: {
        friendlyName: "Usuários / Responsáveis",
        tableName: "users",
        columns: {
            name: { label: "Nome do Usuário", type: "string", description: "Nome completo do colaborador" },
            email: { label: "E-mail", type: "string", description: "E-mail corporativo" },
            role: { label: "Cargo/Perfil", type: "string", description: "Função no sistema (admin, pmo, viewer)" }
        }
    },
    // Mock de tabelas financeiras (já que não temos acesso ao OMIE real neste ambiente de teste)
    FINANCIAL: {
        friendlyName: "Financeiro (Mock)",
        tableName: "financial_mock", // Tabela virtual para demo
        columns: {
            date: { label: "Data de Emissão", type: "date" },
            value: { label: "Valor (R$)", type: "money" },
            category: { label: "Categoria", type: "string" },
            description: { label: "Descrição", type: "string" }
        }
    }
};

export const getAvailableSchemas = () => {
    // Retorna apenas os metadados para o frontend montar a árvore de seleção
    const schemas = {};
    Object.keys(SEMANTIC_LAYER).forEach(key => {
        schemas[key] = {
            friendlyName: SEMANTIC_LAYER[key].friendlyName,
            columns: SEMANTIC_LAYER[key].columns
        };
    });
    return schemas;
};
