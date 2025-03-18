import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  salary: z.number().min(0).nullable(),
});

export async function GET() {
  try {
    const employees = db
      .prepare(
        `SELECT 
          e.*,
          c.name as contractor_name,
          c.location_fee_percentage
        FROM employees e
        LEFT JOIN contractors c ON e.contractor_id = c.id
        ORDER BY e.name`
      )
      .all() as any[];

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = employeeSchema.parse(body);

    // Check if employee name already exists
    const existing = db
      .prepare("SELECT id FROM employees WHERE name = ?")
      .get(validatedData.name);

    if (existing) {
      return NextResponse.json(
        { error: "An employee with this name already exists" },
        { status: 400 }
      );
    }

    // Start a transaction to create employee and contractor records
    db.transaction(() => {
      // Create contractor record with 100% location fee
      const contractorResult = db
        .prepare(
          `INSERT INTO contractors (
            name,
            location_fee_percentage
          ) VALUES (?, 100)`
        )
        .run(validatedData.name);

      // Create employee record
      const employeeResult = db
        .prepare(
          `INSERT INTO employees (
            name,
            position,
            salary,
            contractor_id
          ) VALUES (?, ?, ?, ?)`
        )
        .run(
          validatedData.name,
          validatedData.position,
          validatedData.salary,
          contractorResult.lastInsertRowid
        );

      return employeeResult.lastInsertRowid;
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create employee:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid employee data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
