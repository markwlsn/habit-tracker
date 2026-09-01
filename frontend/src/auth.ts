import type { User } from './types';

const SESSION_KEY = 'tempo-session';
export interface Session { token: string; user: User; }

export function loadSession(): Session | null {
  try { const value = localStorage.getItem(SESSION_KEY); return value ? JSON.parse(value) as Session : null; } catch { return null; }
}
export function saveSession(session: Session): void { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
export function clearSession(): void { localStorage.removeItem(SESSION_KEY); }
