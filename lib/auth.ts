import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import db from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(userId: number, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(JWT_SECRET);

  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60, // 8 hours
  });

  return token;
}

export async function verifyToken(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    throw new Error('Missing token');
  }

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: number; role: string };
  } catch (err) {
    throw new Error('Invalid token');
  }
}

export async function checkFirstRun(): Promise<boolean> {
  try {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const result = stmt.get() as { count: number };
    return result.count === 0;
  } catch (error) {
    console.error('Error checking first run:', error);
    throw error;
  }
}

export async function createSuperAdmin(username: string, password: string): Promise<void> {
  try {
    // Check if username already exists
    const existingUser = db
      .prepare('SELECT id FROM users WHERE username = ?')
      .get(username);

    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create the superadmin user
    const stmt = db.prepare(
      'INSERT INTO users (username, password, role, isActive) VALUES (?, ?, ?, 1)'
    );
    stmt.run(username, hashedPassword, 'superadmin');
  } catch (error) {
    console.error('Error creating superadmin:', error);
    throw error;
  }
}