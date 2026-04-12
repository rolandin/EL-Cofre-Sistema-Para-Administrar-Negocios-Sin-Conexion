import { Router } from 'express';
import { z } from 'zod';
import db from '../db';
import { verifyTokenFromCookie } from '../middleware/auth';

const router = Router();

const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  // Accept both camelCase (frontend) and snake_case field names
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().optional().default(''),
  contractorId: z.number().optional(),
  contractor_id: z.number().optional(),
  employeeId: z.number().optional(),
  employee_id: z.number().optional(),
  clientName: z.string().optional(),
  client_name: z.string().optional(),
  serviceId: z.number().optional(),
  service_id: z.number().optional(),
}).transform((data) => ({
  // Normalize to snake_case for the database
  title: data.title,
  start_time: data.startTime || data.start_time || '',
  end_time: data.endTime || data.end_time || '',
  notes: data.notes || '',
  contractor_id: data.contractorId || data.contractor_id || null,
  employee_id: data.employeeId || data.employee_id || null,
  client_name: data.clientName || data.client_name || '',
  service_id: data.serviceId || data.service_id || null,
})).refine((data) => data.start_time !== '', { message: 'Start time is required', path: ['start_time'] })
  .refine((data) => data.end_time !== '', { message: 'End time is required', path: ['end_time'] });

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

    const parsed = appointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || 'Invalid appointment data';
      return res.status(400).json({ error: firstError });
    }

    const { title, start_time, end_time, notes, contractor_id, employee_id, client_name, service_id } = parsed.data;

    const overlap = db.prepare(
      `SELECT COUNT(*) as count FROM appointments
       WHERE ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))
       AND (contractor_id = ? OR employee_id = ?)`
    ).get(end_time, start_time, end_time, start_time, contractor_id || -1, employee_id || -1) as { count: number };
    if (overlap.count > 0) return res.status(400).json({ error: 'Time slot overlaps with existing appointment' });

    db.prepare(
      `INSERT INTO appointments (title, start_time, end_time, notes, created_by, contractor_id, employee_id, client_name, service_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(title, start_time, end_time, notes, payload.userId, contractor_id, employee_id, client_name, service_id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return res.status(500).json({ error: 'Failed to create appointment' });
  }
});

router.patch('/:id', (req, res) => {
  try {
    const parsed = appointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || 'Invalid appointment data';
      return res.status(400).json({ error: firstError });
    }

    const { title, start_time, end_time, notes, contractor_id, employee_id, client_name, service_id } = parsed.data;
    db.prepare(
      `UPDATE appointments SET title = ?, start_time = ?, end_time = ?, notes = ?,
       contractor_id = ?, employee_id = ?, client_name = ?, service_id = ? WHERE id = ?`
    ).run(title, start_time, end_time, notes, contractor_id, employee_id, client_name, service_id, req.params.id);
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
