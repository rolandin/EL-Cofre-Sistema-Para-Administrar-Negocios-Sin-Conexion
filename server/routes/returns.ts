import { Router } from 'express';
import db from '../db';

const router = Router();

// GET /api/returns (history)
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const history = db.prepare(
      `SELECT rh.*, p.name as product_name FROM returns_history rh
       JOIN products p ON rh.product_id = p.id ORDER BY rh.date_returned DESC LIMIT ? OFFSET ?`
    ).all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM returns_history').get() as { count: number };
    return res.json({ history, total: total.count });
  } catch (error) {
    console.error('Failed to fetch return history:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST /api/returns
router.post('/', (req, res) => {
  try {
    const { product_id, quantity, return_amount } = req.body;
    db.transaction(() => {
      db.prepare('INSERT INTO returns_history (product_id, quantity, return_amount) VALUES (?, ?, ?)').run(product_id, quantity, return_amount);
      db.prepare('UPDATE products SET quantity = quantity + ?, lastUpdated = CURRENT_TIMESTAMP WHERE id = ?').run(quantity, product_id);
    })();
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to process return:', error);
    return res.status(500).json({ error: 'Failed to process return' });
  }
});

export default router;
