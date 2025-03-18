import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const offset = (page - 1) * limit;

    let orderBy = 'name';
    switch (sortBy) {
      case 'sku':
        orderBy = 'sku';
        break;
      case 'quantity':
        orderBy = 'quantity DESC';
        break;
      case 'lastUpdated':
        orderBy = 'lastUpdated DESC';
        break;
    }

    const products = db
      .prepare(
        `SELECT *
        FROM products
        WHERE name LIKE ? OR sku LIKE ?
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?`
      )
      .all(
        `%${search}%`,
        `%${search}%`,
        limit,
        offset
      ) as any[];

    const total = db
      .prepare(
        'SELECT COUNT(*) as count FROM products WHERE name LIKE ? OR sku LIKE ?'
      )
      .get(`%${search}%`, `%${search}%`) as { count: number };

    return NextResponse.json({
      products,
      total: total.count,
    });
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}