# Finka REST API
Backend for the Finka https://finka.cloud/ - personal financial planning platform. Provides user auth, collaborative projects and expense tracking.

## What’s inside
- Express + PostgreSQL + Sequelize with JWT auth and Google login.
- Project-level budgeting: storages, deposits, expenses, transfers, analytics.
- Media upload for user avatars.
- Stripe checkout/portal endpoints and webhook handling.
- Cron-based currency updates and email sending (Brevo).

## Quick start (Docker)
1) Create a `.env` file (or copy from your local template) and fill required secrets.  
2) Build and run: `docker-compose up --build`  
3) API is available on port `3000` by default at `${API_URI}${API_VERSION}` (example: `/api/v1`).

## Run locally without Docker
1) Prereqs: Node 18+, PostgreSQL.  
2) `npm install`  
3) Set environment variables (see below) in `.env`.  
4) Migrate DB: `npx sequelize-cli db:migrate`  
5) Start dev server: `npm run dev`

## Environment
Key variables used by the service: `NODE_ENV`, `NODE_LOCAL_PORT`, `API_URI`, `API_VERSION`, `ALLOWED_ORIGINS`, `POSTGRESDB_USER`, `POSTGRESDB_ROOT_PASSWORD`, `POSTGRESDB_DATABASE`, `POSTGRESDB_HOST`, `POSTGRESDB_PORT`, `POSTGRESDB_LOCAL_PORT`, `POSTGRESDB_DOCKER_PORT`, `JWT_SECRET_KEY`, `JWT_EXPIRES_IN`, `JWT_RESET_PASSWORD_EXPIRES_IN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `APP_DOMAIN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BREVO_API_KEY`, `CURRENCY_UPDATE_DELAY_HOURS`, `TASK_CURRENCY_UPDATE_FREQ`.

## API map
Base path: `${API_URI}${API_VERSION}` (e.g., `/api/v1`).  
Core groups: `/auth` (signup/login/password reset), `/projects` (project CRUD, storages, deposits, expenses, transfers, analytics), `/upload/avatar`, `/subscription/stripe/*`.
