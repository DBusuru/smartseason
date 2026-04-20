# 🌿 SmartSeason — Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season.

---

## Demo Credentials

| Role  | Email                       | Password   |
|-------|-----------------------------|------------|
| Admin | admin@smartseason.com       | admin123   |
| Agent | john@smartseason.com        | agent123   |
| Agent | mary@smartseason.com        | agent123   |
| Agent | peter@smartseason.com       | agent123   |

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Node.js + Express                       |
| Database | SQLite via `better-sqlite3`             |
| Auth     | JWT (jsonwebtoken) + bcryptjs           |
| Frontend | React 18 + React Router v6             |
| Styling  | Plain CSS with CSS custom properties    |

SQLite was chosen over PostgreSQL/MySQL to eliminate the need for a running database server — making local setup a single `npm install` + `npm run seed`. The schema is relational and switching to PostgreSQL would require only changing the DB driver.

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm

### 1. Clone and install

```bash
git clone <your-repo-url>
cd smartseason

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Seed the database

```bash
cd backend
npm run seed
```

This creates the SQLite database at `backend/db/smartseason.db` with demo users and 8 sample fields.

### 3. Start the backend

```bash
cd backend
npm run dev
# API running at http://localhost:5000
```

### 4. Start the frontend

In a separate terminal:

```bash
cd frontend
npm start
# App running at http://localhost:3000
```

The frontend proxies `/api` requests to `localhost:5000` automatically.

---

## API Endpoints

### Auth
| Method | Path            | Auth     | Description         |
|--------|-----------------|----------|---------------------|
| POST   | /api/auth/login | —        | Login, returns JWT  |
| GET    | /api/auth/me    | Any      | Get current user    |

### Fields
| Method | Path                      | Auth       | Description                        |
|--------|---------------------------|------------|------------------------------------|
| GET    | /api/fields               | Any        | List fields (role-filtered)        |
| GET    | /api/fields/meta/stats    | Any        | Dashboard stats                    |
| GET    | /api/fields/:id           | Any        | Field detail + update history      |
| POST   | /api/fields               | Admin      | Create field                       |
| PUT    | /api/fields/:id           | Admin      | Update field metadata              |
| DELETE | /api/fields/:id           | Admin      | Delete field                       |
| POST   | /api/fields/:id/updates   | Any        | Log observation/update             |

### Users
| Method | Path              | Auth  | Description       |
|--------|-------------------|-------|-------------------|
|  GET   | /api/users/agents | Admin | List all agents   |

---

## Field Status Logic

Each field has a computed `status` (not stored in DB) derived from its current data:

| Status      | Rule |
|-------------|------|
| `completed` | Stage is `harvested` |
| `at_risk`   | Stage is `ready` AND last update was 7+ days ago (overdue harvest) |
| `at_risk`   | Stage is `planted` AND 60+ days since planting with no progression |
| `at_risk`   | Stage is `growing` AND 90+ days since last update (stagnant) |
| `active`    | All other cases |

This logic lives in `backend/middleware/status.js` and is applied in-memory when returning field data — keeping the DB simple and the logic easy to change.

---

## Design Decisions

### Monorepo, single repo
Frontend and backend live in one repo with a root `package.json` for convenience scripts. This is simpler for a small MVP and easier to review.

### SQLite over PostgreSQL
No need to spin up a DB server for local development. `better-sqlite3` is synchronous and fast — ideal for an MVP. The schema is fully relational (foreign keys, cascades) and production migration to Postgres requires only swapping the driver.

### JWT auth, no refresh tokens
Short-lived tokens (7 days) keep the auth flow simple. For production, add refresh token rotation.

### Status computed, not stored
Field status is derived from existing data on every request rather than stored as a separate column. This prevents status getting out of sync and makes the logic easy to audit and modify.

### Role-based data filtering at the API layer
Agents receive only their assigned fields — filtering happens in SQL, not the frontend. This is the correct approach; the frontend never receives data it shouldn't see.

### No over-engineering
No ORM (raw SQL via better-sqlite3), no Redux (React Context), no TypeScript (kept setup fast). The focus is on working, clean, readable code.

---

## Assumptions

1. User registration is out of scope — admins and agents are seeded or created directly in the DB.
2. A field can only be assigned to one agent at a time.
3. Both admins and agents can log field observations; agents are restricted to their assigned fields.
4. The "At Risk" status thresholds (7 days, 60 days, 90 days) are configurable in `middleware/status.js`.
5. Planting dates in the past are valid (for fields that were already planted before being registered).

---

## Project Structure

```
smartseason/
├── backend/
│   ├── db/
│   │   ├── database.js      # SQLite init + schema
│   │   └── seed.js          # Demo data seeder
│   ├── middleware/
│   │   ├── auth.js          # JWT middleware + role guard
│   │   └── status.js        # Field status computation
│   ├── routes/
│   │   ├── auth.js          # Auth endpoints
│   │   ├── fields.js        # Field CRUD + updates + stats
│   │   └── users.js         # User/agent endpoints
│   └── server.js            # Express app entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── FieldCard.js  # Reusable field card
        │   ├── Layout.js     # Page wrapper
        │   └── Sidebar.js    # Navigation sidebar
        ├── context/
        │   └── AuthContext.js # Global auth state
        ├── pages/
        │   ├── LoginPage.js
        │   ├── DashboardPage.js
        │   ├── FieldsPage.js
        │   ├── FieldDetailPage.js
        │   ├── FieldFormPage.js
        │   └── AgentsPage.js
        ├── utils/
        │   └── api.js        # Fetch wrapper for all API calls
        ├── App.js            # Routes + auth guards
        └── index.css         # Global styles + design tokens
```
