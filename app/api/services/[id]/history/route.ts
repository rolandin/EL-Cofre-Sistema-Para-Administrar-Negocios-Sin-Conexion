import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const records = db
      .prepare(
        `SELECT 
          sh.id,
          c.name as contractor_name,
          sh.client_name,
          sh.price_charged,
          sh.business_earnings,
          sh.contractor_earnings,
          sh.date_performed,
          sh.notes
        FROM services_history sh
        LEFT JOIN contractors c ON sh.contractor_id = c.id
        WHERE sh.service_id = ?
        ORDER BY sh.date_performed DESC
        LIMIT ? OFFSET ?`
      )
      .all(params.id, limit, offset) as any[];

    const total = db
      .prepare(
        'SELECT COUNT(*) as count FROM services_history WHERE service_id = ?'
      )
      .get(params.id) as { count: number };

    return NextResponse.json({
      records,
      total: total.count,
    });
  } catch (error) {
    console.error('Failed to fetch service history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service history' },
      { status: 500 }
    );
  }
}