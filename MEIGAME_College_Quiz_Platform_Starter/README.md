# MEIGAME College Quiz Platform — Starter

This package is a polished single-page frontend prototype using the supplied MEIGAME logo.

## Demo accounts
- Super Admin: `mecprajan` / `mahendra@123`
- Super Admin: `mecraju` / `mahendra@123`

## What is included
- Role-aware dashboard UI
- Super Admin, Staff, User and Participant concepts
- User/staff management UI
- Quiz creation and publishing
- Public quiz join-code flow
- Participant isolation from the dashboard
- Server-calculated scoring *conceptually represented in the demo*
- Audit log UI
- Analytics based on recorded demo attempts
- Responsive 3D/depth visual system
- Supplied logo integrated as the brand asset

## Important security limitation
This is a browser-only starter. It uses localStorage so it can run immediately without a server. Therefore it is NOT suitable for real college deployment as-is.

For production, move:
- authentication/password hashing
- sessions
- RBAC
- database
- quiz state
- answer validation
- scoring
- audit logs
- staff permissions

to a real backend with server-side authorization and a relational database.

Do not deploy the demo passwords as production credentials.

## Run
Open `index.html` in a browser, or serve the folder with any static HTTP server.
