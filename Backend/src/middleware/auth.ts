import type { RequestHandler } from 'express';
import { User } from '../models/User';
import { env } from '../config/env';
import { verifyToken } from '../utils/token';
import { ApiError } from '../utils/apiError';

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined ?? bearer;
    if (!token) throw new ApiError(401, 'Authentication required');
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub).select('_id name email');
    if (!user) throw new ApiError(401, 'Session user no longer exists');
    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (error) { next(error instanceof ApiError ? error : new ApiError(401, 'Invalid or expired session')); }
};
