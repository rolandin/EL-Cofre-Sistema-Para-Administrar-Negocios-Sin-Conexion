import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const paymentSchema = z.object({
  contractorId: z.number().positive(),
  saleIds: z.array(z.number().positive()),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const payments = db
      .prepare(
        `SELECT 
          cp.id,
          c.name as contractor_name,
          COALESCE(s.name, p.name) as service_name,
          cp.contractor_earnings,
          cp.business_earnings,
          cp.payment_date
        FROM contractor_payments cp
        JOIN contractors c ON cp.contractor_id = c.id
        JOIN sales_history sh ON cp.sale_id = sh.id
        LEFT JOIN services s ON sh.service_id = s.id
        LEFT JOIN products p ON sh.product_id = p.id
        ORDER BY cp.payment_date DESC
        LIMIT ? OFFSET ?`
      )
      .all(limit, offset) as any[];

    const total = db
      .prepare("SELECT COUNT(*) as count FROM contractor_payments")
      .get() as { count: number };

    return NextResponse.json({
      payments,
      total: total.count,
    });
  } catch (error) {
    console.error("Failed to fetch contractor payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch contractor payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    db.transaction(() => {
      // Process service sales
      const serviceSales = db
        .prepare(
          `SELECT 
            sh.id,
            sh.contractor_earnings,
            sh.business_earnings
          FROM services_history sh
          WHERE sh.id IN (${validatedData.saleIds.join(",")})
          AND sh.contractor_id = ?`
        )
        .all(validatedData.contractorId) as any[];

      // Process product sales
      const productSales = db
        .prepare(
          `SELECT 
            sh.id,
            sh.total_value * (p.commissionPercentage / 100) as contractor_earnings,
            sh.total_value * (1 - p.commissionPercentage / 100) as business_earnings
          FROM sales_history sh
          JOIN products p ON sh.product_id = p.id
          WHERE sh.id IN (${validatedData.saleIds.join(",")})
          AND sh.contractor_id = ?`
        )
        .all(validatedData.contractorId) as any[];

      // Calculate total earnings
      let totalEarnings = 0;

      // Create payment records for service sales
      for (const sale of serviceSales) {
        totalEarnings += sale.contractor_earnings;

        db.prepare(
          `INSERT INTO contractor_payments (
            contractor_id,
            sale_id,
            contractor_earnings,
            business_earnings,
            payment_date
          ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(
          validatedData.contractorId,
          sale.id,
          sale.contractor_earnings,
          sale.business_earnings
        );
      }

      // Create payment records for product sales
      for (const sale of productSales) {
        totalEarnings += sale.contractor_earnings;

        db.prepare(
          `INSERT INTO contractor_payments (
            contractor_id,
            sale_id,
            contractor_earnings,
            business_earnings,
            payment_date
          ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(
          validatedData.contractorId,
          sale.id,
          sale.contractor_earnings,
          sale.business_earnings
        );
      }

      // Reset accumulated commission
      db.prepare(
        "UPDATE contractors SET accumulated_commission = 0 WHERE id = ?"
      ).run(validatedData.contractorId);
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create contractor payment:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payment data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create contractor payment" },
      { status: 500 }
    );
  }
}
