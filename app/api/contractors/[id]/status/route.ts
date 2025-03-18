import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const statusSchema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = statusSchema.parse(body);

    // Check if contractor exists
    const contractor = db
      .prepare("SELECT id FROM contractors WHERE id = ?")
      .get(params.id);

    if (!contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    // Update contractor status
    db.prepare("UPDATE contractors SET isActive = ? WHERE id = ?").run(
      validatedData.isActive ? 1 : 0,
      params.id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update contractor status:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid status data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update contractor status" },
      { status: 500 }
    );
  }
}
