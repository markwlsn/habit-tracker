import { ErrorRequestHandler } from 'express';
import { AppError } from '../types';
import { log } from '../utils/logger';

export const errorMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
  if (process.env.NODE_ENV !== 'test') log('error', 'request_failed', { requestId: res.getHeader('X-Request-Id'), method: req.method, path: req.path, status: err instanceof AppError ? err.statusCode : 500, code: err instanceof AppError ? err.code : 'INTERNAL_ERROR', error: err instanceof Error ? err.message : String(err) });
  if (err instanceof AppError) return res.status(err.statusCode).json({ error: { message: err.message, code: err.code, details: err.details } });
  return res.status(500).json({ error: { message: 'An internal error occurred', code: 'INTERNAL_ERROR' } });
};
