# Hosting MEIGAME with GitHub

## Important

GitHub is the source-code host. A normal GitHub repository cannot run the Express API or PostgreSQL database by itself.

For the complete MEIGAME application, use:

- GitHub: source code and CI
- A Node hosting service: Express API
- A PostgreSQL provider: database
- A static hosting service: React frontend

You can still keep the **entire project in one GitHub repository**.

## 1. Create the GitHub repository

Create an empty repository named `meigame` and push this project:

```bash
git init
git branch -M main
git add .
git commit -m "Initial MEIGAME full-stack application"
git remote add origin https://github.com/YOUR_USERNAME/meigame.git
git push -u origin main
```

Do not upload `.env` or passwords.

## 2. Configure the backend

Deploy the `server` directory to a Node.js host.

Required environment variables:

```env
DATABASE_URL=your-postgresql-connection-string
JWT_SECRET=your-long-random-secret
FRONTEND_URL=https://your-frontend-domain.example
PORT=4000
COOKIE_SECURE=true
```

Build command:

```bash
npm install && npm run db:generate && npm run build
```

Start command:

```bash
npm start
```

Before first production start, run the Prisma migration/seed process from a trusted deployment environment.

## 3. Configure the frontend

Set this environment variable on the frontend host:

```env
VITE_API_URL=https://your-api-domain.example/api
```

Then build:

```bash
npm install
npm run build
```

The generated site is in `client/dist`.

## 4. GitHub Pages limitation

GitHub Pages can host the React static frontend, but it **cannot host the Express API or PostgreSQL database**. Therefore GitHub Pages alone is not sufficient for the full MEIGAME application.

If you specifically want GitHub Pages for the frontend, deploy the API and database separately and set `VITE_API_URL` to the public API URL.

## 5. Continuous integration

`.github/workflows/ci.yml` automatically installs dependencies, starts PostgreSQL, generates Prisma Client, runs backend tests, and builds the application on pushes and pull requests.
