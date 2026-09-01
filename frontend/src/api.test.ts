import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest } from './api';

describe('apiRequest', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('unwraps data and sends the bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { id: 'h-1' } }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(apiRequest<{ id: string }>('/api/habits', {}, 'token-1')).resolves.toEqual({ id: 'h-1' });
    expect(fetchMock.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer token-1');
  });
  it('normalizes the API error wrapper', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: 'Already complete', code: 'DUPLICATE' } }), { status: 409 })));
    await expect(apiRequest('/api/logs')).rejects.toMatchObject({ message: 'Already complete', code: 'DUPLICATE', status: 409 } as ApiError);
  });
});
