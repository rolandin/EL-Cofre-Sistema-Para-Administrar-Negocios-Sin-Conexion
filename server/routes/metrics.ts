import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const inventory = db.prepare('SELECT SUM(quantity * inboundPrice) as inventoryValue, SUM(quantity * outboundPrice) as potentialValue FROM products').get() as any;
    const sales = db.prepare('SELECT SUM(total_value) as totalSales, SUM(net_profit) as netProfit FROM sales_history').get() as any;
    const returns = db.prepare('SELECT SUM(quantity * return_amount) as totalReturns FROM returns_history').get() as any;
    return res.json({
      inventoryValue: inventory.inventoryValue || 0,
      potentialValue: inventory.potentialValue || 0,
      totalSales: sales.totalSales || 0,
      netProfit: sales.netProfit || 0,
      totalReturns: returns.totalReturns || 0,
    });
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
