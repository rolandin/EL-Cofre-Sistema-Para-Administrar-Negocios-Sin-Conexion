import { Request, Response, NextFunction } from 'express';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db from '../db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(res: Response, userId: number, role: string): Promise<string> {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(JWT_SECRET);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000,
  });

  return token;
}

export async function verifyTokenFromCookie(cookieToken: string): Promise<{ userId: number; role: string }> {
  if (!cookieToken) {
    throw new Error('Missing token');
  }
  const verified = await jwtVerify(cookieToken, JWT_SECRET);
  return verified.payload as { userId: number; role: string };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = await verifyTokenFromCookie(token);
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function checkFirstRun(): Promise<boolean> {
  const result = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  return result.count === 0;
}

export async function createSuperAdmin(username: string, password: string): Promise<void> {
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUser) {
    throw new Error('Username already exists');
  }
  const hashedPassword = await hashPassword(password);
  db.prepare('INSERT INTO users (username, password, role, isActive) VALUES (?, ?, ?, 1)')
    .run(username, hashedPassword, 'superadmin');
}
