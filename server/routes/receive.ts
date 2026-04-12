import { Router } from 'express';
import db from '../db';

const router = Router();

// GET /api/receive (history)
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const history = db.prepare(
      `SELECT rh.*, p.name as product_name, p.sku FROM receiving_history rh
       JOIN products p ON rh.product_id = p.id ORDER BY rh.date_received DESC LIMIT ? OFFSET ?`
    ).all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM receiving_history').get() as { count: number };
    return res.json({ records: history, total: total.count });
  } catch (error) {
    console.error('Failed to fetch receive history:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST /api/receive
router.post('/', (req, res) => {
  try {
    // Accept both camelCase (frontend) and snake_case
    const product_id = req.body.productId || req.body.product_id;
    const quantity = req.body.quantity;
    const price_per_unit = req.body.pricePerUnit || req.body.price_per_unit;
    db.transaction(() => {
      db.prepare('INSERT INTO receiving_history (product_id, quantity, price_per_unit) VALUES (?, ?, ?)').run(product_id, quantity, price_per_unit);
      db.prepare('UPDATE products SET quantity = quantity + ?, inboundPrice = ?, lastUpdated = CURRENT_TIMESTAMP WHERE id = ?').run(quantity, price_per_unit, product_id);
    })();
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to receive product:', error);
    return res.status(500).json({ error: 'Failed to receive product' });
  }
});

export default router;
