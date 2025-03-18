import { NextResponse } from "next/server";
import db from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `backup-${timestamp}.sqlite`);

    // Create a copy of the current database
    const dbPath = path.join(process.cwd(), "warehouse.db");
    fs.copyFileSync(dbPath, backupPath);

    // Update last backup timestamp
    db.prepare(
      "UPDATE system_settings SET lastBackup = CURRENT_TIMESTAMP WHERE id = 1"
    ).run();

    // Read the backup file
    const backupData = fs.readFileSync(backupPath);

    // Delete the temporary backup file
    fs.unlinkSync(backupPath);

    // Remove backup directory if empty
    if (fs.readdirSync(backupDir).length === 0) {
      fs.rmdirSync(backupDir);
    }

    return new NextResponse(backupData, {
      headers: {
        "Content-Type": "application/x-sqlite3",
        "Content-Disposition": `attachment; filename="backup-${timestamp}.sqlite"`,
      },
    });
  } catch (error) {
    console.error("Failed to create backup:", error);
    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 }
    );
  }
}
