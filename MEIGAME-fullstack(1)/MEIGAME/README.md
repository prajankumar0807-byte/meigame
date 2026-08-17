# MEIGAME — Private College Quiz Platform

MEIGAME is a production-style full-stack quiz platform for Mahendra Engineering College, IT Department. It provides secure administration, configurable staff permissions, a PostgreSQL/Prisma data layer, quiz creation, live participation, server-side scoring, results, leaderboard, audit logs, QR join links and a responsive original 3D-inspired interface.

## Technology
- React + TypeScript + Vite
- React Router + TanStack Query-ready API layer
- Framer Motion + CSS 3D effects
- Node.js + Express + TypeScript
- Socket.IO
- PostgreSQL + Prisma
- bcryptjs, JWT HTTP-only cookie sessions, Helmet, CORS, rate limiting, Zod, QRCode

## Structure
- `client/` — browser application and supplied MEIGAME logo
- `server/` — API, business logic, authentication, Socket.IO and Prisma
- `server/prisma/` — schema, baseline migration and seed
- `docs/` — architecture, API, database and security notes

## Requirements
- Node.js 20+
- npm 10+
- Docker Desktop (recommended for PostgreSQL)

## Installation
```bash
cp .env.example .env
npm install
```

Start PostgreSQL:
```bash
docker compose up -d postgres
```

Generate Prisma client and apply migrations:
```bash
npm --workspace server exec prisma generate
npm run db:migrate
npm run db:seed
```

Start frontend and backend together:
```bash
npm run dev
```
- Frontend: http://localhost:5173
- API: http://localhost:5000
- Health: http://localhost:5000/health

## Initial development accounts
The seed creates:
- `mecprajan` / `mahendra@123`
- `mecraju` / `mahendra@123`

The password is hashed in PostgreSQL. The seed marks these accounts `mustChangePassword=true`; change them before real deployment.

## Security
- Passwords are bcrypt hashes only.
- Authentication uses an HTTP-only cookie containing a signed session token.
- Backend role/permission middleware protects admin APIs.
- Participant sessions are isolated from normal user/admin accounts.
- Correct answers are not returned by participant APIs.
- Scores are calculated server-side.
- Duplicate answers are rejected by a database unique constraint.
- Login is rate limited.
- Helmet and restricted CORS are enabled.
- `.env` is ignored and is not included in the ZIP.

## Production notes
Set a strong random `JWT_SECRET`, use HTTPS, set `NODE_ENV=production`, use a managed PostgreSQL database, configure a trusted frontend origin, rotate seeded passwords, and put the API behind a reverse proxy. Password reset/email delivery is intentionally not faked; add a real provider before enabling it.

## Build
```bash
npm run build
npm run start
```

## Testing
```bash
npm test
```

The included tests are intentionally small smoke-level security contract tests; expand them into integration tests against a disposable PostgreSQL database before production deployment.
