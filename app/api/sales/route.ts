import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    const sales = db
      .prepare(
        `SELECT 
          s.id,
          s.date_sold,
          COALESCE(p.name, srv.name) as item_name,
          CASE 
            WHEN p.id IS NOT NULL THEN 'Product'
            ELSE 'Service'
          END as type,
          s.quantity,
          s.total_value,
          s.net_profit
        FROM sales_history s
        LEFT JOIN products p ON s.product_id = p.id
        LEFT JOIN services srv ON s.service_id = srv.id
        ORDER BY s.date_sold DESC
        LIMIT ? OFFSET ?`
      )
      .all(limit, offset) as any[];

    const total = db
      .prepare("SELECT COUNT(*) as count FROM sales_history")
      .get() as { count: number };

    return NextResponse.json({
      sales,
      total: total.count,
    });
  } catch (error) {
    console.error("Failed to fetch sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { products, services } = body;

    // Get contractor ID if any service has one
    const contractorId = services.find((s) => s.contractorId)?.contractorId;

    db.transaction(() => {
      let totalContractorEarnings = 0;

      // Process products
      for (const item of products) {
        const product = db
          .prepare("SELECT * FROM products WHERE id = ?")
          .get(item.productId) as any;

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        // Calculate product commission if there's a contractor
        let contractorEarnings = 0;
        if (contractorId && product.commissionPercentage > 0) {
          contractorEarnings =
            product.outboundPrice *
            item.quantity *
            (product.commissionPercentage / 100);
          totalContractorEarnings += contractorEarnings;
        }

        // Update product quantity
        db.prepare(
          "UPDATE products SET quantity = quantity - ? WHERE id = ?"
        ).run(item.quantity, item.productId);

        // Create sale record
        db.prepare(
          `INSERT INTO sales_history (
            product_id,
            quantity,
            inbound_price_per_unit,
            outbound_price_per_unit,
            total_value,
            net_profit,
            contractor_id,
            contractor_earnings,
            date_sold
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(
          item.productId,
          item.quantity,
          product.inboundPrice,
          product.outboundPrice,
          product.outboundPrice * item.quantity,
          (product.outboundPrice - product.inboundPrice) * item.quantity,
          contractorId,
          contractorEarnings
        );
      }

      // Process services
      for (const item of services) {
        const service = db
          .prepare("SELECT * FROM services WHERE id = ?")
          .get(item.serviceId) as any;

        if (!service) {
          throw new Error(`Service not found: ${item.serviceId}`);
        }

        // Calculate earnings
        const totalValue = service.base_price;
        let businessEarnings = totalValue;
        let contractorEarnings = 0;

        // If contractor is assigned, calculate their earnings
        if (item.contractorId) {
          const contractor = db
            .prepare(
              "SELECT location_fee_percentage FROM contractors WHERE id = ?"
            )
            .get(item.contractorId) as any;

          if (contractor) {
            const locationFee =
              totalValue * (contractor.location_fee_percentage / 100);
            contractorEarnings = totalValue - locationFee;
            businessEarnings = locationFee;
            totalContractorEarnings += contractorEarnings;
          }
        }

        // Create service sale record
        db.prepare(
          `INSERT INTO sales_history (
            service_id,
            contractor_id,
            total_value,
            net_profit,
            contractor_earnings,
            date_sold
          ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(
          item.serviceId,
          item.contractorId || null,
          totalValue,
          businessEarnings,
          contractorEarnings
        );

        // Create service history record
        db.prepare(
          `INSERT INTO services_history (
            service_id,
            contractor_id,
            price_charged,
            business_earnings,
            contractor_earnings,
            date_performed
          ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(
          item.serviceId,
          item.contractorId || null,
          totalValue,
          businessEarnings,
          contractorEarnings
        );
      }

      // Update contractor's accumulated commission
      if (contractorId && totalContractorEarnings > 0) {
        db.prepare(
          "UPDATE contractors SET accumulated_commission = accumulated_commission + ? WHERE id = ?"
        ).run(totalContractorEarnings, contractorId);
      }
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create sale:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
