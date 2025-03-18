import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const records = db
      .prepare(
        `SELECT 
          sh.id,
          s.name as service_name,
          sh.price_charged,
          sh.contractor_earnings,
          sh.business_earnings,
          sh.date_performed,
          sh.notes
        FROM services_history sh
        JOIN services s ON sh.service_id = s.id
        WHERE sh.contractor_id = ?
        ORDER BY sh.date_performed DESC
        LIMIT ? OFFSET ?`
      )
      .all(params.id, limit, offset) as any[];

    const total = db
      .prepare(
        "SELECT COUNT(*) as count FROM services_history WHERE contractor_id = ?"
      )
      .get(params.id) as { count: number };

    return NextResponse.json({
      records,
      total: total.count,
    });
  } catch (error) {
    console.error("Failed to fetch contractor service history:", error);
    return NextResponse.json(
      { error: "Failed to fetch contractor service history" },
      { status: 500 }
    );
  }
}
