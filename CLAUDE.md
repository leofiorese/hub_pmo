# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hub PMO** is a web-based PMO management platform for SANDECH Engenharia that consolidates project management tools, Power BI dashboards, AI-powered analytics, and automated workflows.

**Tech Stack:**
- **Frontend:** React 19 + Vite + Material-UI 7 + Recharts
- **Backend:** Node.js + Express 5
- **Databases:** MySQL 8.x (multiple: pso_hub_db, omie_db, psoffice)
- **Auth:** JWT + bcryptjs
- **AI:** Ollama (qwen2.5:14b) for intelligent data analysis
- **Deployment:** Docker Compose or PM2 + Nginx

## Development Commands

### Frontend (client/)
```bash
cd client
npm install              # Install dependencies
npm run dev             # Start dev server (Vite on port 5173)
npm run build           # Build for production (creates dist/)
npm run lint            # Run ESLint
npm run preview         # Preview production build locally
```

### Backend (server/)
```bash
cd server
npm install              # Install dependencies
npm run dev             # Start with nodemon (auto-reload)
npm start               # Start production server
```

### Docker Deployment
```bash
docker-compose up -d --build    # Build and start all services
# Backend: http://localhost:7000
# Frontend: http://localhost:7001 (served at /pmohub)
```

### PM2 Deployment (Windows VM)
```bash
pm2 reload backend-pmo-hub      # Zero downtime reload
pm2 logs backend-pmo-hub        # View logs
pm2 status                      # Check process status
```

## Architecture

### Backend Structure (Clean Architecture + MSC Pattern)

```
server/src/
├── config/          # Database pool (db.js), Ollama client (ollama.js), Semantic Layer
├── routes/          # Express Router definitions
├── middlewares/     # authMiddleware (JWT), checkRole (RBAC)
├── controllers/     # HTTP handlers + input validation
├── services/        # Business logic (framework-agnostic)
├── repositories/    # Database access (SQL execution)
├── data/            # Mock data modules (mockFinancialData.js used by MOCK_FINANCEIRO semantic layer table)
└── utils/           # Helper functions
```

**Request Flow:** Route → Middleware (auth + role) → Controller → Service → Repository → Database

**API Endpoints:**
- `/api/auth` - Authentication (login, register, password reset)
- `/api/admin` - User management (approvals, CRUD)
- `/api/links` - Power BI/Excel link management
- `/api/profile` - User profile
- `/api/analytics` - Data queries for AI analysis
- `/api/ollama` - AI chat/analysis endpoints
- `/api/health` - Health check (Docker)

### Frontend Structure (React + Context API)

```
client/src/
├── pages/           # Full page components (Dashboard, Login, Admin, Analytics)
├── components/      # Reusable UI (Layout/, UI/, ChartRenderer.jsx)
├── contexts/        # Global state (AuthContext, ThemeContext, AnalyticsContext)
├── hooks/           # Custom hooks (useAuth, useTheme)
├── services/        # API client (axios with auto-auth interceptor)
└── styles/          # Material-UI theme configuration
```

**State Management:** Context API only (AuthContext, ThemeContext, AnalyticsContext)

**API Client Configuration:**
The `services/api.js` uses axios with interceptors:
- Request interceptor: Automatically adds `Authorization: Bearer <token>` from localStorage
- Base URL: `VITE_API_URL` environment variable
- Error interceptor: Handles 401 responses by clearing auth and redirecting to login

**Routing:** React Router 7 with `PrivateRoute` wrapper
- Public: `/login`, `/register`, `/reset-password`
- Protected: `/` (Dashboard), `/pbi/:key` (Dynamic PowerBI), `/admin/*`, `/profile`, `/analytics/*`, `/ai-analytics`
- Dynamic PBI: `/pbi/:key` → Fetches link config from backend, validates user role, embeds iframe

### Multiple Database Architecture

The system connects to three MySQL databases:

1. **pso_hub_db** - Application data (users, app_links, audit_logs)
2. **omie_db** - Financial data from Omie ERP (a_pagar, nf_faturadas, notas_debito)
3. **psoffice** - Project management data (projetos, atividades, apontamentos, faturamento, empresas, colaboradores)

The **Semantic Layer** (`config/semanticLayer.js`) maps raw database columns to user-friendly names for AI analysis.

**Semantic Layer Structure:**
Each table mapping includes:
- `friendlyName`: User-facing name
- `tableName`: Actual database table (includes database prefix)
- `description`: Purpose of the table
- `columns`: Object mapping with `label` (display name), `type` (data type: number|string|date|money|boolean), optional `sqlExpr` (computed columns), optional `columnInfo` (actual column name if different from key)

**Note:** The `MOCK_FINANCEIRO` table uses in-memory data from `server/src/data/mockFinancialData.js` rather than a real database table. The `columnInfo` field is only partially utilized — `analyticsController.js` uses the column key directly when building SQL, so columns with `columnInfo` remapping may not query correctly.

