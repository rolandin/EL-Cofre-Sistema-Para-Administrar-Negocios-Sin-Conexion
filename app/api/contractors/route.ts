import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const contractorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  locationFeePercentage: z.number().min(0).max(100),
});

export async function GET() {
  try {
    const contractors = db
      .prepare("SELECT * FROM contractors ORDER BY name")
      .all() as any[];

    return NextResponse.json(contractors);
  } catch (error) {
    console.error("Failed to fetch contractors:", error);
    return NextResponse.json(
      { error: "Failed to fetch contractors" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = contractorSchema.parse(body);

    // Check if contractor name already exists
    const existing = db
      .prepare("SELECT id FROM contractors WHERE name = ?")
      .get(validatedData.name);

    if (existing) {
      return NextResponse.json(
        { error: "A contractor with this name already exists" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `INSERT INTO contractors (
          name,
          location_fee_percentage,
          accumulated_commission,
          start_date
        ) VALUES (?, ?, 0, CURRENT_TIMESTAMP)`
      )
      .run(validatedData.name, validatedData.locationFeePercentage);

    return NextResponse.json({
      id: result.lastInsertRowid,
      success: true,
    });
  } catch (error) {
    console.error("Failed to create contractor:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid contractor data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create contractor" },
      { status: 500 }
    );
  }
}
