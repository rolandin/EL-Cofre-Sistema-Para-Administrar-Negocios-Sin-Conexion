import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const systemSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["en", "es"]),
  autoBackup: z.boolean(),
  backupFrequency: z.enum(["daily", "weekly", "monthly"]),
  retentionDays: z.number().min(1),
  notificationsEnabled: z.boolean(),
  emailNotifications: z.boolean(),
});

export async function GET() {
  try {
    const settings = db
      .prepare("SELECT * FROM system_settings LIMIT 1")
      .get() as any;

    // Convert SQLite integer booleans to JavaScript booleans
    return NextResponse.json({
      theme: settings?.theme || "system",
      language: settings?.language || "es",
      autoBackup: Boolean(settings?.autoBackup),
      backupFrequency: settings?.backupFrequency || "daily",
      retentionDays: settings?.retentionDays || 30,
      notificationsEnabled: Boolean(settings?.notificationsEnabled),
      emailNotifications: Boolean(settings?.emailNotifications),
      lastBackup: settings?.lastBackup || null,
    });
  } catch (error) {
    console.error("Failed to fetch system settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch system settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validatedData = systemSettingsSchema.parse(body);

    // Convert JavaScript booleans to SQLite integers
    db.prepare(
      `UPDATE system_settings SET
        theme = ?,
        language = ?,
        autoBackup = ?,
        backupFrequency = ?,
        retentionDays = ?,
        notificationsEnabled = ?,
        emailNotifications = ?
      WHERE id = 1`
    ).run(
      validatedData.theme,
      validatedData.language,
      validatedData.autoBackup ? 1 : 0,
      validatedData.backupFrequency,
      validatedData.retentionDays,
      validatedData.notificationsEnabled ? 1 : 0,
      validatedData.emailNotifications ? 1 : 0
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update system settings:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid settings data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update system settings" },
      { status: 500 }
    );
  }
}