Example:
```javascript
PSO_PROJETOS: {
    friendlyName: "Projetos",
    tableName: "psoffice.projetos",
    description: "Cadastro principal de projetos",
    columns: {
        PROJ_ID: { label: "ID Projeto", type: "number" },
        NOME: { label: "Nome do Projeto", type: "string" },
        PERCENTUAL_CONCLUIDO: {
            label: "% Concluído",
            type: "number",
            sqlExpr: "(TRABALHO_REALIZADO / NULLIF(TRABALHO_PREVISTO, 0)) * 100"
        }
    }
}
```

## Key Workflows

### Authentication
1. User registers → `approved=FALSE` → Admin approves → User can login
2. JWT token (1-day expiry) stored in localStorage
3. Auth middleware sets `req.userId`, `req.userRole`, `req.user`

### Role-Based Access Control (RBAC)
```javascript
router.put('/admin/users/:id',
    authMiddleware,              // Validate JWT
    checkRole(['admin']),        // Check role
    adminController.updateUser
);
```

Roles: `admin` (full access), `pmo` (links/reports), `manager` (planned), `viewer` (read-only default)

### AI Analytics Module

There are **two separate AI interfaces**:

1. **Full Wizard** (`/analytics/*`): 5-step flow using `POST /api/analytics/ask` → Ollama `/api/chat` endpoint
2. **Simple Chat** (`/ai-analytics`): Direct chat UI (`AiAnalytics.jsx`) using `POST /api/ollama/chat` → Ollama `/api/generate` endpoint

**Full Wizard Flow:** Welcome → QueryBuilder → DataPreview → PromptBuilder → Results

**Flow Details:**
1. **QueryBuilder (`/analytics/builder`):**
   - User selects tables from semantic layer dropdown
   - Applies filters using operators: `>`, `<`, `=`, `LIKE`, `BETWEEN`
   - State stored in `AnalyticsContext`

2. **DataPreview (`/analytics/preview`):**
   - Frontend sends `POST /api/analytics/query` with selected tables and filters
   - Backend executes validated SQL query
   - Returns max 50 rows per table to prevent context overflow
   - Frontend displays interactive table with virtualization

3. **PromptBuilder (`/analytics/prompt`):**
   - User selects Ollama model from `GET /api/ollama/models`
   - User writes natural language analysis prompt
   - System shows data preview for context

4. **Results (`/analytics/results`):**
   - Frontend sends `POST /api/analytics/ask` with data + prompt + model
   - Backend converts data to Markdown tables:
     - Escapes `|` characters to prevent table breaking
     - Handles `null` values as empty strings
     - Truncates long values to 80 chars for readability
   - Injects system prompt with:
     - Data context in tabular format
     - Chart instruction schema (see below)
     - Role instructions: "You are a Data Analyst. Use ONLY the data provided. DO NOT invent data."
   - Sends to Ollama at `POST /api/chat`
   - Frontend renders response using `react-markdown` with `remark-gfm` plugin
   - Custom `ChartRenderer` component intercepts chart blocks

**AI Chart Rendering:**
The AI can generate charts by returning JSON in markdown code blocks with language `json-chart`:
```json-chart
{
    "type": "bar|line|pie|area",
    "data": [{ "name": "Label", "value": 123 }],
    "xKey": "name",
    "yKey": "value",
    "title": "Optional Chart Title"
}
```
The `ChartRenderer.jsx` component intercepts these blocks and renders using Recharts (ResponsiveContainer + Bar/Line/Pie/Area Chart).

## Database Schema

**users:** `id`, `name`, `email` (UNIQUE, @sandech.com.br only), `password_hash`, `role` (ENUM), `approved` (BOOLEAN), `reset_token`, `reset_expires`, `active` (BOOLEAN), `created_at`

**app_links:** `link_key` (PK: `{category}_{timestamp}`), `title`, `url`, `category` (pbi|excel|custom), `allowed_roles` (JSON array)

## Environment Configuration

