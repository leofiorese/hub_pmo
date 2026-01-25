# 📘 PMO Hub & PSOffice Web - Documentação Técnica Unificada

> **Status:** Planejamento & Arquitetura  
> **Versão:** 1.0.0  
> **Data:** 20/12/2025  
> **Responsável Técnico:** Engenharia de Software (PMO)

---

## 1. Visão Geral do Projeto

### 1.1 Do "Bot" ao "Hub"
Originalmente concebido como um **Bot de Automação (RPA)** em Python/Tkinter para extração de relatórios do sistema PSO, o projeto evoluiu para uma **Plataforma Web (Hub)** centralizada.

**Objetivo:** Criar um portal único ("Single Source of Truth") para o setor de PMO da **SANDECH Engenharia**, integrando:
1.  **Automação:** Execução de scripts de extração/tratamento de dados na nuvem/servidor.
2.  **Gestão:** Ferramentas de gerenciamento de projetos e usuários.
3.  **Analytics:** Visualização centralizada de Dashboards (Power BI e Excel Online).
4.  **Segurança:** Controle de acesso (RBAC) e auditoria de ações.

---

## 2. Arquitetura de Software

O sistema migrou de uma arquitetura Desktop Monolítica para uma arquitetura **Web Client-Server Stateless**, baseada nos princípios da **Clean Architecture** e **MVC**.

### 2.1 Stack Tecnológica

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend** | **React.js** (Vite) | Single Page Application (SPA). Javascript ES6+. |
| **UI Library** | **Material UI (MUI)** | Componentes visuais seguindo identidade corporativa. |
| **Backend** | **Node.js** + **Express** | API RESTful com arquitetura em camadas. |
| **Database** | **MySQL 8.x** | Banco Relacional (InnoDB) com driver `mysql2`. |
| **Auth** | **JWT** + **Bcrypt** | Autenticação Stateless e Hash de senhas. |
| **RPA Engine** | **Playwright** | Automação de navegador headless no servidor. |
| **AI Core** | **Ollama** (qwen2.5:14b) | LLM Local para análise inteligente de dados. |

### 2.2 Padrões de Projeto (Design Patterns)
* **Frontend:** Hooks Pattern, Context API (Estado Global).
* **Backend:** MSC (Model-Service-Controller), Repository Pattern, Singleton (Database Connection).
* **Geral:** Clean Architecture (Regras de negócio isoladas de frameworks).

---

## 3. Design System & Identidade Visual

A interface deve refletir estritamente a marca da **SANDECH Engenharia**.

### 3.1 Tokens de Estilo
* **Cores Primárias:**
    * Light Mode: `#91121F` (Vermelho Sandech / Bordô).
    * Dark Mode: `#EF5350` (Vermelho Suave - Acessibilidade).
* **Backgrounds:**
    * Light: `#F4F6F8` (Cinza Gelo Corporativo).
    * Dark: `#121212` (Padrão Material Design).
* **Tipografia:** Fonte `Roboto` (Pesos: 300, 400, 500, 700).

### 3.2 Layout Mestre ("The Shell")
* **Sidebar (Menu Lateral):** Persistente. Menus agrupados por contexto (Ferramentas, Power BI, Excel). Uso de *Accordions* para sub-menus.
* **Topbar (Cabeçalho):** Identificação do Usuário, Breadcrumbs e Toggle de Tema (Claro/Escuro).
* **Content:** Renderização dinâmica via React Router.

---

## 4. Infraestrutura de Dados (MySQL)

Modelagem focada em integridade, performance e auditoria.

### 4.1 Script DDL (Inicialização do Banco)

