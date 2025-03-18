import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    // Get unique products that have been sold
    const products = db
      .prepare(
        `SELECT DISTINCT 
          p.id,
          p.name,
          p.sku,
          p.outboundPrice
        FROM products p
        INNER JOIN sales_history sh ON p.id = sh.product_id
        WHERE sh.product_id IS NOT NULL
        ORDER BY p.name`
      )
      .all() as any[];

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch sold products:", error);
    return NextResponse.json(
      { error: "Failed to fetch sold products" },
      { status: 500 }
    );
  }
}
