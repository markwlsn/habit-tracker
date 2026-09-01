import { afterEach, describe, expect, it } from 'vitest';
import { clearSession, loadSession, saveSession } from './auth';

describe('session storage', () => {
  afterEach(() => clearSession());
  it('persists and restores the active API session', () => {
    saveSession({ token: 'access-token', user: { id: 'user-1', email: 'hello@example.com' } });
    expect(loadSession()).toEqual({ token: 'access-token', user: { id: 'user-1', email: 'hello@example.com' } });
  });
  it('returns null for corrupt saved state', () => {
    localStorage.setItem('tempo-session', 'not-json');
    expect(loadSession()).toBeNull();
  });
});
