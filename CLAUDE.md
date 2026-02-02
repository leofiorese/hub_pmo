# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hub PMO** is a web-based PMO management platform for SANDECH Engenharia that consolidates project management tools, Power BI dashboards, and automated workflows. The system evolved from a desktop RPA bot to a full-stack web application with role-based access control.

**Tech Stack:**
- **Frontend:** React 19 + Vite + Material-UI 7
- **Backend:** Node.js + Express 5
- **Database:** MySQL 8.x
- **Auth:** JWT + bcryptjs
- **Deployment:** PM2 + Nginx reverse proxy

## Development Commands

### Frontend (client/)
```bash
cd client
npm install              # Install dependencies
npm run dev             # Start dev server (Vite)
npm run build           # Build for production (creates dist/)
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

### Backend (server/)
```bash
cd server
npm install              # Install dependencies
npm run dev             # Start with nodemon (auto-reload)
npm start               # Start production server
```

### Deployment (Windows VM)
```bash
# Frontend: Build and replace dist folder
cd client && npm run build  # Copy client/dist to VM

# Backend: Reload with PM2 (zero downtime)
pm2 reload backend-pmo-hub
pm2 restart backend-pmo-hub  # Alternative

# Check status
pm2 status
pm2 logs backend-pmo-hub
```

## Architecture

### Backend Structure (Clean Architecture + MSC Pattern)

```
server/src/
├── config/          # Database connection pool (MySQL2/Promise)
├── routes/          # Express Router definitions
├── middlewares/     # authMiddleware (JWT), checkRole (RBAC)
├── controllers/     # HTTP request handlers, input validation
├── services/        # Business logic layer (pure, framework-agnostic)
├── repositories/    # Database access layer (SQL execution)
└── utils/           # Helper functions
```

**Request Flow:**
```
Route → Middleware (auth + role) → Controller → Service → Repository → Database
```

**Key Files:**
- `app.js` - Express app entry point, route mounting
- `config/db.js` - MySQL connection pool (10 connections, promise-based)
- `middlewares/authMiddleware.js` - JWT validation, sets `req.userId`, `req.userRole`, `req.user`
- `middlewares/checkRole.js` - RBAC enforcement: `checkRole(['admin', 'pmo'])`

**Authentication Pattern:**
- JWT tokens signed with `process.env.JWT_SECRET`, 1-day expiration
- Token payload: `{ id, role, name }`
- Bearer token in `Authorization` header
- User approval workflow: new users start with `approved=FALSE`, admin must approve

**Repository Pattern:**
- Each entity has a repository class (UserRepository, LinkRepository)
- Singleton exports: `module.exports = new UserRepository()`
- All SQL queries use parameterized statements (SQL injection prevention)
- JSON fields (like `allowed_roles`) parsed in repository layer

### Frontend Structure (React + Context API)

```
client/src/
├── pages/           # Full page components (Dashboard, Login, Admin, etc.)
├── components/      # Reusable UI components
│   ├── Layout/      # MainLayout, Sidebar, Topbar
│   └── UI/          # PowerBIEmbed, etc.
├── contexts/        # Global state (AuthContext, ThemeContext)
├── hooks/           # Custom hooks (useAuth, useTheme)
├── services/        # API client (axios with auto-auth interceptor)
└── styles/          # Material-UI theme configuration
```

**State Management:**
- **AuthContext** - User session, token storage (localStorage), sign-in/sign-out
- **ThemeContext** - Light/dark mode toggle, MUI theme provider
- No Redux/Zustand - Context API only

**Routing:**
- React Router 7 with `PrivateRoute` wrapper
- Public routes: `/login`, `/register`, `/reset-password`
- Protected routes: `/`, `/pbi/:key`, `/admin/*`, `/profile`
- Route protection via `useAuth` hook checking `signed` state

**API Service (`services/api.js`):**
- Axios instance with `baseURL: VITE_API_URL` (env variable)
- Request interceptor auto-adds Bearer token from localStorage
- No global error interceptor - errors handled in components

## Database Schema

**Core Tables:**

**users:**
- `id`, `name`, `email` (UNIQUE, must end with @sandech.com.br), `password_hash`
- `role` ENUM: `admin`, `pmo`, `manager`, `viewer` (default)
- `approved` BOOLEAN - Admin must approve before login
- `reset_token`, `reset_expires` - Password recovery (1-hour expiration)
- `active`, `created_at`

**app_links:**
- `link_key` (PK) - Format: `{category}_{timestamp}` (categories: pbi, excel, custom)
- `title`, `url`, `allowed_roles` (JSON array)
- `updated_at`

**Connection:**
- Pool config: 10 connections, unlimited queue
- Promise-based API (`mysql2/promise`)
- Environment variables: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`

## Key Workflows

### Authentication Flow
1. User registers → `POST /api/auth/register` → Account created with `approved=FALSE`
2. Admin views pending users → `GET /api/admin/approvals`
3. Admin approves → `PUT /api/admin/approvals/:id` → Sets `approved=TRUE`
4. User logs in → `POST /api/auth/login` → Returns JWT token + user object
5. Client stores token in localStorage
6. Protected requests include `Authorization: Bearer <token>`
7. Middleware validates token → Sets `req.userId`, `req.userRole` → Proceeds to controller

### Role-Based Access Control (RBAC)
- **admin:** Full access (user management, approvals, all links)
- **pmo:** Manage links and reports (cannot manage users)
- **manager:** Project management (planned, not yet implemented)
- **viewer:** Read-only access (default role)

**Implementation:**
```javascript
// In routes
router.put('/admin/users/:id',
    authMiddleware,              // 1. Validate JWT
    checkRole(['admin']),        // 2. Check role
    adminController.updateUser   // 3. Execute
);
```

### Link Management with Permissions
- Links filtered by `allowed_roles` in sidebar
- Admin/PMO can manage links via sidebar edit buttons
- Edit dialog updates: title, URL, category, allowed roles
- Category change triggers key regeneration: `{newCategory}_{Date.now()}`

## Environment Configuration

**Required .env (root of project):**
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=pso_hub_db
JWT_SECRET=your_secret_key_here
PORT=3000
```

**Frontend .env:**
```
VITE_API_URL=http://localhost:3000/api
```

## Security Patterns

1. **Password Hashing:** bcryptjs with 10 salt rounds (default)
2. **JWT Signing:** HMAC-SHA256 with secret from env
3. **Email Domain Whitelist:** Only `@sandech.com.br` allowed
4. **SQL Injection Prevention:** All queries use parameterized statements
5. **User Approval:** Two-step registration (register → admin approval → login)
6. **Token Expiration:** 1-day JWT expiry, 1-hour password reset token

## Brand Guidelines (SANDECH)

**Colors:**
- Primary (Light Mode): `#91121F` (dark red/bordô)
- Primary (Dark Mode): `#E53E3E` (bright red)
- Background (Light): `#F4F6F8`
- Background (Dark): `#121212`

**Typography:** Outfit, Inter, Roboto font stack

**Component Style:**
- Border radius: 16px (cards/papers), 50px (buttons), 24px (dialogs)
- Buttons: Rounded pills with gradient in light mode
- Cards: Hover effect with translateY(-4px) and shadow depth
- Sidebar: 260px expanded, 70px collapsed

## Common Patterns

### Adding a New Protected Route

**Backend:**
```javascript
// 1. Create controller method in controllers/
async newFeature(req, res) {
    const userId = req.userId; // Set by authMiddleware
    // Business logic
    const result = await someService.doSomething(userId);
    res.json(result);
}

// 2. Add route in routes/
router.get('/new-feature',
    authMiddleware,              // Auth check
    checkRole(['admin', 'pmo']), // Role check
    controller.newFeature
);

// 3. Mount in app.js
app.use('/api/feature', featureRoutes);
```

**Frontend:**
```javascript
// 1. Create page in pages/
export default function NewFeature() {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get('/feature/new-feature')
            .then(res => setData(res.data))
            .catch(err => alert('Error: ' + err.message));
    }, []);

    return <div>{/* UI */}</div>;
}

