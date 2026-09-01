import { RequestHandler } from 'express';
import { supabaseForUser } from '../config';
import { AuthenticationError } from '../types';

declare module 'express-serve-static-core' { interface Request { userId?: string; accessToken?: string; } }

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const match = req.header('authorization')?.match(/^Bearer\s+(.+)$/i);
  if (!match) return next(new AuthenticationError('A Bearer token is required'));
  try {
    const client = supabaseForUser(match[1]);
    const { data, error } = await client.auth.getUser(match[1]);
    if (error || !data.user) return next(new AuthenticationError('Invalid or expired token'));
    req.userId = data.user.id; req.accessToken = match[1];
    next();
  } catch { next(new AuthenticationError('Invalid or expired token')); }
};