**Backend (.env in server/):**
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=pso_hub_db
JWT_SECRET=your_secret_key_here
PORT=3000
OLLAMA_URL=http://localhost:11434  # Used in config/ollama.js for AI analytics
```

**Frontend (.env in client/):**
```
VITE_API_URL=http://localhost:3000/api
VITE_BASE_PATH=/pmohub  # For Docker deployment (use / for local dev)
```

## Common Patterns

### Adding a New Protected Route

**Backend:**
```javascript
// 1. Controller (controllers/featureController.js)
async newFeature(req, res) {
    const userId = req.userId;      // Set by authMiddleware
    const userRole = req.userRole;  // Set by authMiddleware
    try {
        const result = await someService.doSomething(userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 2. Route (routes/featureRoutes.js)
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');
const controller = require('../controllers/featureController');

router.get('/new-feature', authMiddleware, checkRole(['admin', 'pmo']), controller.newFeature);

module.exports = router;

// 3. Mount in app.js
const featureRoutes = require('./routes/featureRoutes');
app.use('/api/feature', featureRoutes);
```

**Frontend:**
```javascript
// 1. Page (pages/NewFeature.jsx)
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function NewFeature() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/feature/new-feature')
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;
    return <div>{/* UI */}</div>;
}

// 2. Add Route in App.jsx (inside PrivateRoute wrapper)
<Route path="/new-feature" element={<NewFeature />} />
```

### Repository Pattern
```javascript
const db = require('../config/db');

class SomeRepository {
    async findById(id) {
        const [rows] = await db.execute('SELECT * FROM table WHERE id = ?', [id]);
        return rows[0];
    }

    async findAll() {
        const [rows] = await db.execute('SELECT * FROM table');
        return rows;
    }

    async create(data) {
        const [result] = await db.execute(
            'INSERT INTO table (col1, col2) VALUES (?, ?)',
            [data.col1, data.col2]
        );
        return result.insertId;
    }
}

module.exports = new SomeRepository();
```

### Adding a New Semantic Layer Table
```javascript
// In server/src/config/semanticLayer.js
const SEMANTIC_LAYER = {
    // ... existing tables
    NEW_TABLE: {
        friendlyName: "User-Friendly Name",
        tableName: "database_name.actual_table_name",
        description: "What this table contains",
        columns: {
            COLUMN_NAME: { label: "Display Label", type: "string|number|date|money|boolean" },
            COMPUTED_COL: {
                label: "Computed Column",
                type: "number",
                sqlExpr: "(col1 / NULLIF(col2, 0)) * 100"  // Optional computed column
            }
        }
    }
};
```

## Brand Guidelines (SANDECH)

- **Primary Colors:** `#91121F` (light mode), `#E53E3E` (dark mode)
- **Background:** `#F4F6F8` (light), `#121212` (dark)
- **Typography:** Outfit (headings), Inter (body), Roboto (fallback)
- **Border Radius:** 16px (cards), 50px (buttons), 24px (dialogs)
- **Sidebar:** 260px expanded, 70px collapsed
- **Spacing:** Material-UI default spacing scale (8px base unit)

## Important Constraints

1. **Email Domain:** Only `@sandech.com.br` emails allowed for registration
2. **User Approval:** Two-step registration (register → admin approve → login enabled)
3. **Stateless Auth:** JWT-only, no server sessions
4. **No Automated Migrations:** Schema changes require manual SQL execution
5. **No Test Suite:** Package.json test scripts return error code 1 (not configured)
6. **Documentation Location:** Main docs in `/docs` directory; `.gitignore` excludes `*.md`, `*.sql`, `*.txt`, `*.sh` from root
7. **Multi-Database Connections:** Single connection pool in `config/db.js` - queries must specify full table names with database prefix (e.g., `psoffice.projetos`)
8. **Analytics Routes Unprotected:** `analyticsRoutes.js` and `ollamaRoutes.js` currently have no auth middleware (intentionally public during development). Must be secured before production.
9. **Password Reset Hardcoded:** Reset link in `authService.js` points to `http://localhost:5173/reset-password` — does not adapt to production URL
10. **No CI/CD:** No GitHub Actions, Jenkinsfile, or any automated pipeline. Deployment is fully manual.

## File Locations Reference

### Backend Key Files
- **Server Entry:** `server/src/app.js`
- **DB Config:** `server/src/config/db.js`
- **Semantic Layer:** `server/src/config/semanticLayer.js`
- **Ollama Client:** `server/src/config/ollama.js`
- **Auth Middleware:** `server/src/middlewares/authMiddleware.js`
- **Role Check:** `server/src/middlewares/checkRole.js`
- **PM2 Config:** `server/ecosystem.config.js`

### Frontend Key Files
- **Frontend Entry:** `client/src/main.jsx`
- **App Shell:** `client/src/App.jsx`
- **Layout:** `client/src/components/Layout/index.jsx`
- **Theme Config:** `client/src/styles/theme.js` (if exists)
- **API Client:** `client/src/services/api.js`
- **Auth Context:** `client/src/contexts/AuthContext.jsx`
- **Analytics Context:** `client/src/contexts/AnalyticsContext.jsx`
- **Chart Renderer:** `client/src/components/ChartRenderer.jsx`

### Infrastructure
- **Docker Config:** `docker-compose.yml`
- **Client Dockerfile:** `client/Dockerfile`
- **Server Dockerfile:** `server/Dockerfile`
- **Nginx Config:** `client/nginx.conf` (serves frontend at `/pmohub/`, port 7001)

### Documentation & DB Schemas
- **Project Docs:** `docs/documentacao_projeto.md`
- **AI Flow Docs:** `docs/fluxo_ia_analytics.md`
- **Omie DB Schema:** `docs/schema_omie_db.sql`
- **PSOffice DB Schema:** `docs/schema_psoffice.sql` (comprehensive, ~39KB)
- **Deploy Scripts:** `docs/scripts/` (nginx, docker, validation scripts)

## Git Commit Conventions

- `feat:` new features
- `fix:` bug fixes
- `ui/ux:` interface changes
- `chore:` infrastructure/config
- `docs:` documentation updates
- `refactor:` code refactoring without feature changes
