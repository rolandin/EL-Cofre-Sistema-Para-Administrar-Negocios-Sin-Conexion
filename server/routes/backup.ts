import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Database from 'better-sqlite3';
import db, { DB_PATH } from '../db';

const router = Router();
const upload = multer({ dest: path.join(os.tmpdir(), 'elcofre-uploads') });

router.post('/', (_req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(os.tmpdir(), 'elcofre-backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
    const backupPath = path.join(backupDir, `backup-${timestamp}.sqlite`);
    const dbPath = DB_PATH;
    fs.copyFileSync(dbPath, backupPath);
    const backupData = fs.readFileSync(backupPath);
    fs.unlinkSync(backupPath);
    if (fs.readdirSync(backupDir).length === 0) fs.rmdirSync(backupDir);
    res.setHeader('Content-Type', 'application/x-sqlite3');
    res.setHeader('Content-Disposition', `attachment; filename="backup-${timestamp}.sqlite"`);
    return res.send(backupData);
  } catch (error) {
    console.error('Failed to create backup:', error);
    return res.status(500).json({ error: 'Failed to create backup' });
  }
});

router.post('/restore', upload.single('backup'), (req, res) => {
  const tempPath = req.file?.path;
  try {
    if (!req.file || !req.file.originalname.endsWith('.sqlite')) {
      if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return res.status(400).json({ error: 'Invalid file format. Only .sqlite files are allowed' });
    }
    const tempDb = new Database(tempPath!);
    const tables = tempDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const required = ['users','employees','employee_payments','products','receiving_history','sales_history','returns_history','contractors','services','services_history','contractor_payments','business_settings','system_settings'];
    const missing = required.filter(t => !tables.find(row => row.name === t));
    if (missing.length > 0) { tempDb.close(); throw new Error(`Invalid backup: Missing tables: ${missing.join(', ')}`); }
    tempDb.close();
    db.close();
    const dbPath = DB_PATH;
    fs.copyFileSync(tempPath!, dbPath);
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    return res.json({ success: true });
  } catch (error) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error('Failed to restore backup:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to restore backup' });
  }
});

export default router;
