import { Router } from 'express';
import db from '../db';

const router = Router();

// GET /api/sales
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const sales = db.prepare(
      `SELECT s.id, s.date_sold, COALESCE(p.name, srv.name) as item_name,
       CASE WHEN p.id IS NOT NULL THEN 'Product' ELSE 'Service' END as type,
       s.quantity, s.total_value, s.net_profit
       FROM sales_history s LEFT JOIN products p ON s.product_id = p.id
       LEFT JOIN services srv ON s.service_id = srv.id
       ORDER BY s.date_sold DESC LIMIT ? OFFSET ?`
    ).all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM sales_history').get() as { count: number };
    return res.json({ sales, total: total.count });
  } catch (error) {
    console.error('Failed to fetch sales:', error);
    return res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// POST /api/sales
router.post('/', (req, res) => {
  try {
    const { products, services } = req.body;
    const contractorId = services.find((s: any) => s.contractorId)?.contractorId;

    db.transaction(() => {
      let totalContractorEarnings = 0;

      for (const item of products) {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId) as any;
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (product.quantity < item.quantity) throw new Error(`Insufficient stock for product: ${product.name}`);

        let contractorEarnings = 0;
        if (contractorId && product.commissionPercentage > 0) {
          contractorEarnings = product.outboundPrice * item.quantity * (product.commissionPercentage / 100);
          totalContractorEarnings += contractorEarnings;
        }

        db.prepare('UPDATE products SET quantity = quantity - ? WHERE id = ?').run(item.quantity, item.productId);
        db.prepare(
          `INSERT INTO sales_history (product_id, quantity, inbound_price_per_unit, outbound_price_per_unit, total_value, net_profit, contractor_id, contractor_earnings, date_sold)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(item.productId, item.quantity, product.inboundPrice, product.outboundPrice,
          product.outboundPrice * item.quantity, (product.outboundPrice - product.inboundPrice) * item.quantity,
          contractorId, contractorEarnings);
      }

      for (const item of services) {
        const service = db.prepare('SELECT * FROM services WHERE id = ?').get(item.serviceId) as any;
        if (!service) throw new Error(`Service not found: ${item.serviceId}`);

        const totalValue = service.base_price;
        let businessEarnings = totalValue;
        let contractorEarnings = 0;

        if (item.contractorId) {
          const contractor = db.prepare('SELECT location_fee_percentage FROM contractors WHERE id = ?').get(item.contractorId) as any;
          if (contractor) {
            const locationFee = totalValue * (contractor.location_fee_percentage / 100);
            contractorEarnings = totalValue - locationFee;
            businessEarnings = locationFee;
            totalContractorEarnings += contractorEarnings;
          }
        }

        db.prepare(
          `INSERT INTO sales_history (service_id, contractor_id, total_value, net_profit, contractor_earnings, date_sold)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(item.serviceId, item.contractorId || null, totalValue, businessEarnings, contractorEarnings);

        db.prepare(
          `INSERT INTO services_history (service_id, contractor_id, price_charged, business_earnings, contractor_earnings, date_performed)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(item.serviceId, item.contractorId || null, totalValue, businessEarnings, contractorEarnings);
      }

      if (contractorId && totalContractorEarnings > 0) {
        db.prepare('UPDATE contractors SET accumulated_commission = accumulated_commission + ? WHERE id = ?')
          .run(totalContractorEarnings, contractorId);
      }
    })();

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create sale:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/sales/products
router.get('/products', (_req, res) => {
  try {
    const products = db.prepare(
      `SELECT DISTINCT p.id, p.name FROM products p
       INNER JOIN sales_history sh ON p.id = sh.product_id ORDER BY p.name`
    ).all();
    return res.json(products);
  } catch (error) {
    console.error('Failed to fetch sold products:', error);
    return res.status(500).json({ error: 'Failed to fetch sold products' });
  }
});

export default router;
