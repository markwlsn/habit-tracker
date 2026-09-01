# API reference

All successful responses use `{ "data": ... }`; errors use `{ "error": { "message", "code", "details?" } }`.

Protected routes require `Authorization: Bearer <Supabase access token>`.

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
