import type { VercelRequest } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

interface JwtPayload {
  steamId: string;
}

function isJwtPayload(val: unknown): val is JwtPayload {
  return typeof val === 'object' && val !== null && 'steamId' in val;
}

export function getSession(req: VercelRequest): JwtPayload | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  const token = cookies.session;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    if (!isJwtPayload(payload)) return null;
    return payload;
  } catch {
    return null;
  }
}