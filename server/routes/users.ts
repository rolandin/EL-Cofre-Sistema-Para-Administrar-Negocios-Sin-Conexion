import { Router } from 'express';
import db from '../db';
import { hashPassword } from '../middleware/auth';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const users = db.prepare(
      `SELECT u.id, u.username, u.role, u.isActive, u.lastLogin, u.employee_id, e.name as employee_name
       FROM users u LEFT JOIN employees e ON u.employee_id = e.id WHERE u.role != 'superadmin' ORDER BY u.username`
    ).all();
    return res.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, password, role, employee_name, employee_position, employee_salary } = req.body;
    const name = employee_name || username;
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    const hashedPassword = await hashPassword(password);
    db.transaction(() => {
      const contractorResult = db.prepare('INSERT INTO contractors (name, location_fee_percentage, isActive) VALUES (?, 100, 1)').run(name);
      const employeeResult = db.prepare('INSERT INTO employees (name, position, salary, contractor_id, is_active) VALUES (?, ?, ?, ?, 1)')
        .run(name, employee_position || 'General', employee_salary || 0, contractorResult.lastInsertRowid);
      db.prepare('INSERT INTO users (username, password, role, isActive, employee_id) VALUES (?, ?, ?, 1, ?)')
        .run(username, hashedPassword, role, employeeResult.lastInsertRowid);
    })();
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create user:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'superadmin') return res.status(403).json({ error: 'Cannot delete superadmin' });
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.patch('/:id/status', (req, res) => {
  try {
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'superadmin') return res.status(403).json({ error: 'Cannot modify superadmin' });
    const { isActive } = req.body;
    db.prepare('UPDATE users SET isActive = ? WHERE id = ?').run(isActive ? 1 : 0, req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update user status:', error);
    return res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
