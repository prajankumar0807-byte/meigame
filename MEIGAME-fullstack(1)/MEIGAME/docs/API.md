# API Overview

## Auth
- `POST /api/auth/login` — username/password login
- `POST /api/auth/logout` — authenticated logout
- `GET /api/auth/me` — current user

## Users / Staff
- `GET/POST/PATCH/DELETE /api/users...` — Super Admin only
- `GET/POST/DELETE /api/staff...` — Super Admin only
- `PATCH /api/staff/:id/permissions` — Super Admin only

## Quizzes
- `GET/POST /api/quizzes`
- `GET/PATCH/DELETE /api/quizzes/:id`
- `POST /api/quizzes/:id/publish`
- `POST /api/quizzes/:id/start`
- `POST /api/quizzes/:id/end`
- `POST /api/quizzes/:id/questions`

## Participant
- `POST /api/join/:joinCode`
- `GET /api/participant/session/:sessionId`
- `POST /api/participant/session/:sessionId/answer`
- `POST /api/participant/session/:sessionId/complete`
- `GET /api/participant/session/:sessionId/result`
- `GET /api/quizzes/:quizId/leaderboard`

## Admin
- `GET /api/admin/analytics`
- `GET /api/admin/activity`