// 2. Add route in App.jsx
<Route path="/new-feature" element={<NewFeature />} />
```

### Adding Repository Methods

```javascript
// Repository pattern
class SomeRepository {
    async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM table WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    async create(data) {
        const [result] = await db.execute(
            'INSERT INTO table (field1, field2) VALUES (?, ?)',
            [data.field1, data.field2]
        );
        return this.findById(result.insertId);
    }
}

module.exports = new SomeRepository();
```

### Working with Material-UI Theme

```javascript
import { useTheme } from '@mui/material/styles';

function Component() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderRadius: theme.shape.borderRadius / 16, // Use theme tokens
        }}>
            {/* Content */}
        </Box>
    );
}
```

## Testing

**Current Status:** No test suite implemented

**Package.json test scripts return error code 1**

When implementing tests:
- Backend: Use Jest or Mocha + Chai
- Frontend: Use Vitest (Vite-native) or Jest + React Testing Library
- E2E: Playwright (infrastructure exists in .gitignore: test-results/, playwright-report/)

## Deployment Notes

**Production Stack:**
- **Server:** Windows VM (192.168.16.48)
- **Process Manager:** PM2 (cluster mode)
- **Reverse Proxy:** Nginx on port 80
- **Frontend Path:** Static files served from `dist/` via Nginx
- **Backend:** Proxied to `localhost:3000` via Nginx `/api` location

**PM2 Config:** `server/ecosystem.config.js`
- App name: `backend-pmo-hub`
- Mode: Cluster (max instances)
- Auto-restart on file changes in dev

**Nginx Config:** `nginx.deploy.conf`
- Serves React SPA with fallback to index.html
- Proxies `/api/*` to Node.js backend
- Forwards client IP headers

## Important Constraints

1. **Email Domain:** Only `@sandech.com.br` emails can register
2. **User Approval:** New users cannot login until admin approves
3. **Stateless Auth:** JWT-only, no session storage on server
4. **Database Transactions:** Not currently implemented (consider for multi-step operations)
5. **No Automated Migrations:** Schema changes require manual SQL execution
6. **No Test Coverage:** No unit/integration tests exist yet

## File Locations Reference

- **Server Entry:** `server/src/app.js`
- **DB Config:** `server/src/config/db.js`
- **Auth Middleware:** `server/src/middlewares/authMiddleware.js`
- **Frontend Entry:** `client/src/main.jsx`
- **App Shell:** `client/src/App.jsx`
- **Theme Config:** `client/src/styles/theme.js`
- **API Client:** `client/src/services/api.js`
- **Full Documentation:** `documentacao_projeto.md` (detailed requirements)
- **Deployment Guide:** `DEPLOY.md` (update workflow)

## Git Workflow

- **Main Branch:** `main`
- **Recent Commits Focus:** Permission system for links, UI/UX improvements, deployment setup
- **Clean Status:** No uncommitted changes at conversation start

When making commits, follow existing patterns:
- `feat:` for new features
- `fix:` for bug fixes
- `ui/ux:` for interface changes
- `chore:` for infrastructure/config
