import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';
import { ValidationError } from '../types';

export const validate = (schema: ZodTypeAny): RequestHandler => (req, _res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError(parsed.error.flatten()));
  req.body = parsed.data;
  next();
};

export const validateQuery = (schema: ZodTypeAny): RequestHandler => (req, _res, next) => {
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return next(new ValidationError(parsed.error.flatten()));
  next();
};
