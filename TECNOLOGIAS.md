# Documentação Técnica e Stack Tecnológico

Este documento detalha as tecnologias, frameworks, linguagens e arquitetura de software utilizados no projeto **Hub PMO**.

## 1. Visão Geral da Arquitetura

O projeto segue uma arquitetura **Client-Server** desacoplada, comunicando-se via **API RESTful**.

*   **Frontend (SPA)**: Responsável pela interface do usuário e interações.
*   **Backend (API Monolítica)**: Responsável pelas regras de negócios e segurança.
*   **Banco de Dados**: Relacional, para persistência de dados.

O Backend implementa uma **Arquitetura em Camadas (Layered Architecture)** para separação de responsabilidades.

---

## 2. Tecnologias do Frontend (Client)

Localizado na pasta `/client`.

### Linguagens & Core
*   **JavaScript (ES6+)**: Linguagem principal.
*   **React 19**: Biblioteca para construção de interfaces de usuário.
*   **Vite**: Build tool e servidor de desenvolvimento (substituto moderno ao Create React App).

### Bibliotecas & Frameworks
*   **Material UI (MUI) v7**: Biblioteca de componentes de UI (Design System).
*   **Emotion**: Engine de CSS-in-JS (utilizado pelo MUI).
*   **React Router DOM v7**: Gerenciamento de rotas no frontend (SPA).
*   **Axios**: Cliente HTTP para comunicação com a API.
*   **React Markdown**: Renderização de conteúdo Markdown.

### Gerenciamento de Estado
*   **React Context API**: Utilizada para estados globais (ex: Autenticação, Tema).
*   **Custom Hooks**: Encapsulamento de lógica reutilizável.

### Organização de Pastas
*   `/contexts`: Contextos globais (AuthContext, etc).
*   `/hooks`: Hooks customizados.
*   `/pages`: Pistas/Telas da aplicação.
*   `/components`: Componentes reutilizáveis.
*   `/services`: Camada de integração com a API (Axios instances).

---

## 3. Tecnologias do Backend (Server)

Localizado na pasta `/server`.

### Linguagens & Core
*   **Node.js**: Runtime JavaScript server-side.
*   **Express v5**: Framework web minimalista para construção da API.

### Bibliotecas Principais
*   **MySQL2**: Driver nativo de alta performance para MySQL.
*   **Bcrypt.js**: Hashing de senhas para segurança.
*   **JsonWebToken (JWT)**: Autenticação stateless baseada em tokens.
*   **Cors**: Middleware para controle de acesso (Cross-Origin Resource Sharing).
*   **Dotenv**: Gerenciamento de variáveis de ambiente.

### Arquitetura Interna (Layered Pattern)
A aplicação backend segue o padrão de camadas para organizar o código em `/src`:

1.  **Interfaces (Routes/Controllers)**:
    *   `routes/`: Definição dos endpoints da API.
    *   `controllers/`: Lida com requisições HTTP e respostas.
2.  **Business Logic (Services)**:
    *   `services/`: Contém as regras de negócio puras.
3.  **Data Access (Repositories)**:
    *   `repositories/`: Abstração de acesso ao banco de dados (Queries SQL).

### Integrações Adicionais
*   **Ollama (Local LLM)**: Integração planejada para recursos de IA e Analytics.

---

## 4. Banco de Dados

*   **MySQL 8.x**: Sistema Gerenciador de Banco de Dados Relacional (RDBMS).
*   **Engine**: InnoDB (suporte a transações e chaves estrangeiras).
*   **Driver**: Acesso via `mysql2` (SQL direto ou Query Builders leves).

---

## 5. Infraestrutura & DevOps

*   **Docker**: Containerização da aplicação (Frontend, Backend, Database).
*   **Docker Compose**: Orquestração dos containers para ambiente de desenvolvimento e produção.
*   **Nginx**: Servidor Web e Reverse Proxy (planejado para deploy).
*   **PM2**: Gerenciador de processos Node.js (utilizado atualmente em ambientes sem Docker).

## 6. Ferramentas de Desenvolvimento
*   **VS Code**: Editor de código recomendado.
*   **ESLint**: Linter para padronização de código JavaScript/React.
*   **Nodemon**: Auto-reload para desenvolvimento backend.
