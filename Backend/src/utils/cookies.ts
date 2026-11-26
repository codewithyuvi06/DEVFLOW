import type { CookieOptions, Response } from 'express';
import { env } from '../config/env';
const options: CookieOptions = {
  httpOnly: true, secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE, path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000
};
export function setSessionCookie(res: Response, token: string) { res.cookie(env.COOKIE_NAME, token, options); }
export function clearSessionCookie(res: Response) { res.clearCookie(env.COOKIE_NAME, { ...options, maxAge: undefined }); }
