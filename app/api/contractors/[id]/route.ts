import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  locationFeePercentage: z.number().min(0).max(100),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = db
      .prepare("SELECT * FROM contractors WHERE id = ?")
      .get(params.id) as any;

    if (!contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(contractor);
  } catch (error) {
    console.error("Failed to fetch contractor:", error);
    return NextResponse.json(
      { error: "Failed to fetch contractor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateSchema.parse(body);

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

    // Update contractor
    db.prepare(
      "UPDATE contractors SET location_fee_percentage = ? WHERE id = ?"
    ).run(validatedData.locationFeePercentage, params.id);

    // Fetch and return updated contractor
    const updatedContractor = db
      .prepare("SELECT * FROM contractors WHERE id = ?")
      .get(params.id);

    return NextResponse.json(updatedContractor);
  } catch (error) {
    console.error("Failed to update contractor:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update contractor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if contractor exists
    const contractor = db
      .prepare("SELECT * FROM contractors WHERE id = ?")
      .get(params.id);

    if (!contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    // Check if contractor has any service history
    const serviceHistory = db
      .prepare(
        "SELECT COUNT(*) as count FROM services_history WHERE contractor_id = ?"
      )
      .get(params.id) as { count: number };

    if (serviceHistory.count > 0) {
      return NextResponse.json(
        { error: "Cannot delete contractor with service history" },
        { status: 400 }
      );
    }

    // Check if contractor has any sales history
    const salesHistory = db
      .prepare(
        "SELECT COUNT(*) as count FROM sales_history WHERE contractor_id = ?"
      )
      .get(params.id) as { count: number };

    if (salesHistory.count > 0) {
      return NextResponse.json(
        { error: "Cannot delete contractor with sales history" },
        { status: 400 }
      );
    }

    // Check if contractor has unpaid earnings
    if (contractor.accumulated_commission > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete contractor with unpaid earnings. Process pending payments first.",
        },
        { status: 400 }
      );
    }

    db.transaction(() => {
      // Remove contractor reference from any associated employees
      db.prepare(
        "UPDATE employees SET contractor_id = NULL WHERE contractor_id = ?"
      ).run(params.id);

      // Delete the contractor
      db.prepare("DELETE FROM contractors WHERE id = ?").run(params.id);
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete contractor:", error);
    return NextResponse.json(
      { error: "Failed to delete contractor" },
      { status: 500 }
    );
  }
}
