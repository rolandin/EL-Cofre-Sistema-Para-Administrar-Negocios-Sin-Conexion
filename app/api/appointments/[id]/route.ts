import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const appointmentUpdateSchema = z.object({
  title: z.string().min(1),
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = appointmentUpdateSchema.parse(body);

    const appointment = db
      .prepare("SELECT id FROM appointments WHERE id = ?")
      .get(params.id);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    db.prepare(
      `UPDATE appointments SET
        title = ?,
        start_time = ?,
        end_time = ?,
        notes = ?
      WHERE id = ?`
    ).run(
      validatedData.title,
      validatedData.startTime,
      validatedData.endTime,
      validatedData.notes || "",
      params.id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update appointment:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid appointment data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = db
      .prepare("SELECT id FROM appointments WHERE id = ?")
      .get(params.id);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    db.prepare("DELETE FROM appointments WHERE id = ?").run(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
