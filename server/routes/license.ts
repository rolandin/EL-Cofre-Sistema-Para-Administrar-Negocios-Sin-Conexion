import { Router } from 'express';
import { checkLicense, activateKey, getLicenseInfo } from '../../electron/license/validator';
import { getMachineCode } from '../../electron/license/machine-id';

const router = Router();

// GET /api/license/status
router.get('/status', async (_req, res) => {
  try {
    const machineId = await getMachineCode();
    const status = checkLicense(machineId);
    const info = getLicenseInfo();

    return res.json({
      ...status,
      machineId,
      license: info ? {
        keyType: info.keyType,
        activatedAt: info.activatedAt,
        expiresAt: info.expiresAt,
      } : null,
    });
  } catch (error) {
    console.error('License status error:', error);
    return res.status(500).json({ error: 'Failed to check license status' });
  }
});

// POST /api/license/activate
router.post('/activate', async (req, res) => {
  try {
    const { key } = req.body;
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'License key is required' });
    }

    const machineId = await getMachineCode();
    const result = activateKey(key.trim(), machineId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Activation error:', error);
    return res.status(500).json({ error: 'Failed to activate license' });
  }
});

// GET /api/license/machine-code
router.get('/machine-code', async (_req, res) => {
  try {
    const machineId = await getMachineCode();
    return res.json({ machineId });
  } catch (error) {
    console.error('Machine code error:', error);
    return res.status(500).json({ error: 'Failed to get machine code' });
  }
});

export default router;
