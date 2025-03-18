import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const appointmentSchema = z.object({
  title: z.string().min(1),
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let query = `
      SELECT 
        a.*,
        u.username as created_by_username
      FROM appointments a
      JOIN users u ON a.created_by = u.id
    `;

    const params: any[] = [];
    if (start && end) {
      query += " WHERE start_time >= ? AND end_time <= ?";
      params.push(start, end);
    }

    query += " ORDER BY start_time";

    const appointments = db.prepare(query).all(...params) as any[];

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyToken(request);
    const body = await request.json();
    const validatedData = appointmentSchema.parse(body);

    const result = db
      .prepare(
        `INSERT INTO appointments (
          title,
          start_time,
          end_time,
          notes,
          created_by
        ) VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        validatedData.title,
        validatedData.startTime,
        validatedData.endTime,
        validatedData.notes || "",
        auth.userId
      );

    return NextResponse.json({
      id: result.lastInsertRowid,
      success: true,
    });
  } catch (error) {
    console.error("Failed to create appointment:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid appointment data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
