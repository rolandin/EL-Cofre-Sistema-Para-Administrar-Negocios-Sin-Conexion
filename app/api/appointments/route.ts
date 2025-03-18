import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const appointmentSchema = z.object({
  title: z.string().min(1),
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional(),
  contractorId: z.number().optional(),
  employeeId: z.number().optional(),
  clientName: z.string().optional(),
  serviceId: z.number().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const contractorId = searchParams.get("contractorId");
    const employeeId = searchParams.get("employeeId");

    let query = `
      SELECT 
        a.*,
        u.username as created_by_username,
        c.name as contractor_name,
        e.name as employee_name,
        s.name as service_name
      FROM appointments a
      JOIN users u ON a.created_by = u.id
      LEFT JOIN contractors c ON a.contractor_id = c.id
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (start && end) {
      query += " AND start_time >= ? AND end_time <= ?";
      params.push(start, end);
    }

    if (contractorId) {
      query += " AND a.contractor_id = ?";
      params.push(contractorId);
    }

    if (employeeId) {
      query += " AND a.employee_id = ?";
      params.push(employeeId);
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

    // Check for overlapping appointments for the same contractor/employee
    if (validatedData.contractorId || validatedData.employeeId) {
      const query = `
        SELECT COUNT(*) as count
        FROM appointments
        WHERE (
          (contractor_id = ? AND ? IS NOT NULL)
          OR 
          (employee_id = ? AND ? IS NOT NULL)
        )
        AND (
          (start_time <= ? AND end_time > ?)
          OR
          (start_time < ? AND end_time >= ?)
          OR
          (start_time >= ? AND end_time <= ?)
        )
      `;

      const overlap = db
        .prepare(query)
        .get(
          validatedData.contractorId,
          validatedData.contractorId,
          validatedData.employeeId,
          validatedData.employeeId,
          validatedData.endTime,
          validatedData.startTime,
          validatedData.endTime,
          validatedData.startTime,
          validatedData.startTime,
          validatedData.endTime
        ) as { count: number };

      if (overlap.count > 0) {
        return NextResponse.json(
          { error: "Time slot is already booked" },
          { status: 400 }
        );
      }
    }

    const result = db
      .prepare(
        `INSERT INTO appointments (
          title,
          start_time,
          end_time,
          notes,
          created_by,
          contractor_id,
          employee_id,
          client_name,
          service_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        validatedData.title,
        validatedData.startTime,
        validatedData.endTime,
        validatedData.notes || "",
        auth.userId,
        validatedData.contractorId || null,
        validatedData.employeeId || null,
        validatedData.clientName || null,
        validatedData.serviceId || null
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
