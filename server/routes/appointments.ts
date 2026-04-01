import { Router } from 'express';
import db from '../db';
import { verifyTokenFromCookie } from '../middleware/auth';

const router = Router();

router.get('/', (req, res) => {
  try {
    const { start, end, contractor_id, employee_id } = req.query;
    let query = `SELECT a.*, u.username as created_by_name, c.name as contractor_name,
                 e.name as employee_name, s.name as service_name
                 FROM appointments a LEFT JOIN users u ON a.created_by = u.id
                 LEFT JOIN contractors c ON a.contractor_id = c.id
                 LEFT JOIN employees e ON a.employee_id = e.id
                 LEFT JOIN services s ON a.service_id = s.id WHERE 1=1`;
    const params: any[] = [];
    if (start && end) { query += ' AND a.start_time >= ? AND a.end_time <= ?'; params.push(start, end); }
    if (contractor_id) { query += ' AND a.contractor_id = ?'; params.push(contractor_id); }
    if (employee_id) { query += ' AND a.employee_id = ?'; params.push(employee_id); }
    query += ' ORDER BY a.start_time ASC';
    return res.json(db.prepare(query).all(...params));
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.post('/', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = await verifyTokenFromCookie(token);
    const { title, start_time, end_time, notes, contractor_id, employee_id, client_name, service_id } = req.body;

    const overlap = db.prepare(
      `SELECT COUNT(*) as count FROM appointments
       WHERE ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))
       AND (contractor_id = ? OR employee_id = ?)`
    ).get(end_time, start_time, end_time, start_time, contractor_id || -1, employee_id || -1) as { count: number };
    if (overlap.count > 0) return res.status(400).json({ error: 'Time slot overlaps with existing appointment' });

    db.prepare(
      `INSERT INTO appointments (title, start_time, end_time, notes, created_by, contractor_id, employee_id, client_name, service_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(title, start_time, end_time, notes || '', payload.userId, contractor_id || null, employee_id || null, client_name || '', service_id || null);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return res.status(500).json({ error: 'Failed to create appointment' });
  }
});

router.patch('/:id', (req, res) => {
  try {
    const { title, start_time, end_time, notes, contractor_id, employee_id, client_name, service_id } = req.body;
    db.prepare(
      `UPDATE appointments SET title = ?, start_time = ?, end_time = ?, notes = ?,
       contractor_id = ?, employee_id = ?, client_name = ?, service_id = ? WHERE id = ?`
    ).run(title, start_time, end_time, notes || '', contractor_id || null, employee_id || null, client_name || '', service_id || null, req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update appointment:', error);
    return res.status(500).json({ error: 'Failed to update appointment' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete appointment:', error);
    return res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router;
