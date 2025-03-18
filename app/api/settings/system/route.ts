import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const systemSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["en", "es", "ru"]),
});

export async function GET() {
  try {
    const settings = db
      .prepare("SELECT theme, language FROM system_settings LIMIT 1")
      .get() as any;

    return NextResponse.json({
      theme: settings?.theme || "system",
      language: settings?.language || "es",
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

    db.prepare(
      `UPDATE system_settings SET
        theme = ?,
        language = ?
      WHERE id = 1`
    ).run(validatedData.theme, validatedData.language);

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
