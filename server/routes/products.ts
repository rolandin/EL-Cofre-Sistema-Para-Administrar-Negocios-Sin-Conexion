import { Router } from 'express';
import { z } from 'zod';
import db from '../db';
import { verifyTokenFromCookie } from '../middleware/auth';

const router = Router();

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  inboundPrice: z.number().min(0),
  outboundPrice: z.number().min(0),
  supplier: z.string().optional(),
  commissionPercentage: z.number().min(0).max(100),
  quantity: z.number().min(0),
});

// GET /api/products
router.get('/', (_req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY name').all();
    return res.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products
router.post('/', (req, res) => {
  try {
    const data = productSchema.parse(req.body);
    db.transaction(() => {
      const result = db.prepare(
        `INSERT INTO products (name, sku, inboundPrice, outboundPrice, supplier, commissionPercentage, quantity, lastUpdated)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      ).run(data.name, data.sku, data.inboundPrice, data.outboundPrice, data.supplier || '', data.commissionPercentage, data.quantity);

      if (data.quantity > 0) {
        db.prepare(
          `INSERT INTO receiving_history (product_id, quantity, price_per_unit, date_received)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(result.lastInsertRowid, data.quantity, data.inboundPrice);
      }
    })();
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create product:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid product data', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// PATCH /api/products/:id
router.patch('/:id', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = await verifyTokenFromCookie(token);
    if (payload.role !== 'admin' && payload.role !== 'superadmin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const { name, inboundPrice, outboundPrice, supplier, commissionPercentage } = req.body;
    db.prepare(
      `UPDATE products SET name = ?, inboundPrice = ?, outboundPrice = ?, supplier = ?, commissionPercentage = ?, lastUpdated = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(name, inboundPrice, outboundPrice, supplier || '', commissionPercentage, req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update product:', error);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

export default router;
