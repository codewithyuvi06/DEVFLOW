import jwt from 'jsonwebtoken';
import { env } from '../config/env';
export interface SessionPayload { sub: string; email: string; name: string; }
export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}
export function verifyToken(token: string): SessionPayload {
  const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & SessionPayload;
  if (!payload.sub || !payload.email || !payload.name) throw new Error('Invalid session token');
  return payload;
}
