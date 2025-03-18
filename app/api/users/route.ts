import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const userSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["admin", "controller"]),
});

export async function GET() {
  try {
    // First check if the users table exists
    const tableExists = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
      )
      .get();

    if (!tableExists) {
      return NextResponse.json([]);
    }

    const users = db
      .prepare(
        `SELECT 
          u.id,
          u.username,
          u.role,
          u.lastLogin,
          u.isActive,
          e.name as employee_name,
          e.position as employee_position
        FROM users u
        LEFT JOIN employees e ON u.employee_id = e.id
        WHERE u.role != 'superadmin'
        ORDER BY u.username`
      )
      .all() as any[];

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const hashedPassword = await hashPassword(validatedData.password);

    // Start a transaction to create all related records
    db.transaction(() => {
      // Create employee record
      const employeeResult = db
        .prepare(
          `INSERT INTO employees (
            name,
            position
          ) VALUES (?, ?)`
        )
        .run(
          validatedData.username,
          validatedData.role === "controller" ? "Controller" : "Administrator"
        );

      const employeeId = employeeResult.lastInsertRowid;

      // Create contractor record with 100% location fee
      const contractorResult = db
        .prepare(
          `INSERT INTO contractors (
            name,
            location_fee_percentage
          ) VALUES (?, 100)`
        )
        .run(validatedData.username);

      // Update employee with contractor reference
      db.prepare("UPDATE employees SET contractor_id = ? WHERE id = ?").run(
        contractorResult.lastInsertRowid,
        employeeId
      );

      // Create user record
      const result = db
        .prepare(
          `INSERT INTO users (
            username,
            password,
            role,
            isActive,
            employee_id
          ) VALUES (?, ?, ?, 1, ?)`
        )
        .run(
          validatedData.username,
          hashedPassword,
          validatedData.role,
          employeeId
        );

      return result.lastInsertRowid;
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create user:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid user data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
