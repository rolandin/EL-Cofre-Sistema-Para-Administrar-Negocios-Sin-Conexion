import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const paymentSchema = z.object({
  employeeId: z.number().positive(),
  amount: z.number().positive(),
  periodStart: z.string(),
  periodEnd: z.string(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const payments = db
      .prepare(
        `SELECT 
          p.id,
          e.name as employee_name,
          p.payment_amount,
          p.payment_date,
          p.payment_period_start,
          p.payment_period_end
        FROM employee_payments p
        JOIN employees e ON p.employee_id = e.id
        ORDER BY p.payment_date DESC
        LIMIT ? OFFSET ?`
      )
      .all(limit, offset) as any[];

    const total = db
      .prepare('SELECT COUNT(*) as count FROM employee_payments')
      .get() as { count: number };

    return NextResponse.json({
      payments,
      total: total.count,
    });
  } catch (error) {
    console.error('Failed to fetch employee payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    const result = db
      .prepare(
        `INSERT INTO employee_payments (
          employee_id,
          payment_amount,
          payment_date,
          payment_period_start,
          payment_period_end
        ) VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?)`
      )
      .run(
        validatedData.employeeId,
        validatedData.amount,
        validatedData.periodStart,
        validatedData.periodEnd
      );

    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Failed to create employee payment:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payment data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create employee payment' },
      { status: 500 }
    );
  }
}