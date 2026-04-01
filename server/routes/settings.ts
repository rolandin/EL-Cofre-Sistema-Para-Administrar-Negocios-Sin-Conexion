import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/business', (_req, res) => {
  try {
    return res.json(db.prepare('SELECT * FROM business_settings WHERE id = 1').get() || {});
  } catch (error) {
    console.error('Failed to fetch business settings:', error);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/business', (req, res) => {
  try {
    const { name, address, phone, email, taxId, defaultCommission, defaultLocationFee, notes } = req.body;
    db.prepare(
      `INSERT INTO business_settings (id, name, address, phone, email, taxId, defaultCommission, defaultLocationFee, notes)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name=?, address=?, phone=?, email=?, taxId=?, defaultCommission=?, defaultLocationFee=?, notes=?`
    ).run(name||'', address||'', phone||'', email||'', taxId||'', defaultCommission||0, defaultLocationFee||0, notes||'',
          name||'', address||'', phone||'', email||'', taxId||'', defaultCommission||0, defaultLocationFee||0, notes||'');
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update business settings:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.get('/system', (_req, res) => {
  try {
    return res.json(db.prepare('SELECT * FROM system_settings WHERE id = 1').get() || { theme: 'system', language: 'es' });
  } catch (error) {
    console.error('Failed to fetch system settings:', error);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/system', (req, res) => {
  try {
    const { theme, language } = req.body;
    db.prepare('UPDATE system_settings SET theme = ?, language = ? WHERE id = 1').run(theme, language);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update system settings:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
