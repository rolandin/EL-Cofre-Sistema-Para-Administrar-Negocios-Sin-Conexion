import { NextResponse } from "next/server";
import db from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get("backup") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No backup file provided" },
        { status: 400 }
      );
    }

    // Verify file type
    if (!file.name.endsWith(".sqlite")) {
      return NextResponse.json(
        { error: "Invalid file format. Only .sqlite files are allowed" },
        { status: 400 }
      );
    }

    // Create a temporary directory for restoration
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Save the uploaded file temporarily
    const tempPath = path.join(tempDir, "temp_restore.sqlite");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(tempPath, buffer);

    try {
      // Verify the backup file is a valid SQLite database
      const tempDb = new db.Database(tempPath);

      // Check if the backup has the required tables
      const tables = tempDb
        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
        .all() as { name: string }[];

      const requiredTables = [
        "users",
        "employees",
        "employee_payments",
        "products",
        "receiving_history",
        "sales_history",
        "returns_history",
        "contractors",
        "services",
        "services_history",
        "contractor_payments",
        "business_settings",
        "system_settings",
      ];

      const missingTables = requiredTables.filter(
        (table) => !tables.find((t) => t.name === table)
      );

      if (missingTables.length > 0) {
        throw new Error(
          `Invalid backup file: Missing required tables: ${missingTables.join(
            ", "
          )}`
        );
      }

      tempDb.close();

      // Close the current database connection
      db.close();

      // Replace the current database with the backup
      const dbPath = path.join(process.cwd(), "warehouse.db");
      fs.copyFileSync(tempPath, dbPath);

      // Clean up
      fs.unlinkSync(tempPath);
      if (fs.existsSync(tempDir)) {
        fs.rmdirSync(tempDir);
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      if (fs.existsSync(tempDir)) {
        fs.rmdirSync(tempDir);
      }

      throw error;
    }
  } catch (error) {
    console.error("Failed to restore backup:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to restore backup",
      },
      { status: 500 }
    );
  }
}
