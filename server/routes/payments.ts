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
    const employee_id = req.body.employee_id ?? req.body.employeeId;
    const payment_amount = req.body.payment_amount ?? req.body.amount;
    const payment_period_start = req.body.payment_period_start ?? req.body.periodStart;
    const payment_period_end = req.body.payment_period_end ?? req.body.periodEnd;
    const notes = req.body.notes || '';
    db.prepare(`INSERT INTO employee_payments (employee_id, payment_amount, payment_period_start, payment_period_end, notes) VALUES (?, ?, ?, ?, ?)`)
      .run(employee_id, payment_amount, payment_period_start, payment_period_end, notes);
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
    const contractor_id = req.body.contractor_id ?? req.body.contractorId;
    // Accept both formats: { sales: [{id, contractor_earnings, business_earnings}] } or { saleIds: [1,2,3] }
    const saleIds = req.body.saleIds || (req.body.sales && req.body.sales.map((s: any) => s.id));
    if (!saleIds || !Array.isArray(saleIds)) {
      return res.status(400).json({ error: 'Sale IDs are required' });
    }

    db.transaction(() => {
      for (const saleId of saleIds) {
        // Look up earnings from services_history or sales_history
        const serviceRecord = db.prepare(
          'SELECT contractor_earnings, business_earnings FROM services_history WHERE id = ? AND contractor_id = ?'
        ).get(saleId, contractor_id) as any;

        const saleRecord = serviceRecord || db.prepare(
          'SELECT contractor_earnings, total_value as business_earnings FROM sales_history WHERE id = ? AND contractor_id = ?'
        ).get(saleId, contractor_id) as any;

        if (saleRecord) {
          db.prepare(`INSERT INTO contractor_payments (contractor_id, sale_id, contractor_earnings, business_earnings, payment_date) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`)
            .run(contractor_id, saleId, saleRecord.contractor_earnings, saleRecord.business_earnings);
        }
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
