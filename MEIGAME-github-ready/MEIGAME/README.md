# MEIGAME

MEIGAME is a private college quiz platform for Mahendra Engineering College's IT Department. It provides authenticated administration, configurable staff permissions, a server-authoritative quiz engine, participant sessions, scoring, results, leaderboard, analytics, audit logging, QR joining, and a responsive 3D-inspired interface.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form + Zod
- Framer Motion
- Express + TypeScript
- PostgreSQL + Prisma
- JWT in an HTTP-only cookie
- bcrypt
- Helmet + rate limiting
- Vitest + Supertest

## Requirements

- Node.js 20+
- PostgreSQL 14+
- npm 10+

## Setup

1. Create a PostgreSQL database named `meigame`.
2. Copy `.env.example` to `.env` inside `server/`.
3. Set `DATABASE_URL` and a strong `JWT_SECRET`.
4. From the project root run:

```bash
npm install
npm --prefix server install
npm --prefix client install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:4000

## Initial admin seed

The seed creates two Super Admin accounts using environment variables:

- `mecprajan` / `mahendra@123`
- `mecraju` / `mahendra@123`

These are development defaults only. Change them in `server/.env` before production.

## Database

Prisma schema is in `server/prisma/schema.prisma`.

Useful commands:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Production build

```bash
npm run build
```

Serve `client/dist` from a static host and deploy the Express API separately. Configure `FRONTEND_URL`, secure cookies, HTTPS, and a production PostgreSQL instance.

## Security notes

- Passwords are bcrypt hashes only.
- JWT is stored in an HTTP-only cookie.
- Role and permission checks are performed on the API.
- Participant APIs intentionally omit correct-answer fields.
- Answer correctness and scores are calculated server-side.
- Duplicate answers are prevented by a composite database constraint.
- Login is rate limited.
- Helmet and strict CORS are enabled.
- `.env` is ignored and never required in source control.
- Audit logs are restricted to Super Admins.
- For production, use HTTPS and set `COOKIE_SECURE=true`.

## Feature notes

The live quiz uses server-side quiz state and participant sessions. The client polls the session endpoint while a participant is active, which keeps the implementation lightweight and deployable without a WebSocket broker. The architecture can later add Socket.IO without changing the core scoring model.

## Verification

The repository includes server tests for authentication, authorization, joining, answer submission, duplicate-answer rejection, and result calculation. A real PostgreSQL database is required for the full integration test suite.

## Logo

The supplied MEIGAME logo is stored at `client/public/logo/meigame-logo.png` and is used without recreating or distorting the artwork.

## GitHub hosting

The repository is GitHub-ready and includes GitHub Actions CI. GitHub itself stores the source code but does not run the Express API or PostgreSQL database. For production, deploy the frontend and backend/database to appropriate hosting providers and keep the full source in this GitHub repository. See `GITHUB-HOSTING.md`.

**GitHub Pages limitation:** GitHub Pages can host only the static React frontend. It cannot run the MEIGAME backend or PostgreSQL database.