```sql
-- Configuração de Encoding e Criação do Banco
CREATE DATABASE IF NOT EXISTS pso_hub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pso_hub_db;

-- 1. Tabela de Usuários (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'pmo', 'manager', 'viewer') DEFAULT 'viewer',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_active (active)
) ENGINE=InnoDB;

-- 2. Tabela de Projetos (Core Domain)
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status ENUM('planejamento', 'execucao', 'pausado', 'concluido', 'cancelado') DEFAULT 'planejamento',
    manager_id INT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_project_status (status)
) ENGINE=InnoDB;

-- 3. Tabela de Histórico de KPIs (Analytics)
CREATE TABLE IF NOT EXISTS project_kpis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    kpi_name VARCHAR(50) NOT NULL,
    kpi_value DECIMAL(10, 2) NOT NULL,
    measured_at DATE NOT NULL,
    CONSTRAINT fk_kpi_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabela de Auditoria (Logs de Segurança)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL, -- Ex: 'LOGIN', 'DELETE_PROJECT'
    resource VARCHAR(100),
    details JSON, -- Flexibilidade para armazenar payloads
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

## 5. Estrutura de Diretórios (Codebase)

A organização física dos arquivos reflete a separação de responsabilidades definida pela **Clean Architecture** e pelo padrão **MSC (Model-Service-Controller)**.

### 5.1 Backend (`/server/src`)

Esta estrutura garante que a lógica de negócios não se misture com a lógica de infraestrutura (banco de dados ou HTTP).

```text
server/src/
├── config/             # Configurações do projeto (Conexão DB, Variáveis de Ambiente .env)
├── controllers/        # [Interface Adapters] Camada de Entrada:
│                       # - Recebe a requisição HTTP (req, res)
│                       # - Valida os dados de entrada (DTOs)
│                       # - Chama a Service Layer
│                       # - Retorna a resposta JSON padronizada
├── services/           # [Use Cases] Camada de Regras de Negócio:
│                       # - Contém a lógica pura do PMO
│                       # - Não conhece HTTP nem SQL
│                       # - Orquestra as chamadas aos Repositórios
├── repositories/       # [Data Access] Camada de Persistência:
│                       # - Executa queries SQL diretas
│                       # - Gerencia transações com o MySQL
├── models/             # [Entities] Camada de Domínio:
│                       # - Classes e interfaces que definem os dados (User, Project)
├── middlewares/        # Interceptadores de Requisição:
│                       # - AuthGuard (Validação de Token)
│                       # - Logger (Auditoria)
│                       # - ErrorHandler (Tratamento global de erros)
├── routes/             # Definição das Rotas da API (Express Router)
└── utils/              # Funções utilitárias e helpers
```

### 5.2 Fronted (`/client/src`)

Esta estrutura garante que a lógica de negócios não se misture com a lógica de infraestrutura (banco de dados ou HTTP).
```
client/src/
├── components/         # UI Components "Burros" (Reutilizáveis):
│                       # - Botões, Cards, Inputs, Tabelas
│                       # - Recebem dados via props
├── pages/              # Views/Páginas Completas:
│                       # - Login, Dashboard, Detalhe de Projeto
│                       # - Conectam os componentes com os dados
├── hooks/              # Custom Hooks (Controllers de View):
│                       # - Isolam a lógica de estado (useState, useEffect) da UI
├── services/           # Camada de Integração:
│                       # - Instâncias do Axios
│                       # - Funções de chamada aos endpoints da API
├── contexts/           # Estado Global (Context API):
│                       # - AuthProvider (Usuário logado)
│                       # - ThemeProvider (Claro/Escuro)
├── styles/             # Definições de Estilo:
│                       # - Configuração do Tema Material UI
│                       # - CSS Global
└── utils/              # Helpers de Frontend:
                        # - Formatadores de Data, Moeda, Strings
