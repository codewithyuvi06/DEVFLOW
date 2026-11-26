import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError';
export const notFound: RequestHandler = (req, _res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.path}`));
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = err instanceof ApiError ? err.statusCode : 500;
  let message = err instanceof Error ? err.message : 'Unexpected server error';
  let details = err instanceof ApiError ? err.details : undefined;
  if (err instanceof mongoose.Error.ValidationError) { status = 400; message = 'Database validation failed'; details = err.message; }
  if (err instanceof mongoose.Error.CastError) { status = 400; message = 'Invalid resource identifier'; }
  if ((err as { code?: number }).code === 11000) { status = 409; message = 'A record with this value already exists'; }
  if (status >= 500) { console.error(err); message = process.env.NODE_ENV === 'production' ? 'Internal server error' : message; }
  res.status(status).json({ success: false, error: { message, ...(details ? { details } : {}) } });
};
