import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./api', async importOriginal => {
  const actual = await importOriginal<typeof import('./api')>();
  return {
    ...actual,
    api: {
      ...actual.api,
      login: vi.fn(),
      register: vi.fn(),
      dashboard: vi.fn().mockResolvedValue({ heatmap: [], statistics: { totalHabits: 0, activeStreaks: 0, averageCompletionRate: 0 }, habits: [] }),
    },
  };
});

import App from './App';
import { api } from './api';
import { clearSession } from './auth';

describe('authentication flow', () => {
  beforeEach(() => { clearSession(); vi.clearAllMocks(); });
  afterEach(() => cleanup());

  it('stores the returned access token and opens the dashboard after sign-in', async () => {
    vi.mocked(api.login).mockResolvedValue({ user: { id: 'user-1', email: 'hello@example.com' }, accessToken: 'token-1', refreshToken: 'refresh-1' });
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Email'), 'hello@example.com');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Keep the rhythm.' })).toBeTruthy());
    expect(JSON.parse(localStorage.getItem('tempo-session') ?? '{}')).toMatchObject({ token: 'token-1', user: { email: 'hello@example.com' } });
  });

  it('requires PH registration details and sends recorded consent to the API', async () => {
    vi.mocked(api.register).mockResolvedValue({ user: { id: 'user-1', email: 'alex@example.com' }, accessToken: 'token-1', refreshToken: 'refresh-1' });
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Create an account' }));
    await user.type(screen.getByLabelText('Username'), 'alex_h');
    await user.type(screen.getByLabelText('First name'), 'Alex');
    await user.type(screen.getByLabelText('Last name'), 'Hill');
    await user.type(screen.getByLabelText('Age'), '28');
    await user.type(screen.getByLabelText('Email'), 'alex@example.com');
    await user.type(screen.getByLabelText('Philippine mobile number'), '0917 123 4567');
    await user.type(screen.getByLabelText('Password'), 'Password123!');
    await user.type(screen.getByLabelText('Confirm password'), 'Password123!');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(api.register).toHaveBeenCalledWith({ username: 'alex_h', firstName: 'Alex', middleName: undefined, lastName: 'Hill', age: 28, email: 'alex@example.com', password: 'Password123!', phone: '0917 123 4567', termsAccepted: true, privacyVersion: '2026-09-01' }));
  });

  it('shows field-level validation before sending an invalid sign-in request', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Enter a valid email address.')).toBeTruthy();
    expect(screen.getByText('Enter your password.')).toBeTruthy();
    expect(api.login).not.toHaveBeenCalled();
  });
});