```

# Requisitos e Arquitetura da Aplicação Web – Hub do PMO

---

## 1 FRONTEND – REACT (CLIENT)

### 1.1 REQUISITOS FUNCIONAIS

#### 1.1.1 Autenticação de Usuários

1.1.1.1 A aplicação deve permitir que usuários realizem login por meio de credenciais (usuário e senha).
1.1.1.2 O frontend deve consumir um endpoint de autenticação e armazenar o token de forma segura.
1.1.1.3 Usuários não autenticados não devem acessar rotas protegidas.

#### 1.1.2 Autorização por Perfil

1.1.2.1 A interface deve adaptar funcionalidades e visibilidade conforme o perfil do usuário.
1.1.2.2 Perfis distintos devem possuir permissões diferentes.

#### 1.1.3 Dashboard Central do PMO

1.1.3.1 Deve existir uma tela inicial com visão consolidada dos dados do PMO.
1.1.3.2 O dashboard deve apresentar indicadores, status de projetos e alertas relevantes.

#### 1.1.4 Navegação Estruturada

1.1.4.1 A aplicação deve possuir menu de navegação lateral ou superior.
1.1.4.2 A navegação deve ser baseada em rotas protegidas.

#### 1.1.5 Consumo de API REST

1.1.5.1 O frontend deve consumir APIs REST do backend.
1.1.5.2 Deve tratar corretamente respostas de sucesso, erro e estados de carregamento.

#### 1.1.6 Atualização Dinâmica de Dados

1.1.6.1 Os dados exibidos devem ser atualizados dinamicamente conforme alterações no estado.
1.1.6.2 A aplicação deve evitar reload completo da página.

#### 1.1.7 Feedback ao Usuário

1.1.7.1 A interface deve fornecer feedback visual para ações realizadas.
1.1.7.2 Devem existir mensagens claras para sucesso, erro ou alerta.

#### 1.1.8 Gerenciamento de Sessão

1.1.8.1 A aplicação deve manter o estado da sessão enquanto o token for válido.
1.1.8.2 Deve realizar logout automático quando o token expirar.

#### 1.1.9 Customização de Interface

1.1.9.1 O usuário deve poder definir preferências como tema visual.
1.1.9.2 As preferências devem ser persistidas.

#### 1.1.10 Logout Seguro

1.1.10.1 Deve existir funcionalidade de logout acessível ao usuário.
1.1.10.2 O token deve ser removido do contexto da aplicação.

#### 1.1.11 Módulo de Analytics com IA

1.1.11.1 **Wizard de Análise**: Interface passo-a-passo (Welcome -> QueryBuilder -> DataPreview -> PromptBuilder -> Results).
1.1.11.2 **Preview Interativo**: Visualização tabular dos dados com ajuste dinâmico de altura e overlay de carregamento (UX Smooth).
1.1.11.3 **Filtros Dinâmicos**: Possibilidade de criar filtros complexos para refinar o dataset antes da análise.
1.1.11.4 **Resultados em Markdown**: Renderização rica da resposta da IA.
1.1.11.5 **Persistência de Estado**: Uso de `AnalyticsContext` para manter seleções e filtros ao navegar entre etapas.

---

### 1.2 REQUISITOS NÃO FUNCIONAIS

#### 1.2.1 Performance

1.2.1.1 O tempo de carregamento inicial deve ser inferior a 2 segundos.
1.2.1.2 Deve utilizar técnicas como lazy loading e code splitting.

#### 1.2.2 Usabilidade

1.2.2.1 A interface deve seguir padrões modernos de UX/UI.
1.2.2.2 A navegação deve ser intuitiva e consistente.

#### 1.2.3 Manutenibilidade

1.2.3.1 O código deve ser componentizado e reutilizável.
1.2.3.2 Deve seguir um padrão arquitetural bem definido.

#### 1.2.4 Compatibilidade

1.2.4.1 Deve funcionar corretamente nos principais navegadores modernos.
1.2.4.2 Deve manter comportamento consistente entre plataformas.

#### 1.2.5 Segurança

1.2.5.1 Nenhuma lógica sensível deve ser executada no frontend.
1.2.5.2 Deve proteger a aplicação contra XSS e manipulação de estado.

---

## 2 BACKEND – NODE.JS (SERVER)

### 2.1 REQUISITOS FUNCIONAIS

#### 2.1.1 API RESTful

2.1.1.1 O backend deve expor endpoints REST padronizados.
2.1.1.2 Deve utilizar corretamente os métodos HTTP.

#### 2.1.2 Autenticação

2.1.2.1 Deve validar credenciais de usuários.
2.1.2.2 Deve gerar tokens JWT para autenticação.

#### 2.1.3 Autorização

2.1.3.1 Deve restringir acesso a endpoints com base em perfis.
2.1.3.2 Deve utilizar middleware para controle de acesso.

#### 2.1.4 Gestão de Usuários

2.1.4.1 Deve permitir criação, edição, listagem e exclusão de usuários.
2.1.4.2 Deve permitir ativar e desativar usuários.

#### 2.1.5 Gestão de Projetos

2.1.5.1 Deve fornecer endpoints para gerenciamento de projetos do PMO.
2.1.5.2 Deve armazenar status, responsáveis e prazos.

#### 2.1.6 Validação de Dados

2.1.6.1 Deve validar dados de entrada antes de processar requisições.
2.1.6.2 Deve rejeitar payloads inválidos.

#### 2.1.7 Logs de Auditoria

2.1.7.1 Deve registrar ações críticas realizadas no sistema.
2.1.7.2 Os logs devem conter usuário, ação e data/hora.

#### 2.1.8 Tratamento de Erros

2.1.8.1 Deve retornar mensagens de erro padronizadas.
2.1.8.2 Deve utilizar códigos HTTP adequados.

#### 2.1.9 Integração com Banco de Dados

2.1.9.1 Deve realizar operações CRUD no banco de dados.
2.1.9.2 Deve garantir consistência por meio de transações.

#### 2.1.10 Escalabilidade

2.1.10.1 O backend deve ser stateless.
2.1.10.2 Deve permitir execução em múltiplas instâncias.

#### 2.1.11 Motor de Análise (AI Engine)

2.1.11.1 **Semantic Layer**: Camada de configuração que mapeia colunas do banco para nomes amigáveis e define whitelists de segurança.
2.1.11.2 **SQL Dinâmico Seguro**: Construção de queries baseada em filtros validados, prevenindo injeção de SQL.
2.1.11.3 **Integração Ollama**: Comunicação via HTTP com instância local do Ollama para processamento de prompts.
2.1.11.4 **Sanitização de Contexto**: Limitação automática de linhas (Top 50) e formatação otimizada para reduzir uso de tokens.

---

### 2.2 REQUISITOS NÃO FUNCIONAIS

#### 2.2.1 Segurança

2.2.1.1 As senhas devem ser armazenadas criptografadas.
2.2.1.2 Deve haver proteção contra SQL Injection e ataques comuns.

#### 2.2.2 Performance

2.2.2.1 As respostas da API devem ocorrer em tempo aceitável.
2.2.2.2 Deve suportar múltiplas requisições simultâneas.

#### 2.2.3 Disponibilidade

2.2.3.1 O serviço deve permanecer operacional continuamente.
2.2.3.2 Deve possuir endpoint de health check.

#### 2.2.4 Manutenibilidade

2.2.4.1 O código deve seguir arquitetura em camadas.
2.2.4.2 Deve ser facilmente testável e extensível.

#### 2.2.5 Observabilidade

2.2.5.1 Deve gerar logs estruturados.
2.2.5.2 Deve permitir integração com ferramentas de monitoramento.

---

## 3 INFRAESTRUTURA – MYSQL (BANCO DE DADOS)

### 3.1 REQUISITOS FUNCIONAIS

#### 3.1.1 Persistência de Usuários

3.1.1.1 Deve armazenar dados de usuários, perfis e status.

#### 3.1.2 Persistência de Projetos

3.1.2.1 Deve armazenar informações de projetos do PMO.
3.1.2.2 Deve permitir relacionamento entre projetos e usuários.

#### 3.1.3 Indicadores e Métricas

3.1.3.1 Deve armazenar KPIs e histórico de indicadores.

#### 3.1.4 Controle de Permissões

3.1.4.1 Deve manter dados de perfis e permissões.

#### 3.1.5 Relacionamentos

3.1.5.1 Deve utilizar chaves primárias e estrangeiras.
3.1.5.2 Deve garantir integridade referencial.

#### 3.1.6 Histórico e Auditoria

3.1.6.1 Deve armazenar logs de ações relevantes.

#### 3.1.7 Consultas Otimizadas

3.1.7.1 Deve permitir consultas eficientes aos dados.

#### 3.1.8 Índices

3.1.8.1 Deve possuir índices nos campos mais consultados.

#### 3.1.9 Versionamento de Schema

3.1.9.1 Deve permitir controle de versões da estrutura do banco.

#### 3.1.10 Backup

3.1.10.1 Deve permitir execução de backups periódicos.

---

### 3.2 REQUISITOS NÃO FUNCIONAIS

#### 3.2.1 Integridade dos Dados

3.2.1.1 Deve garantir consistência por meio de constraints e transações.

#### 3.2.2 Performance

3.2.2.1 Deve responder rapidamente às consultas.
3.2.2.2 Deve suportar crescimento do volume de dados.

#### 3.2.3 Escalabilidade

3.2.3.1 Deve permitir expansão futura da base de dados.

#### 3.2.4 Segurança

3.2.4.1 Deve restringir acessos por usuário e permissões.
3.2.4.2 Deve proteger dados sensíveis.

#### 3.2.5 Confiabilidade

3.2.5.1 Deve possuir mecanismos de recuperação de falhas.
3.2.5.2 Deve garantir alta disponibilidade dos dados.

---

## 4 ARQUITETURA – MVC COM SERVICE LAYER E CLEAN ARCHITECTURE

### 4.1 Visão Geral

4.1.1 A aplicação deve adotar Clean Architecture combinada com MVC e Service Layer.
4.1.2 As dependências devem apontar das camadas externas para as internas.

### 4.2 Camadas Arquiteturais

#### 4.2.1 Presentation Layer

4.2.1.1 Responsável pela interação com usuários e clientes.

#### 4.2.2 Controller Layer

4.2.2.1 Orquestra requisições e delega regras à Service Layer.

#### 4.2.3 Service Layer

4.2.3.1 Implementa casos de uso e regras de aplicação.

#### 4.2.4 Domain Layer

4.2.4.1 Contém entidades e regras de negócio puras.

#### 4.2.5 Repository Layer

4.2.5.1 Isola o acesso ao banco de dados.

#### 4.2.6 Infrastructure Layer

4.2.6.1 Contém detalhes técnicos e frameworks.
