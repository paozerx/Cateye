# Account sign-in

Cateye account creation and sign-in use the FastAPI API and the configured PostgreSQL database. Passwords are stored as Argon2 hashes. A signed, HttpOnly cookie keeps the browser session; the token is not exposed to JavaScript.

## Setup

1. Configure PostgreSQL using the steps in [DATABASE.md](DATABASE.md).
2. Copy `.env.example` to `.env`, set `DATABASE_URL`, and replace `JWT_SECRET_KEY` with a long random value. Set `AUTH_COOKIE_SECURE=true` when serving the API over HTTPS.
3. From `Backend`, install requirements and apply the schema migration:

   ```powershell
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   .\.venv\Scripts\python.exe -m alembic upgrade head
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
   ```

4. Start the frontend from `Frontend` with `npm run dev`.

The frontend and API should use the same site so the `SameSite=Lax` cookie is sent with credentialed requests. Add the frontend origin to `CORS_ORIGINS` when it differs from `http://localhost:3000`.

## API

- `POST /api/auth/register` — create an account with `email`, `password` (10–128 characters), and `display_name`; starts a session.
- `POST /api/auth/login` — verify credentials and start a session.
- `GET /api/auth/me` — return the signed-in account or `401`.
- `POST /api/auth/logout` — clear the session cookie.

The current game collection and session notes remain in browser storage, namespaced by account ID. Account sign-in is backed by PostgreSQL; game data is not yet synced to the API.
