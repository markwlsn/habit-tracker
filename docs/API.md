# API reference

All successful responses use `{ "data": ... }`; errors use `{ "error": { "message", "code", "details?" } }`.

Protected routes require `Authorization: Bearer <Supabase access token>`.

## Frontend use

The React client in `frontend/` uses this API as its sole browser-facing data source. Its base URL is configured with `VITE_API_BASE_URL` (default: `http://localhost:3000`). Do not expose `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`, or other backend secrets through Vite environment variables. The existing CORS middleware accepts the Vite development origin; restrict allowed origins before production deployment.

Authentication responses contain `data.user`, `data.accessToken`, and `data.refreshToken`. The frontend keeps only the access token and user identity in local storage for the active session. A newly registered account may have a null access token when email confirmation is enabled; the user should confirm their email and sign in afterward.

`POST /api/auth/register` requires `username`, `firstName`, optional `middleName`, `lastName`, `age` (13–120), `email`, a password of at least 8 characters with uppercase, lowercase, number, and symbol, a Philippine mobile number (`0917 123 4567` or `+639171234567`), `termsAccepted: true`, and `privacyVersion: "2026-09-01"`. Phone numbers are normalized to E.164 (`+63…`) before being stored in Supabase account metadata with the consent timestamp and policy version.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register with `email`, `password`, and `name` |
| POST | `/api/auth/login` | Sign in with `email` and `password` |
| POST | `/api/auth/logout` | End the caller's Supabase session |
| POST | `/api/habits` | Create a habit (`name`, `description`, `frequency`, `targetCount` for weekly) |
| GET | `/api/habits` | List the caller's habits |
| GET/PUT/DELETE | `/api/habits/:id` | Read, update, or delete one habit |
| GET | `/api/habits/:id/streak` | Get `currentStreak` and `longestStreak` |
| POST | `/api/logs` | Add a completion (`habitId`, optional `completionDate`) |
| GET | `/api/logs/:habitId` | List logs; accepts `startDate` and `endDate` (`YYYY-MM-DD`) |
| DELETE | `/api/logs/:id` | Delete a log |
| GET | `/api/analytics/dashboard` | Heatmap, statistics, and habits; accepts an optional date range |

`GET /health` is public and returns the service status.

The API creates a request-scoped Supabase client with the caller's token. Database Row Level Security is therefore the ownership boundary; clients cannot read or mutate another user's rows even if they guess an ID.
