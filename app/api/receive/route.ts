import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const records = db
      .prepare(
        `SELECT 
          r.id,
          p.name as product_name,
          r.quantity,
          r.price_per_unit,
          r.date_received
        FROM receiving_history r
        JOIN products p ON r.product_id = p.id
        ORDER BY r.date_received DESC
        LIMIT ? OFFSET ?`
      )
      .all(limit, offset) as any[];

    const total = db
      .prepare('SELECT COUNT(*) as count FROM receiving_history')
      .get() as { count: number };

    return NextResponse.json({
      records,
      total: total.count,
    });
  } catch (error) {
    console.error('Failed to fetch receive history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receive history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity, pricePerUnit } = body;

    if (!productId || quantity < 1 || pricePerUnit < 0) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    db.transaction(() => {
      // Create receive record
      db.prepare(
        `INSERT INTO receiving_history (
          product_id,
          quantity,
          price_per_unit,
          date_received
        ) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
      ).run(productId, quantity, pricePerUnit);

      // Update product quantity and price
      db.prepare(
        `UPDATE products 
        SET quantity = quantity + ?,
            inboundPrice = ?,
            lastUpdated = CURRENT_TIMESTAMP
        WHERE id = ?`
      ).run(quantity, pricePerUnit, productId);
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to receive inventory:', error);
    return NextResponse.json(
      { error: 'Failed to receive inventory' },
      { status: 500 }
    );
  }
}