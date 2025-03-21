import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if service exists
    const service = db
      .prepare("SELECT * FROM services WHERE id = ?")
      .get(params.id) as any;

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Delete the service
    db.prepare("DELETE FROM services WHERE id = ?").run(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
