import { ErrorRequestHandler } from 'express';
import { AppError } from '../types';

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (process.env.NODE_ENV !== 'test') console.error(err.stack ?? err);
  if (err instanceof AppError) return res.status(err.statusCode).json({ error: { message: err.message, code: err.code, details: err.details } });
  return res.status(500).json({ error: { message: 'An internal error occurred', code: 'INTERNAL_ERROR' } });
};
