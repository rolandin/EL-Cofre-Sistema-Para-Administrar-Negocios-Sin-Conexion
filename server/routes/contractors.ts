import { Router } from 'express';
import { z } from 'zod';
import db from '../db';

const router = Router();

router.get('/', (_req, res) => {
  try {
    return res.json(db.prepare('SELECT * FROM contractors ORDER BY name').all());
  } catch (error) {
    console.error('Failed to fetch contractors:', error);
    return res.status(500).json({ error: 'Failed to fetch contractors' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    const location_fee_percentage = req.body.location_fee_percentage ?? req.body.locationFeePercentage;
    const existing = db.prepare('SELECT id FROM contractors WHERE name = ?').get(name);
    if (existing) return res.status(400).json({ error: 'Contractor name already exists' });
    db.prepare('INSERT INTO contractors (name, location_fee_percentage, isActive) VALUES (?, ?, 1)').run(name, location_fee_percentage);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create contractor:', error);
    return res.status(500).json({ error: 'Failed to create contractor' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const contractor = db.prepare('SELECT * FROM contractors WHERE id = ?').get(req.params.id);
    if (!contractor) return res.status(404).json({ error: 'Contractor not found' });
    return res.json(contractor);
  } catch (error) {
    console.error('Failed to fetch contractor:', error);
    return res.status(500).json({ error: 'Failed to fetch contractor' });
  }
});

router.patch('/:id', (req, res) => {
  try {
    const location_fee_percentage = req.body.location_fee_percentage ?? req.body.locationFeePercentage;
    db.prepare('UPDATE contractors SET location_fee_percentage = ? WHERE id = ?').run(location_fee_percentage, req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update contractor:', error);
    return res.status(500).json({ error: 'Failed to update contractor' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const hasHistory = (db.prepare('SELECT COUNT(*) as count FROM services_history WHERE contractor_id = ?').get(req.params.id) as { count: number }).count > 0
      || (db.prepare('SELECT COUNT(*) as count FROM sales_history WHERE contractor_id = ?').get(req.params.id) as { count: number }).count > 0;
    if (hasHistory) return res.status(400).json({ error: 'Cannot delete contractor with history' });
    db.prepare('DELETE FROM contractors WHERE id = ?').run(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete contractor:', error);
    return res.status(500).json({ error: 'Failed to delete contractor' });
  }
});

router.get('/:id/earnings', (req, res) => {
  try {
    const serviceEarnings = db.prepare('SELECT COALESCE(SUM(contractor_earnings), 0) as total FROM services_history WHERE contractor_id = ?').get(req.params.id) as { total: number };
    const productEarnings = db.prepare('SELECT COALESCE(SUM(contractor_earnings), 0) as total FROM sales_history WHERE contractor_id = ? AND product_id IS NOT NULL').get(req.params.id) as { total: number };
    return res.json({ serviceEarnings: serviceEarnings.total, productEarnings: productEarnings.total, totalEarnings: serviceEarnings.total + productEarnings.total });
  } catch (error) {
    console.error('Failed to fetch contractor earnings:', error);
    return res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

router.get('/:id/services', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const services = db.prepare(
      `SELECT sh.*, s.name as service_name FROM services_history sh
       JOIN services s ON sh.service_id = s.id WHERE sh.contractor_id = ?
       ORDER BY sh.date_performed DESC LIMIT ? OFFSET ?`
    ).all(req.params.id, limit, offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM services_history WHERE contractor_id = ?').get(req.params.id) as { count: number };
    return res.json({ services, total: total.count });
  } catch (error) {
    console.error('Failed to fetch contractor services:', error);
    return res.status(500).json({ error: 'Failed to fetch contractor services' });
  }
});

router.get('/:id/unpaid-sales', (req, res) => {
  try {
    const unpaidServices = db.prepare(
      `SELECT sh.id, s.name as service_name, sh.price_charged, sh.contractor_earnings, sh.business_earnings, sh.date_performed, 'service' as type
       FROM services_history sh JOIN services s ON sh.service_id = s.id
       WHERE sh.contractor_id = ? AND sh.id NOT IN (SELECT sale_id FROM contractor_payments WHERE contractor_id = ?)
       ORDER BY sh.date_performed DESC`
    ).all(req.params.id, req.params.id);
    const unpaidProducts = db.prepare(
      `SELECT sh.id, p.name as service_name, sh.total_value as price_charged, sh.contractor_earnings, sh.total_value as business_earnings, sh.date_sold as date_performed, 'product' as type
       FROM sales_history sh JOIN products p ON sh.product_id = p.id
       WHERE sh.contractor_id = ? AND sh.contractor_earnings > 0
       AND sh.id NOT IN (SELECT sale_id FROM contractor_payments WHERE contractor_id = ?)
       ORDER BY sh.date_sold DESC`
    ).all(req.params.id, req.params.id);
    return res.json([...unpaidServices, ...unpaidProducts]);
  } catch (error) {
    console.error('Failed to fetch unpaid sales:', error);
    return res.status(500).json({ error: 'Failed to fetch unpaid sales' });
  }
});

router.patch('/:id/status', (req, res) => {
  try {
    const { isActive } = z.object({ isActive: z.number() }).parse(req.body);
    db.prepare('UPDATE contractors SET isActive = ? WHERE id = ?').run(isActive, req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update contractor status:', error);
    return res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
