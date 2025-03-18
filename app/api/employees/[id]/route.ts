import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const employeeUpdateSchema = z.object({
  name: z.string().min(1),
  position: z.string().min(1),
  salary: z.number().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = employeeUpdateSchema.parse(body);

    console.log("Validated Data:", validatedData);

    const employee = db
      .prepare("SELECT id FROM employees WHERE id = ?")
      .get(params.id);

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    db.prepare(
      `UPDATE employees SET
        name = ?,
        position = ?,
        salary = ?
      WHERE id = ?`
    ).run(
      validatedData.name,
      validatedData.position,
      validatedData.salary ?? null,
      params.id
    );

    const updatedEmployee = db
      .prepare("SELECT * FROM employees WHERE id = ?")
      .get(params.id);

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Failed to update employee:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid employee data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employee = db
      .prepare("SELECT * FROM employees WHERE id = ?")
      .get(params.id) as any;

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const paymentHistory = db
      .prepare(
        "SELECT COUNT(*) as count FROM employee_payments WHERE employee_id = ?"
      )
      .get(params.id) as { count: number };

    if (paymentHistory.count > 0) {
      return NextResponse.json(
        { error: "Cannot delete employee with payment history" },
        { status: 400 }
      );
    }

    db.transaction(() => {
      if (employee.contractor_id) {
        const contractorExists = db
          .prepare("SELECT id FROM contractors WHERE id = ?")
          .get(employee.contractor_id);
        if (contractorExists) {
          db.prepare("DELETE FROM contractors WHERE id = ?").run(
            employee.contractor_id
          );
        }
      }

      db.prepare("DELETE FROM employees WHERE id = ?").run(params.id);

      const userExists = db
        .prepare("SELECT id FROM users WHERE employee_id = ?")
        .get(params.id);
      if (userExists) {
        db.prepare("DELETE FROM users WHERE employee_id = ?").run(params.id);
      }
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
