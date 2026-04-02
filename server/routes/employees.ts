import { Router } from 'express';
import db from '../db';

const router = Router();

// GET /api/employees
router.get('/', (_req, res) => {
  try {
    const employees = db.prepare(
      `SELECT e.*, c.name as contractor_name, c.id as contractor_id
       FROM employees e LEFT JOIN contractors c ON e.contractor_id = c.id ORDER BY e.name`
    ).all();
    return res.json(employees);
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// POST /api/employees
router.post('/', (req, res) => {
  try {
    const { name, position, salary } = req.body;
    db.transaction(() => {
      const contractorResult = db.prepare('INSERT INTO contractors (name, location_fee_percentage, isActive) VALUES (?, 100, 1)').run(name);
      db.prepare('INSERT INTO employees (name, position, salary, contractor_id, is_active) VALUES (?, ?, ?, ?, 1)')
        .run(name, position, salary || 0, contractorResult.lastInsertRowid);
    })();
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create employee:', error);
    return res.status(500).json({ error: 'Failed to create employee' });
  }
});

// GET /api/employees/:id
router.get('/:id', (req, res) => {
  try {
    const employee = db.prepare(
      `SELECT e.*, c.name as contractor_name FROM employees e
       LEFT JOIN contractors c ON e.contractor_id = c.id WHERE e.id = ?`
    ).get(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    return res.json(employee);
  } catch (error) {
    console.error('Failed to fetch employee:', error);
    return res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// PATCH /api/employees/:id
router.patch('/:id', (req, res) => {
  try {
    const { name, position, salary, is_active } = req.body;
    if (is_active === 0) {
      const pending = db.prepare(
        `SELECT COUNT(*) as count FROM employee_payments WHERE employee_id = ? AND payment_date > datetime('now', '-30 days')`
      ).get(req.params.id) as { count: number };
      if (pending.count > 0) return res.status(400).json({ error: 'Cannot deactivate employee with recent payments' });
    }
    db.prepare('UPDATE employees SET name = ?, position = ?, salary = ?, is_active = ? WHERE id = ?')
      .run(name, position, salary, is_active, req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update employee:', error);
    return res.status(500).json({ error: 'Failed to update employee' });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', (req, res) => {
  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id) as any;
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    db.transaction(() => {
      if (employee.contractor_id) db.prepare('DELETE FROM contractors WHERE id = ?').run(employee.contractor_id);
      db.prepare('DELETE FROM users WHERE employee_id = ?').run(req.params.id);
      db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
    })();
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete employee:', error);
    return res.status(500).json({ error: 'Failed to delete employee' });
  }
});

export default router;
