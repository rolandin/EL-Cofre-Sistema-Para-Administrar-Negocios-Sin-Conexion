import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const records = db
      .prepare(
        `SELECT 
          r.id,
          p.name as product_name,
          r.quantity,
          r.return_amount,
          r.date_returned
        FROM returns_history r
        JOIN products p ON r.product_id = p.id
        ORDER BY r.date_returned DESC
        LIMIT ? OFFSET ?`
      )
      .all(limit, offset) as any[];

    const total = db
      .prepare("SELECT COUNT(*) as count FROM returns_history")
      .get() as { count: number };

    return NextResponse.json({
      records,
      total: total.count,
    });
  } catch (error) {
    console.error("Failed to fetch return history:", error);
    return NextResponse.json(
      { error: "Failed to fetch return history" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity, returnAmount } = body;

    if (!productId || quantity < 1 || returnAmount < 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Verify product exists and return amount doesn't exceed original price
    const product = db
      .prepare("SELECT outboundPrice FROM products WHERE id = ?")
      .get(productId) as { outboundPrice: number } | undefined;

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (returnAmount > product.outboundPrice) {
      return NextResponse.json(
        { error: "Return amount cannot exceed original price" },
        { status: 400 }
      );
    }

    db.transaction(() => {
      // Create return record
      db.prepare(
        `INSERT INTO returns_history (
          product_id,
          quantity,
          return_amount,
          date_returned
        ) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
      ).run(productId, quantity, returnAmount);

      // Update product quantity
      db.prepare(
        `UPDATE products 
        SET quantity = quantity + ?,
            lastUpdated = CURRENT_TIMESTAMP
        WHERE id = ?`
      ).run(quantity, productId);
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process return:", error);
    return NextResponse.json(
      { error: "Failed to process return" },
      { status: 500 }
    );
  }
}
