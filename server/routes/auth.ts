import { Router } from 'express';
import { z } from 'zod';
import db from '../db';
import {
  verifyPassword,
  createToken,
  verifyTokenFromCookie,
  checkFirstRun,
  createSuperAdmin,
} from '../middleware/auth';

const router = Router();

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = z.object({
      username: z.string(),
      password: z.string(),
    }).parse(req.body);

    const user = db.prepare(
      'SELECT id, password, role, isActive FROM users WHERE username = ?'
    ).get(username) as { id: number; password: string; role: string; isActive: number } | undefined;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'inactiveUserError' });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    db.prepare('UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    await createToken(res, user.id, user.role);

    return res.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// POST /api/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  return res.json({ success: true });
});

// GET /api/me
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = await verifyTokenFromCookie(token);
    const user = db.prepare(
      'SELECT id, username, role, lastLogin FROM users WHERE id = ?'
    ).get(payload.userId) as any;

    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// GET /api/check-setup
router.get('/check-setup', async (_req, res) => {
  try {
    const isFirstRun = await checkFirstRun();
    return res.json({ isFirstRun });
  } catch (error) {
    console.error('Check setup error:', error);
    return res.status(500).json({ error: 'Failed to check setup status' });
  }
});

// POST /api/setup
router.post('/setup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const isFirstRun = await checkFirstRun();
    if (!isFirstRun) {
      return res.status(400).json({ error: 'Setup already completed' });
    }

    await createSuperAdmin(username, password);
    return res.json({ success: true });
  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({ error: 'Failed to complete setup' });
  }
});

export default router;
