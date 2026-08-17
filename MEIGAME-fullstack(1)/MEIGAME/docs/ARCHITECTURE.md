# Architecture

MEIGAME uses a workspace monorepo. The React client talks to the Express API. The API uses controller → service → Prisma layers and PostgreSQL for persistent state. Socket.IO provides a channel for live quiz events without exposing answer keys.

Authentication is backend-owned. The browser receives an HTTP-only cookie. Authorization is checked on the server for every protected route. Participants are represented by isolated quiz sessions instead of normal privileged users.
