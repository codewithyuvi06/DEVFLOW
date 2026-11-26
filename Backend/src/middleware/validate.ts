import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '../utils/apiError';
export const validate = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) return next(new ApiError(400, 'Validation failed', result.error.flatten()));
  req.body = result.data.body ?? req.body; next();
};
