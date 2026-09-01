import type { AuthResult, Dashboard, Habit, HabitPayload, RegistrationPayload, Streak } from './types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message: string, public readonly code?: string, public readonly status?: number) { super(message); this.name = 'ApiError'; }
}

type ApiEnvelope<T> = { data: T };
type ErrorEnvelope = { error?: { message?: string; code?: string } };

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let response: Response;
  try { response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers }); }
  catch { throw new ApiError('Unable to reach the server. Check that the API is running.'); }
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => ({})) as ApiEnvelope<T> & ErrorEnvelope;
  if (!response.ok) throw new ApiError(body.error?.message ?? 'Something went wrong. Please try again.', body.error?.code, response.status);
  return body.data;
}

export const api = {
  register: (payload: RegistrationPayload) => apiRequest<AuthResult>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (email: string, password: string) => apiRequest<AuthResult>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: (token: string) => apiRequest<void>('/api/auth/logout', { method: 'POST' }, token),
  dashboard: (token: string) => apiRequest<Dashboard>('/api/analytics/dashboard', {}, token),
  habits: (token: string) => apiRequest<Habit[]>('/api/habits', {}, token),
  createHabit: (token: string, payload: HabitPayload) => apiRequest<Habit>('/api/habits', { method: 'POST', body: JSON.stringify(payload) }, token),
  updateHabit: (token: string, id: string, payload: Partial<HabitPayload>) => apiRequest<Habit>(`/api/habits/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token),
  deleteHabit: (token: string, id: string) => apiRequest<void>(`/api/habits/${id}`, { method: 'DELETE' }, token),
  streak: (token: string, id: string) => apiRequest<Streak>(`/api/habits/${id}/streak`, {}, token),
  complete: (token: string, habitId: string) => apiRequest('/api/logs', { method: 'POST', body: JSON.stringify({ habitId }) }, token),
};
