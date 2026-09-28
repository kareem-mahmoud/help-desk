# Help Desk

A full-stack help desk starter with an Angular 22 frontend, an Express API, MongoDB persistence, and role-aware authentication.

## Requirements

- Node.js 22 or newer (Node 22+ supports the server's `--env-file-if-exists` option)
- npm
- MongoDB, local or hosted

## Installation

From the repository root, install each app's dependencies:

```bash
cd server && npm install
cd ../client && npm install
```

Create the root environment file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead. Set a MongoDB connection string and a strong `JWT_ACCESS_SECRET` before running the API. Keep `.env` private and never commit it.

## Environment variables

All server variables are read from the repository-root `.env` file.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string, including database name. |
| `JWT_ACCESS_SECRET` | In production | Secret for signing access tokens. Use a unique, high-entropy value. Development can generate an ephemeral secret when omitted; existing access tokens stop working after a server restart. |
| `PORT` | No | API port; defaults to `3000`. |
| `CLIENT_URL` | No | Allowed CORS origin; defaults to `http://localhost:4200`. |
| `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | To seed admin | Credentials for the development admin account. |
| `SEED_AGENT_NAME`, `SEED_AGENT_EMAIL`, `SEED_AGENT_PASSWORD` | To seed agent | Credentials for the development agent account. |
| `SEED_CUSTOMER_NAME`, `SEED_CUSTOMER_EMAIL`, `SEED_CUSTOMER_PASSWORD` | To seed customer | Credentials for the development customer account. |

Seed passwords must be at least 8 characters and no more than 72 UTF-8 bytes. Use local-only credentials and do not commit them.

## Run locally

Start MongoDB first, then run each app in its own terminal from the repository root:

```bash
cd server
npm run dev
```

```bash
cd client
npm start
```

Open <http://localhost:4200>. The API listens at <http://localhost:3000>; check <http://localhost:3000/health> for its status.

## Seed development users

Set the nine `SEED_*` values in the root `.env`, then run:

```bash
cd server
npm run seed
```

The seed command creates or updates one admin, agent, and customer account by normalized email, hashes each password with bcrypt, and marks the accounts active. It is safe to re-run; it updates credentials for the configured seed emails. The command does not print passwords.

## Build and test

```bash
cd server
npm run typecheck
npm run build
```

```bash
cd client
npm test
npm run build
```

## API reference

All request and response bodies are JSON unless noted. Validation failures return `400` with field-specific errors. Protected endpoints require `Authorization: Bearer <accessToken>`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Server and MongoDB health; returns `200` when connected or `503` otherwise. |
| `POST` | `/validation-test` | No | Small request-validation example; expects `name` and `email`. |
| `POST` | `/api/auth/register` | No | Create a customer. Body: `{ "name": "Sam Lee", "email": "sam@example.com", "password": "at-least-8-chars" }`. Returns `201`; duplicate email returns `409`. |
| `POST` | `/api/auth/login` | No | Sign in with `{ "email": "sam@example.com", "password": "…" }`. Returns access/refresh tokens and safe user details. Invalid credentials return `401`; inactive accounts return `403`. |
| `POST` | `/api/auth/refresh` | No | Rotate a refresh token. Body: `{ "refreshToken": "…" }`. |
| `POST` | `/api/auth/logout` | No | Revoke a refresh token. Body: `{ "refreshToken": "…" }`. Returns `204`. |
| `GET` | `/api/protected/test` | Any active user | Example authenticated endpoint; returns the safe current-user profile. |
| `GET` | `/api/protected/admin-test` | Admin | Example admin-only endpoint; returns `401` if unauthenticated and `403` if the role is not allowed. |

Example login response:

```json
{
  "accessToken": "<signed-token>",
  "refreshToken": "<opaque-token>",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "<user-id>",
    "name": "Sam Lee",
    "email": "sam@example.com",
    "role": "customer",
    "isActive": true,
    "createdAt": "<timestamp>",
    "updatedAt": "<timestamp>"
  }
}
```

## Screenshots

Login, registration, and dashboard screenshots belong in `docs/screenshots/`. They are not included yet; capture them from the running app after completing a browser-based release walkthrough.

## Project layout

- `client/` — Angular application
- `server/` — Express API, authentication, and MongoDB models
- `docs/` — project documentation and screenshots
