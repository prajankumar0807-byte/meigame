# Database

PostgreSQL is the source of truth. Prisma models cover users, role permissions, quizzes, questions, options, live sessions, participants, answers, results, activity logs and per-quiz settings.

Important constraints include unique usernames, unique join codes, unique participant session IDs, unique participant/question answers, and one result per participant.
