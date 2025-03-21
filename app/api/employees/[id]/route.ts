import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const employeeUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    position: z.string().min(1).optional(),
    salary: z.number().nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If is_active is present, other fields are optional
      if ("is_active" in data) return true;
      // Otherwise, at least one other field must be present
      return "name" in data || "position" in data || "salary" in data;
    },
    {
      message: "At least one field must be provided for update",
      path: ["name", "position", "salary", "is_active"],
    }
  );

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = employeeUpdateSchema.parse(body);

    const employee = db
      .prepare("SELECT id FROM employees WHERE id = ?")
      .get(params.id);

    if (!employee) {
      return NextResponse.json(
        {
          error: "Employee not found",
          details: "employeeNotFound",
        },
        { status: 404 }
      );
    }

    // If updating active status
    if ("is_active" in validatedData) {
      // Check if employee has any pending payments
      const pendingPayments = db
        .prepare(
          `SELECT COUNT(*) as count 
           FROM employee_payments 
           WHERE employee_id = ? 
           AND payment_date >= date('now', '-30 days')`
        )
        .get(params.id) as { count: number };

      if (pendingPayments.count > 0 && !validatedData.is_active) {
        return NextResponse.json(
          {
            error: "Cannot deactivate employee with pending payments",
            details: "pendingPayments",
          },
          { status: 400 }
        );
      }

      // Check if employee has any upcoming appointments
      const upcomingAppointments = db
        .prepare(
          `SELECT COUNT(*) as count 
           FROM appointments 
           WHERE employee_id = ? 
           AND start_time >= datetime('now')`
        )
        .get(params.id) as { count: number };

      if (upcomingAppointments.count > 0 && !validatedData.is_active) {
        return NextResponse.json(
          {
            error: "Cannot deactivate employee with upcoming appointments",
            details: "upcomingAppointments",
          },
          { status: 400 }
        );
      }

      db.prepare("UPDATE employees SET is_active = ? WHERE id = ?").run(
        validatedData.is_active ? 1 : 0,
        params.id
      );
      return NextResponse.json({ success: true });
    }

    // Regular employee update
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if ("name" in validatedData) {
      updateFields.push("name = ?");
      updateValues.push(validatedData.name);
    }
    if ("position" in validatedData) {
      updateFields.push("position = ?");
      updateValues.push(validatedData.position);
    }
    if ("salary" in validatedData) {
      updateFields.push("salary = ?");
      updateValues.push(validatedData.salary ?? null);
    }

    if (updateFields.length > 0) {
      updateValues.push(params.id);
      db.prepare(
        `UPDATE employees SET ${updateFields.join(", ")} WHERE id = ?`
      ).run(...updateValues);
    }

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
