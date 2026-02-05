// Mapeamento "Amigável" do Banco de Dados para a IA e para o Usuário
// Mapeamento "Amigável" do Banco de Dados para a IA e para o Usuário
const SEMANTIC_LAYER = {
    // ==========================================================================================
    // OMIE DATABASE (omie_db)
    // ==========================================================================================
    OMIE_A_PAGAR: {
        friendlyName: "Contas a Pagar",
        tableName: "omie_db.a_pagar",
        description: "Contas a pagar importadas do Omie",
        columns: {
            id: { label: "ID", type: "number" },
            "Data de Vencimento (completa)": { label: "Data Vencimento", type: "date" },
            "Data de Emissão (completa)": { label: "Data Emissão", type: "date" },
            "Última Data de Pagto ou Recbto (completa)": { label: "Data Pagamento", type: "date" },
            Tipo: { label: "Tipo", type: "string" },
            "Cliente ou Fornecedor (Nome Fantasia)": { label: "Fornecedor", type: "string" },
            Categoria: { label: "Categoria", type: "string" },
            Departamento: { label: "Departamento", type: "string" },
            Projeto: { label: "Projeto", type: "string" },
            "Valor da Conta": { label: "Valor", type: "money" },
            "Valor Líquido": { label: "Valor Líquido", type: "money" },
            "Pago ou Recebido": { label: "Valor Pago", type: "money" },
            "Situação": { label: "Situação", type: "string" }
        }
    },
    OMIE_NF_FATURADAS: {
        friendlyName: "Notas Fiscais Faturadas",
        tableName: "omie_db.nf_faturadas",
        description: "Notas fiscais emitidas e faturadas no Omie",
        columns: {
            id: { label: "ID", type: "number" },
            "Data de Emissão (completa)": { label: "Data Emissão", type: "date" },
            "Situação": { label: "Situação", type: "string" },
            "Cliente ou Fornecedor (Nome Fantasia)": { label: "Cliente", type: "string" },
            Projeto: { label: "Projeto", type: "string" },
            "Valor da Conta": { label: "Valor Total", type: "money" },
            "Valor Líquido": { label: "Valor Líquido", type: "money" },
            "Impostos Retidos": { label: "Impostos", type: "money" }
        }
    },
    OMIE_NOTAS_DEBITO: {
        friendlyName: "Notas de Débito",
        tableName: "omie_db.notas_debito",
        description: "Notas de débito registradas",
        columns: {
            id: { label: "ID", type: "number" },
            "Data de Emissão (completa)": { label: "Data Emissão", type: "date" },
            "Situação": { label: "Situação", type: "string" },
            "Cliente ou Fornecedor (Nome Fantasia)": { label: "Cliente/Fornecedor", type: "string" },
            "Valor da Conta": { label: "Valor", type: "money" }
        }
    },

    // ==========================================================================================
    // PSOFFICE DATABASE (psoffice)
    // ==========================================================================================
    PSO_PROJETOS: {
        friendlyName: "Projetos",
        tableName: "psoffice.projetos",
        description: "Cadastro principal de projetos",
        columns: {
            PROJ_ID: { label: "ID Projeto", type: "number" },
            CODIGO: { label: "Código", type: "string" },
            NOME: { label: "Nome do Projeto", type: "string" },
            DESCRICAO: { label: "Descrição", type: "string" },
            ATIVO: { label: "Ativo", type: "string" },
            TIPO_DE_PROJETO: { label: "Tipo", type: "string" },
            DT_INICIO: { label: "Data Início", type: "date" },
            DT_FIM: { label: "Data Fim", type: "date" },
            VALOR: { label: "Valor Contrato", type: "money" },
            TRABALHO_PREVISTO: { label: "Horas Previstas", type: "number" },
            TRABALHO_REALIZADO: { label: "Horas Realizadas", type: "number" },
            PERCENTUAL_CONCLUIDO: { label: "% Concluído", type: "number", sqlExpr: "(TRABALHO_REALIZADO / NULLIF(TRABALHO_PREVISTO, 0)) * 100" } // Computed column example
        }
    },
    PSO_ATIVIDADES: {
        friendlyName: "Atividades",
        tableName: "psoffice.atividades",
        description: "Tarefas e atividades dos projetos",
        columns: {
            ATIV_ID: { label: "ID Atividade", type: "number" },
            PROJ_ID: { label: "ID Projeto", type: "number" },
            NOME: { label: "Nome Atividade", type: "string" },
            SITUACAO: { label: "Situação", type: "string", columnInfo: "ESTADO" }, // Mapping ESTADO to Situacao
            DT_INICIO: { label: "Início", type: "date" },
            DT_FIM: { label: "Fim", type: "date" },
            TRABALHO_PREVISTO: { label: "Horas Previstas", type: "number" },
            TRABALHO_REALIZADO: { label: "Horas Realizadas", type: "number" }
        }
    },
    PSO_APONTAMENTOS: {
        friendlyName: "Apontamentos de Horas",
        tableName: "psoffice.apontamentos",
        description: "Registro de horas trabalhadas pelos colaboradores",
        columns: {
            APON_ID: { label: "ID", type: "number" },
            USU_ID: { label: "ID Usuário", type: "number" },
            PROJ_ID: { label: "ID Projeto", type: "number" },
            ATIV_ID: { label: "ID Atividade", type: "number" },
            DT_INICIO: { label: "Data", type: "date" },
            MINUTOS: { label: "Minutos", type: "number" },
            COMENTARIOS: { label: "Comentários", type: "string" }
        }
    },
    PSO_EMPRESAS: {
        friendlyName: "Empresas/Clientes",
        tableName: "psoffice.empresas",
        description: "Cadastro de clientes e empresas",
        columns: {
            PJ_ID: { label: "ID", type: "number" },
            NOME: { label: "Nome Fantasia", type: "string" },
            RAZAO_SOCIAL: { label: "Razão Social", type: "string" },
            CNPJ: { label: "CNPJ", type: "string" },
            IND_CLIENTE: { label: "É Cliente?", type: "string" },
            IND_FORNECEDOR: { label: "É Fornecedor?", type: "string" }
        }
    },
    PSO_FATURAMENTO: {
        friendlyName: "Faturamento",
        tableName: "psoffice.faturamento",
        description: "Registros de faturamento e notas fiscais",
        columns: {
            MF_ID: { label: "ID", type: "number" },
            PROJ_ID: { label: "ID Projeto", type: "number" },
            VALOR: { label: "Valor", type: "money" },
            DATA_EMISSAO: { label: "Data Emissão", type: "date" },
            DATA_VENCIMENTO: { label: "Vencimento", type: "date" },
            DT_PAGAMENTO: { label: "Pagamento", type: "date" },
            SITUACAO: { label: "Situação", type: "string" },
            NOTA_FISCAL: { label: "Nota Fiscal", type: "string" }
        }
    },
    PSO_COLABORADORES: {
        friendlyName: "Colaboradores",
        tableName: "psoffice.info_colabs",
        description: "Informações dos colaboradores",
        columns: {
            USU_ID: { label: "ID", type: "number" },
            NOME: { label: "Nome", type: "string" },
            EMAIL: { label: "Email", type: "string" },
            ATIVO: { label: "Ativo", type: "boolean" },
            CARGO: { label: "Cargo", type: "string", columnInfo: "DESCRICAO" }
        }
    },
    PSO_CENTROS_RESULTADO: {
        friendlyName: "Centros de Resultado",
        tableName: "psoffice.centros_de_resultado",
        description: "Centros de custo/resultado",
        columns: {
            CR_ID: { label: "ID", type: "number" },
            NOME: { label: "Nome CR", type: "string" }
        }
    },
    PSO_DESPESAS: {
        friendlyName: "Despesas",
        tableName: "psoffice.despesas",
        description: "Despesas lançadas nos projetos",
        columns: {
            DESP_ID: { label: "ID", type: "number" },
            PROJ_ID: { label: "ID Projeto", type: "number" },
            VALOR: { label: "Valor", type: "money" },
            DATA: { label: "Data", type: "date", columnInfo: "DT_DATA" },
            DESCRICAO: { label: "Descrição", type: "string" },
            REEMBOLSAVEL: { label: "Reembolsável", type: "string" }
        }
    },
    PSO_ATRIBUICOES: {
        friendlyName: "Atribuições",
        tableName: "psoffice.atribuicoes",
        description: "Alocação de recursos em atividades",
        columns: {
            ATRIB_ID: { label: "ID", type: "number" },
            ATIV_ID: { label: "ID Atividade", type: "number" },
            USU_ID: { label: "ID Usuário", type: "number" },
            TRABALHO_PREVISTO: { label: "Horas Previstas", type: "number" }
        }
    },
    RECURSOS: {
        friendlyName: "Recursos do Projeto",
        tableName: "psoffice.recursos",
        columns: {
            PROJREC_ID: { label: "ID", type: "number" },
            PROJ_ID: { label: "Projeto ID", type: "number" },
            NOME: { label: "Nome Recurso", type: "string" }
        }
    },
    PSO_AGRUPAMENTO: {
        friendlyName: "Agrupamento",
        tableName: "psoffice.agrupamento",
        columns: { FUNC_ID: { label: "ID", type: "number" }, NOME: { label: "Nome", type: "string" } }
    },
    PSO_USU_FUNCOES: {
        friendlyName: "Função Usuário",
        tableName: "psoffice.pso_usu_funcoes",
        columns: {
            USU_ID: { label: "ID Usuário", type: "number" },
            FUNC_ID: { label: "ID Função/Agrupamento", type: "number" },
            PERC_APROP: { label: "% Apropriação", type: "number" }
        }
    },
    PSO_CALENDARIOS: {
        friendlyName: "Calendários",
        tableName: "psoffice.calendarios",
        columns: { CAL_ID: { label: "ID", type: "number" }, NOME: { label: "Nome", type: "string" } }
    },
    PSO_DESPESA_ORCADA: {
        friendlyName: "Despesa Orçada",
        tableName: "psoffice.despesa_orcada",
        columns: { DESPT_ID: { label: "ID Despesa Tipo", type: "number" }, VALOR_PREVISTO: { label: "Valor Previsto", type: "money" } }
    },
    PSO_DESPESA_TIPO: {
        friendlyName: "Tipo de Despesa",
        tableName: "psoffice.despesa_tipo",
        columns: { DESPT_ID: { label: "ID", type: "number" }, NOME: { label: "Nome", type: "string" } }
    },
    PSO_TAXA: {
        friendlyName: "Taxa",
        tableName: "psoffice.pso_taxa",
        columns: { TAXA_ID: { label: "ID", type: "number" } }
    },
    PSO_TAXA_HISTORICO: {
        friendlyName: "Histórico de Taxas",
        tableName: "psoffice.taxa_historico",
        columns: { TAXAH_ID: { label: "ID", type: "number" }, VALOR: { label: "Valor", type: "money" }, DT_EFETIVA: { label: "Data Efetiva", type: "date" } }
    },
    PSO_RESUMO_HORAS: {
        friendlyName: "Resumo de Horas",
        tableName: "psoffice.resumo_de_horas",
        columns: { RESHR_ID: { label: "ID", type: "number" }, USU_ID: { label: "ID Usuário", type: "number" }, DT_INICIO: { label: "Data Início", type: "date" } }
    }
};

const getAvailableSchemas = () => {
    return SEMANTIC_LAYER;
};

module.exports = {
    SEMANTIC_LAYER,
    getAvailableSchemas
};
