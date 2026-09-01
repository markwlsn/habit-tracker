import { supabaseForUser, supabasePublic } from '../config';
import { AuthenticationError, RegisterDTO, User } from '../types';

export class AuthService {
  async register(details: RegisterDTO): Promise<{ user: User; accessToken: string | null; refreshToken: string | null }> {
    const name = [details.firstName, details.middleName, details.lastName].filter(Boolean).join(' ');
    const { data, error } = await supabasePublic().auth.signUp({
      email: details.email,
      password: details.password,
      options: { data: { name, username: details.username, first_name: details.firstName, middle_name: details.middleName || null, last_name: details.lastName, age: details.age, phone: details.phone, terms_accepted_at: new Date().toISOString(), privacy_notice_version: details.privacyVersion } },
    });
    if (error || !data.user) throw new AuthenticationError(error?.message ?? 'Could not register user');
    return { user: { id: data.user.id, email: data.user.email ?? details.email }, accessToken: data.session?.access_token ?? null, refreshToken: data.session?.refresh_token ?? null };
  }
  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { data, error } = await supabasePublic().auth.signInWithPassword({ email, password });
    if (error || !data.user || !data.session) throw new AuthenticationError('Invalid email or password');
    return { user: { id: data.user.id, email: data.user.email ?? email }, accessToken: data.session.access_token, refreshToken: data.session.refresh_token };
  }
  async logout(accessToken: string): Promise<void> { const { error } = await supabaseForUser(accessToken).auth.signOut(); if (error) throw new AuthenticationError('Could not log out'); }
}
