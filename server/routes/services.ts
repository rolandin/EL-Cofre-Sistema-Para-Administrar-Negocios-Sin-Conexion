import { Router } from 'express';
import { z } from 'zod';
import db from '../db';

const router = Router();

// GET /api/services
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string || req.query.pageSize as string) || 50;
    const offset = (page - 1) * limit;
    const services = db.prepare('SELECT * FROM services ORDER BY name LIMIT ? OFFSET ?').all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
    return res.json({ services, items: services, total: total.count });
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// POST /api/services
router.post('/', (req, res) => {
  try {
    const raw = req.body;
    const data = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      base_price: z.number().min(0),
      commission_percentage: z.number().min(0).max(100),
    }).parse({
      name: raw.name,
      description: raw.description,
      base_price: raw.base_price ?? raw.basePrice,
      commission_percentage: raw.commission_percentage ?? raw.commissionPercentage,
    });
    db.prepare('INSERT INTO services (name, description, base_price, commission_percentage) VALUES (?, ?, ?, ?)')
      .run(data.name, data.description || '', data.base_price, data.commission_percentage);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create service:', error);
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid service data', details: error.errors });
    return res.status(500).json({ error: 'Failed to create service' });
  }
});

// DELETE /api/services/:id
router.delete('/:id', (req, res) => {
  try {
    const history = db.prepare('SELECT COUNT(*) as count FROM services_history WHERE service_id = ?').get(req.params.id) as { count: number };
    if (history.count > 0) return res.status(400).json({ error: 'Cannot delete service with history' });
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete service:', error);
    return res.status(500).json({ error: 'Failed to delete service' });
  }
});

// GET /api/services/:id/history
router.get('/:id/history', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const history = db.prepare(
      `SELECT sh.*, c.name as contractor_name FROM services_history sh
       LEFT JOIN contractors c ON sh.contractor_id = c.id
       WHERE sh.service_id = ? ORDER BY sh.date_performed DESC LIMIT ? OFFSET ?`
    ).all(req.params.id, limit, offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM services_history WHERE service_id = ?').get(req.params.id) as { count: number };
    return res.json({ records: history, total: total.count });
  } catch (error) {
    console.error('Failed to fetch service history:', error);
    return res.status(500).json({ error: 'Failed to fetch service history' });
  }
});

export default router;
