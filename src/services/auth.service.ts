import { supabaseForUser, supabasePublic } from '../config';
import { AuthenticationError, User } from '../types';

export class AuthService {
  async register(email: string, password: string, name: string): Promise<{ user: User; accessToken: string | null; refreshToken: string | null }> {
    const { data, error } = await supabasePublic().auth.signUp({ email, password, options: { data: { name } } });
    if (error || !data.user) throw new AuthenticationError(error?.message ?? 'Could not register user');
    return { user: { id: data.user.id, email: data.user.email ?? email }, accessToken: data.session?.access_token ?? null, refreshToken: data.session?.refresh_token ?? null };
  }
  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { data, error } = await supabasePublic().auth.signInWithPassword({ email, password });
    if (error || !data.user || !data.session) throw new AuthenticationError('Invalid email or password');
    return { user: { id: data.user.id, email: data.user.email ?? email }, accessToken: data.session.access_token, refreshToken: data.session.refresh_token };
  }
  async logout(accessToken: string): Promise<void> { const { error } = await supabaseForUser(accessToken).auth.signOut(); if (error) throw new AuthenticationError('Could not log out'); }
}
