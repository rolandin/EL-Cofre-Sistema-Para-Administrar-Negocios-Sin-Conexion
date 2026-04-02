import { Router } from 'express';
import db from '../db';

const router = Router();

// GET /api/inventory
router.get('/', (req, res) => {
  try {
    const search = req.query.search as string || '';
    const sortBy = req.query.sortBy as string || 'name';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const sortColumns: Record<string, string> = { name: 'name', sku: 'sku', quantity: 'quantity', lastUpdated: 'lastUpdated' };
    const sortCol = sortColumns[sortBy] || 'name';

    let query = 'SELECT * FROM products';
    const params: any[] = [];
    if (search) { query += ' WHERE name LIKE ? OR sku LIKE ?'; params.push(`%${search}%`, `%${search}%`); }
    query += ` ORDER BY ${sortCol} ${sortBy === 'quantity' ? 'DESC' : 'ASC'} LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const products = db.prepare(query).all(...params);

    let countQuery = 'SELECT COUNT(*) as count FROM products';
    const countParams: any[] = [];
    if (search) { countQuery += ' WHERE name LIKE ? OR sku LIKE ?'; countParams.push(`%${search}%`, `%${search}%`); }
    const total = db.prepare(countQuery).get(...countParams) as { count: number };
    return res.json({ products, total: total.count });
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

export default router;
