import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    // Calculate inventory value and potential value
    const inventoryMetrics = db
      .prepare(
        `SELECT 
          SUM(quantity * inboundPrice) as inventoryValue,
          SUM(quantity * outboundPrice) as potentialValue
        FROM products`
      )
      .get() as { inventoryValue: number; potentialValue: number };

    // Calculate total sales and net profit (including both products and services)
    const salesMetrics = db
      .prepare(
        `SELECT 
          SUM(total_value) as totalSales,
          SUM(net_profit) as netProfit
        FROM sales_history`
      )
      .get() as { totalSales: number; netProfit: number };

    // Calculate total returns value
    const returnsValue = db
      .prepare(
        `SELECT 
          SUM(r.quantity * r.return_amount) as totalReturns
        FROM returns_history r`
      )
      .get() as { totalReturns: number };

    return NextResponse.json({
      inventoryValue: inventoryMetrics.inventoryValue || 0,
      potentialValue: inventoryMetrics.potentialValue || 0,
      totalSales: salesMetrics.totalSales || 0,
      netProfit: salesMetrics.netProfit || 0,
      totalReturns: returnsValue.totalReturns || 0,
    });
  } catch (error) {
    console.error("Failed to fetch metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
