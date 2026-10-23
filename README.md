# CallWave — AI calling & CRM

A light green and white workspace for bulk calling, AI-personalized messages, campaigns
and CRM, with secure email/password authentication and Google sign-in.

## What is included

- **Login** — email/password, remember me for 30 days, show/hide password, validation.
- **Register** — name, email, password strength, confirm password, validation.
- **Google sign-in** — server-side OAuth 2.0 authorization-code flow.
- **Secure sessions** — password hashing with bcrypt, JWT in an httpOnly cookie.
- **Home dashboard** — live workspace summary, call performance chart, AI message
  studio preview, recent campaigns, CRM pipeline and hot leads.
- **Campaign builder** — a working demo modal for creating a draft campaign locally.
- **Responsive layout** — checked at 1440px, 1280px, 1024px, 390px, 360px, and 320px.

## Current scope

Login, registration, Google sign-in and the signed-in home page are built. Dashboard
numbers and campaign/CRM data are sample data for the design. Creating a campaign updates
the page locally for demonstration; it is not persisted to the database yet. Sidebar links
outside Home show a "coming next" notice rather than leading to empty pages.

## Stack

- Frontend: React 19, TypeScript, Vite, React Router
- Backend: Express, PostgreSQL (`pg`), bcryptjs, jsonwebtoken, Google Auth Library
- Node.js **20+** and PostgreSQL **14+** are required.

## Run locally

This project uses PostgreSQL. You can use **Neon** (cloud) or a local PostgreSQL server.

### Option A — Neon

1. Open [Neon Console](https://console.neon.tech/) and select your project.
2. Click **Connect** and copy the pooled connection string.
3. Paste it as `DATABASE_URL` in `backend/.env` and keep `?sslmode=require`.
4. Skip the `CREATE DATABASE` step — Neon already provides the database, and the
   `users` table is created automatically when the backend starts.

```env
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

### Option B — Local PostgreSQL

Create the database (once):

```bash
psql -U postgres -c "CREATE DATABASE callwave;"
```

Set `DATABASE_URL` in `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/callwave
```

### Start the app

Start the backend:

```bash
cd backend
npm install
npm run dev
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

> Use `localhost`, not `127.0.0.1`, so the Google OAuth callback and auth cookie share the
> same host.
>
> In development, the API can start without PostgreSQL so Ollama message-writing routes
> remain available. Database-backed routes will be unavailable and `/api/health` will
> report the database as unavailable until the database connection is fixed.

If message generation fails, check that `OLLAMA_MODEL` matches a model listed by
`ollama list`. If Ollama reports that its model runner is missing, restart or reinstall
Ollama, then retry generation.

## Environment

Backend settings live in `backend/.env`. A committed template is available at
`backend/.env.example`.

| Variable | Purpose |
| --- | --- |
| `PORT` | API port, default `5000` |
| `FRONTEND_URL` | Allowed browser origin, default `http://localhost:5173` |
| `BACKEND_URL` | Public API URL, used to build the callback |
| `JWT_SECRET` | Random secret, minimum 32 characters |
| `DATABASE_URL` | PostgreSQL connection string. For Neon, use the pooled string with `?sslmode=require` |
| `DATABASE_SSL` | Optional. SSL is auto-detected for Neon; set `true` if another provider needs it |
| `GOOGLE_CLIENT_ID` | Google OAuth web client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth web client secret |
| `GOOGLE_REDIRECT_URI` | Must match the URL registered in Google Cloud |
| `OLLAMA_URL` | Ollama server URL, default `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model used for assistant replies and message drafts, default `llama3.2:3b` |

Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Google sign-in setup

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** of type **Web application**.
3. Add this exact authorized redirect URI:

   ```text
   http://localhost:5000/api/auth/google/callback
   ```

4. Put the client ID and client secret in `backend/.env`.
5. Restart the backend, then reload the frontend.

The Google button is always visible. If credentials are missing, clicking it shows a clear
setup message instead of a broken flow.

For deployment, register the production callback URL and update `FRONTEND_URL`,
`BACKEND_URL`, and `GOOGLE_REDIRECT_URI` accordingly.

## API

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/auth/config` | Returns whether Google sign-in is enabled |
| `POST` | `/api/auth/register` | Creates an account and session |
| `POST` | `/api/auth/login` | Signs in and sets the session cookie |
| `POST` | `/api/auth/logout` | Clears the session cookie |
| `GET` | `/api/auth/me` | Returns the signed-in user |
| `GET` | `/api/auth/google/start` | Starts Google OAuth |
| `GET` | `/api/auth/google/callback` | Google OAuth callback |
| `POST` | `/api/ai/generate-reply` | Generates a contextual WhatsApp reply for a lead |
| `POST` | `/api/talk` | Returns an assistant reply using recent conversation history |
| `POST` | `/api/draft-message` | Generates three message drafts in the selected format, tone, and language |

## Security notes

- Passwords are hashed with bcrypt (12 rounds) and never stored in plain text.
- Sessions use short-lived JWTs in `httpOnly`, `SameSite=Lax` cookies.
- Google ID tokens are verified server-side, including the audience and verified email.
- OAuth state is protected with a random, httpOnly cookie.
- Login and registration are rate limited; requests are validated and size limited.
- PostgreSQL queries are parameterised.
- `backend/.env` is ignored by Git.

The pages built right now are login, registration, and the signed-in home dashboard.
