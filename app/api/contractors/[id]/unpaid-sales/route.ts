import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get unpaid service sales
    const unpaidServices = db
      .prepare(
        `SELECT 
          sh.id,
          s.name as service_name,
          sh.date_performed,
          sh.price_charged,
          sh.contractor_earnings
        FROM services_history sh
        JOIN services s ON sh.service_id = s.id
        LEFT JOIN contractor_payments cp ON sh.id = cp.sale_id
        WHERE sh.contractor_id = ? AND cp.id IS NULL
        ORDER BY sh.date_performed DESC`
      )
      .all(params.id) as any[];

    // Get unpaid product sales with commission
    const unpaidProducts = db
      .prepare(
        `SELECT 
          sh.id,
          p.name as service_name,
          sh.date_sold as date_performed,
          sh.total_value as price_charged,
          sh.total_value * (p.commissionPercentage / 100) as contractor_earnings
        FROM sales_history sh
        JOIN products p ON sh.product_id = p.id
        LEFT JOIN contractor_payments cp ON sh.id = cp.sale_id
        WHERE sh.contractor_id = ? AND sh.product_id IS NOT NULL AND cp.id IS NULL
        ORDER BY sh.date_sold DESC`
      )
      .all(params.id) as any[];

    // Combine and sort by date
    const allUnpaidSales = [...unpaidServices, ...unpaidProducts].sort(
      (a, b) =>
        new Date(b.date_performed).getTime() -
        new Date(a.date_performed).getTime()
    );

    return NextResponse.json(allUnpaidSales);
  } catch (error) {
    console.error("Failed to fetch unpaid sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch unpaid sales" },
      { status: 500 }
    );
  }
}
