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
npm run dev             # Start dev server (Vite)
npm run build           # Build for production (creates dist/)
npm run lint            # Run ESLint
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
├── components/      # Reusable UI (Layout/, UI/)
├── contexts/        # Global state (AuthContext, ThemeContext, AnalyticsContext)
├── hooks/           # Custom hooks (useAuth, useTheme)
├── services/        # API client (axios with auto-auth interceptor)
└── styles/          # Material-UI theme configuration
```

**State Management:** Context API only (AuthContext, ThemeContext, AnalyticsContext)

**Routing:** React Router 7 with `PrivateRoute` wrapper
- Public: `/login`, `/register`, `/reset-password`
- Protected: `/`, `/pbi/:key`, `/admin/*`, `/profile`, `/analytics`

### Multiple Database Architecture

The system connects to three MySQL databases:

1. **pso_hub_db** - Application data (users, app_links, audit_logs)
2. **omie_db** - Financial data from Omie ERP (a_pagar, nf_faturadas, notas_debito)
3. **psoffice** - Project management data (projetos, atividades, apontamentos, faturamento)

The **Semantic Layer** (`config/semanticLayer.js`) maps raw database columns to user-friendly names for AI analysis.

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

Roles: `admin` (full), `pmo` (links/reports), `manager` (planned), `viewer` (read-only default)

### AI Analytics Module
Multi-step wizard flow: Welcome → QueryBuilder → DataPreview → PromptBuilder → Results
- Uses `AnalyticsContext` for state persistence between steps
- Queries filtered data from semantic layer tables
- Sends context + prompt to Ollama for analysis
- Renders Markdown response with tables and charts (Recharts)

## Database Schema

**users:** `id`, `name`, `email` (UNIQUE, @sandech.com.br only), `password_hash`, `role`, `approved`, `reset_token`, `reset_expires`, `active`, `created_at`

**app_links:** `link_key` (PK: `{category}_{timestamp}`), `title`, `url`, `allowed_roles` (JSON array)

## Environment Configuration

**Backend (.env in server/):**
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=pso_hub_db
JWT_SECRET=your_secret_key_here
PORT=3000
OLLAMA_HOST=http://localhost:11434  # For AI analytics
```

**Frontend (.env in client/):**
```
VITE_API_URL=http://localhost:3000/api
VITE_BASE_PATH=/pmohub  # For Docker deployment
```

## Common Patterns

### Adding a New Protected Route

**Backend:**
```javascript
// 1. Controller (controllers/featureController.js)
async newFeature(req, res) {
    const userId = req.userId;
    const result = await someService.doSomething(userId);
    res.json(result);
}

// 2. Route (routes/featureRoutes.js)
router.get('/new-feature', authMiddleware, checkRole(['admin', 'pmo']), controller.newFeature);

// 3. Mount in app.js
app.use('/api/feature', featureRoutes);
```

**Frontend:**
```javascript
// 1. Page (pages/NewFeature.jsx)
export default function NewFeature() {
    const [data, setData] = useState(null);
    useEffect(() => {
        api.get('/feature/new-feature').then(res => setData(res.data));
    }, []);
    return <div>{/* UI */}</div>;
}

// 2. Route in App.jsx
<Route path="/new-feature" element={<NewFeature />} />
```

### Repository Pattern
```javascript
class SomeRepository {
    async findById(id) {
        const [rows] = await db.execute('SELECT * FROM table WHERE id = ?', [id]);
        return rows[0];
    }
}
module.exports = new SomeRepository();
```

## Brand Guidelines (SANDECH)

- **Primary:** `#91121F` (light), `#E53E3E` (dark)
- **Background:** `#F4F6F8` (light), `#121212` (dark)
- **Typography:** Outfit, Inter, Roboto
- **Border radius:** 16px (cards), 50px (buttons), 24px (dialogs)
- **Sidebar:** 260px expanded, 70px collapsed

## Important Constraints

1. **Email Domain:** Only `@sandech.com.br` emails allowed
2. **User Approval:** Two-step registration (register → admin approve → login)
3. **Stateless Auth:** JWT-only, no server sessions
4. **No Automated Migrations:** Schema changes require manual SQL
5. **No Test Suite:** Package.json test scripts return error code 1

## File Locations Reference

- **Server Entry:** `server/src/app.js`
- **DB Config:** `server/src/config/db.js`
- **Semantic Layer:** `server/src/config/semanticLayer.js`
- **Auth Middleware:** `server/src/middlewares/authMiddleware.js`
- **Frontend Entry:** `client/src/main.jsx`
- **App Shell:** `client/src/App.jsx`
- **Theme Config:** `client/src/styles/theme.js`
- **API Client:** `client/src/services/api.js`
- **PM2 Config:** `server/ecosystem.config.js`
- **Docker Config:** `docker-compose.yml`

## Git Commit Conventions

- `feat:` new features
- `fix:` bug fixes
- `ui/ux:` interface changes
- `chore:` infrastructure/config
