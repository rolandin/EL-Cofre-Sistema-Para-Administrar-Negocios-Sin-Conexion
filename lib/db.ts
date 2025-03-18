import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = path.join(__dirname, "../warehouse.db");
const ENCRYPTION_KEY =
  process.env.DB_ENCRYPTION_KEY || "your-secure-encryption-key";

let db: Database.Database;

try {
  db = new Database(DB_PATH);
  db.pragma(`key = '${ENCRYPTION_KEY}'`);

  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('superadmin', 'admin', 'controller')) NOT NULL,
      lastLogin TEXT,
      isActive INTEGER NOT NULL DEFAULT 1,
      employee_id INTEGER,
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      salary REAL,
      hire_date TEXT DEFAULT CURRENT_TIMESTAMP,
      contractor_id INTEGER,
      FOREIGN KEY(contractor_id) REFERENCES contractors(id)
    );

    CREATE TABLE IF NOT EXISTS employee_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      payment_amount REAL NOT NULL,
      payment_date TEXT DEFAULT CURRENT_TIMESTAMP,
      payment_period_start TEXT NOT NULL,
      payment_period_end TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      quantity INTEGER NOT NULL DEFAULT 0,
      inboundPrice REAL NOT NULL,
      outboundPrice REAL NOT NULL,
      supplier TEXT,
      commissionPercentage REAL NOT NULL DEFAULT 0,
      lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP,
      sku TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS receiving_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_per_unit REAL NOT NULL,
      date_received TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS sales_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      service_id INTEGER,
      quantity INTEGER,
      inbound_price_per_unit REAL,
      outbound_price_per_unit REAL,
      total_value REAL NOT NULL,
      net_profit REAL NOT NULL,
      contractor_id INTEGER,
      contractor_earnings REAL,
      date_sold TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id),
      FOREIGN KEY(service_id) REFERENCES services(id),
      FOREIGN KEY(contractor_id) REFERENCES contractors(id)
    );

    CREATE TABLE IF NOT EXISTS returns_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      return_amount REAL NOT NULL,
      date_returned TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS contractors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location_fee_percentage REAL NOT NULL,
      accumulated_commission REAL NOT NULL DEFAULT 0,
      start_date TEXT DEFAULT CURRENT_TIMESTAMP,
      isActive INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      base_price REAL NOT NULL,
      commission_percentage REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS services_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      contractor_id INTEGER,
      client_name TEXT,
      price_charged REAL NOT NULL,
      business_earnings REAL NOT NULL,
      contractor_earnings REAL NOT NULL,
      date_performed TEXT DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      FOREIGN KEY(service_id) REFERENCES services(id),
      FOREIGN KEY(contractor_id) REFERENCES contractors(id)
    );

    CREATE TABLE IF NOT EXISTS contractor_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contractor_id INTEGER NOT NULL,
      sale_id INTEGER NOT NULL,
      contractor_earnings REAL NOT NULL,
      business_earnings REAL NOT NULL,
      payment_date TEXT NOT NULL,
      FOREIGN KEY(contractor_id) REFERENCES contractors(id),
      FOREIGN KEY(sale_id) REFERENCES sales_history(id)
    );

    CREATE TABLE IF NOT EXISTS business_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      taxId TEXT NOT NULL DEFAULT '',
      defaultCommission REAL NOT NULL DEFAULT 0,
      defaultLocationFee REAL NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL DEFAULT 'system' CHECK(theme IN ('light', 'dark', 'system')),
      language TEXT NOT NULL DEFAULT 'es' CHECK(language IN ('en', 'es')),
      lastBackup TEXT
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      notes TEXT,
      created_by INTEGER NOT NULL,
      contractor_id INTEGER,
      employee_id INTEGER,
      client_name TEXT,
      service_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id),
      FOREIGN KEY(contractor_id) REFERENCES contractors(id),
      FOREIGN KEY(employee_id) REFERENCES employees(id),
      FOREIGN KEY(service_id) REFERENCES services(id)
    );

    -- Insert default system settings if they don't exist
    INSERT OR IGNORE INTO system_settings (id) VALUES (1);
  `);
} catch (error) {
  console.error("Database initialization error:", error);
  process.exit(1);
}

export default db;
