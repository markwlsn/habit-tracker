# Agent Handoff: Habit Tracker Backend

**Updated:** 2026-09-01

## Project location

`C:\Users\User.MIS\Documents\Projects\habit-tracker`

## Current state

- TypeScript Express + Supabase backend has been implemented using controller, service, and repository layers.
- Unit tests pass: **4 suites / 21 tests**.
- `npm.cmd run build` passes.
- The local development server starts successfully and `GET http://localhost:3000/health` returns:

  ```json
  { "data": { "status": "ok" } }
  ```

- Implemented routes include authentication, habit CRUD, habit logs, streaks, and dashboard analytics. See `docs/API.md`.
- The project has a local Git repository and was configured with the remote `https://github.com/markwlsn/habit-tracker.git`. Push completion has not been independently confirmed.

## Supabase setup status

- Supabase project URL has been entered in the local `.env` file.
- The `.env` file still contained placeholder values for `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_KEY` at the last configuration check. This causes `POST /api/auth/register` to return `Invalid API key`.
- A Supabase secret key was accidentally shared in chat. It must be rotated in the Supabase dashboard and must never be committed or copied into documentation.
- The publishable key belongs in `SUPABASE_ANON_KEY`.
- A freshly rotated secret key belongs in `SUPABASE_SERVICE_KEY`.
- `JWT_SECRET` is only required by the current configuration contract; Supabase performs actual access-token validation.
- It is not confirmed whether `scripts/database-schema.sql` has been executed in the Supabase SQL Editor. Run it before testing habits/logs.
- For local testing, Supabase Email auth should be enabled and **Confirm email** should be disabled temporarily. Re-enable confirmation before production.

## Required `.env` shape

Do not commit this file. Use real values from the Supabase dashboard, never placeholders.

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=sb_publishable_<real-value>
SUPABASE_SERVICE_KEY=sb_secret_<newly-rotated-value>
JWT_SECRET=<long-random-local-string>
PORT=3000
NODE_ENV=development
```

## Immediate next steps

1. Rotate the exposed Supabase secret key.
2. Replace the two placeholder key values in `.env` with the real publishable and new secret keys.
3. Restart the dev server after saving `.env`.
4. Run `scripts/database-schema.sql` in Supabase SQL Editor.
5. Register a real test user using `POST /api/auth/register`.
6. Use the returned access token to test habit creation, logging, streaks, and dashboard endpoints.
7. Commit the later schema and handoff-document updates, then push them to GitHub after checking the working tree.

## Windows development notes

Node is installed at `C:\Program Files\nodejs`. Some PowerShell sessions do not include it in `PATH`. For a temporary fix:

```powershell
$env:Path = "C:\Program Files\nodejs;$env:Path"
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

The local repository was initialized by Codex, so Git may require this one-time trust setting under the user account:

```powershell
git config --global --add safe.directory "C:/Users/User.MIS/Documents/Projects/habit-tracker"
```

## Security reminders

- `.env` and `.env.test` are ignored by Git.
- Never commit Supabase secret/service-role keys, database passwords, or access tokens.
- Use a request-scoped Supabase client with the caller's token for user data queries so RLS remains the data-access boundary.
