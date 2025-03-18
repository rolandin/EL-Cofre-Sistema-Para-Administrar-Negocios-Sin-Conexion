import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.number().min(0),
  commissionPercentage: z.number().min(0).max(100),
});

export async function GET() {
  try {
    const services = db
      .prepare('SELECT * FROM services ORDER BY name')
      .all() as any[];

    return NextResponse.json(services);
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = serviceSchema.parse(body);

    const result = db
      .prepare(
        `INSERT INTO services (
          name,
          description,
          base_price,
          commission_percentage
        ) VALUES (?, ?, ?, ?)`
      )
      .run(
        validatedData.name,
        validatedData.description || '',
        validatedData.basePrice,
        validatedData.commissionPercentage
      );

    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Failed to create service:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid service data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}