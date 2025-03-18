import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get service earnings
    const serviceEarnings = db
      .prepare(
        `SELECT 
          COUNT(*) as total_services,
          COALESCE(SUM(contractor_earnings), 0) as service_earnings
        FROM services_history
        WHERE contractor_id = ?`
      )
      .get(params.id) as { total_services: number; service_earnings: number };

    // Get product commissions
    const productCommissions = db
      .prepare(
        `SELECT 
          COUNT(DISTINCT sh.id) as total_products,
          COALESCE(SUM(sh.total_value * (p.commissionPercentage / 100)), 0) as product_commissions
        FROM sales_history sh
        JOIN products p ON sh.product_id = p.id
        WHERE sh.contractor_id = ? AND sh.product_id IS NOT NULL`
      )
      .get(params.id) as {
      total_products: number;
      product_commissions: number;
    };

    return NextResponse.json({
      service_earnings: serviceEarnings.service_earnings,
      product_commissions: productCommissions.product_commissions,
      total_services: serviceEarnings.total_services,
      total_products: productCommissions.total_products,
    });
  } catch (error) {
    console.error("Failed to fetch contractor earnings:", error);
    return NextResponse.json(
      { error: "Failed to fetch contractor earnings" },
      { status: 500 }
    );
  }
}
