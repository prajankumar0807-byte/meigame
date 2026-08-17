# Security

MEIGAME uses bcrypt password hashing, signed HTTP-only cookie sessions, backend role/permission authorization, Zod request validation, Helmet, restricted CORS, login rate limiting, participant session ownership checks, correct-answer filtering, server-side scoring and database uniqueness for duplicate answer prevention.

Do not treat frontend route hiding as security. The API must remain authoritative. Before production, add integration/security tests, HTTPS, secret rotation, CSRF strategy appropriate to the chosen deployment, centralized logging/monitoring and a real password-reset/email provider.
