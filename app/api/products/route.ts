import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  inboundPrice: z.number().min(0),
  outboundPrice: z.number().min(0),
  supplier: z.string().optional(),
  commissionPercentage: z.number().min(0).max(100),
  quantity: z.number().min(0),
});

export async function GET() {
  try {
    const products = db
      .prepare(
        'SELECT * FROM products ORDER BY name'
      )
      .all() as any[];

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    db.transaction(() => {
      // Create product
      const result = db
        .prepare(
          `INSERT INTO products (
            name,
            sku,
            inboundPrice,
            outboundPrice,
            supplier,
            commissionPercentage,
            quantity,
            lastUpdated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        )
        .run(
          validatedData.name,
          validatedData.sku,
          validatedData.inboundPrice,
          validatedData.outboundPrice,
          validatedData.supplier || '',
          validatedData.commissionPercentage,
          validatedData.quantity
        );

      // If initial quantity > 0, create receive record
      if (validatedData.quantity > 0) {
        db.prepare(
          `INSERT INTO receiving_history (
            product_id,
            quantity,
            price_per_unit,
            date_received
          ) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(
          result.lastInsertRowid,
          validatedData.quantity,
          validatedData.inboundPrice
        );
      }
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to create product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid product data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}