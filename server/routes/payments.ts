import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/employee', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const payments = db.prepare(
      `SELECT ep.*, e.name as employee_name FROM employee_payments ep
       JOIN employees e ON ep.employee_id = e.id ORDER BY ep.payment_date DESC LIMIT ? OFFSET ?`
    ).all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM employee_payments').get() as { count: number };
    return res.json({ payments, total: total.count });
  } catch (error) {
    console.error('Failed to fetch employee payments:', error);
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.post('/employee', (req, res) => {
  try {
    const { employee_id, payment_amount, payment_period_start, payment_period_end, notes } = req.body;
    db.prepare(`INSERT INTO employee_payments (employee_id, payment_amount, payment_period_start, payment_period_end, notes) VALUES (?, ?, ?, ?, ?)`)
      .run(employee_id, payment_amount, payment_period_start, payment_period_end, notes || '');
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create employee payment:', error);
    return res.status(500).json({ error: 'Failed to create payment' });
  }
});

router.get('/contractor', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const payments = db.prepare(
      `SELECT cp.*, c.name as contractor_name, COALESCE(p.name, s.name) as item_name
       FROM contractor_payments cp JOIN contractors c ON cp.contractor_id = c.id
       JOIN sales_history sh ON cp.sale_id = sh.id
       LEFT JOIN products p ON sh.product_id = p.id LEFT JOIN services s ON sh.service_id = s.id
       ORDER BY cp.payment_date DESC LIMIT ? OFFSET ?`
    ).all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM contractor_payments').get() as { count: number };
    return res.json({ payments, total: total.count });
  } catch (error) {
    console.error('Failed to fetch contractor payments:', error);
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.post('/contractor', (req, res) => {
  try {
    const { contractor_id, sales } = req.body;
    db.transaction(() => {
      for (const sale of sales) {
        db.prepare(`INSERT INTO contractor_payments (contractor_id, sale_id, contractor_earnings, business_earnings, payment_date) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`)
          .run(contractor_id, sale.id, sale.contractor_earnings, sale.business_earnings);
      }
      db.prepare('UPDATE contractors SET accumulated_commission = 0 WHERE id = ?').run(contractor_id);
    })();
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create contractor payment:', error);
    return res.status(500).json({ error: 'Failed to create payment' });
  }
});

export default router;
