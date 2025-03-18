import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const businessSettingsSchema = z.object({
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email(),
  taxId: z.string(),
  defaultCommission: z.number().min(0).max(100),
  defaultLocationFee: z.number().min(0).max(100),
  notes: z.string(),
});

export async function GET() {
  try {
    const settings = db
      .prepare('SELECT * FROM business_settings LIMIT 1')
      .get() as any;

    return NextResponse.json(settings || {
      name: '',
      address: '',
      phone: '',
      email: '',
      taxId: '',
      defaultCommission: 0,
      defaultLocationFee: 0,
      notes: '',
    });
  } catch (error) {
    console.error('Failed to fetch business settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validatedData = businessSettingsSchema.parse(body);

    const exists = db
      .prepare('SELECT COUNT(*) as count FROM business_settings')
      .get() as { count: number };

    if (exists.count === 0) {
      db.prepare(
        `INSERT INTO business_settings (
          name,
          address,
          phone,
          email,
          taxId,
          defaultCommission,
          defaultLocationFee,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        validatedData.name,
        validatedData.address,
        validatedData.phone,
        validatedData.email,
        validatedData.taxId,
        validatedData.defaultCommission,
        validatedData.defaultLocationFee,
        validatedData.notes
      );
    } else {
      db.prepare(
        `UPDATE business_settings SET
          name = ?,
          address = ?,
          phone = ?,
          email = ?,
          taxId = ?,
          defaultCommission = ?,
          defaultLocationFee = ?,
          notes = ?`
      ).run(
        validatedData.name,
        validatedData.address,
        validatedData.phone,
        validatedData.email,
        validatedData.taxId,
        validatedData.defaultCommission,
        validatedData.defaultLocationFee,
        validatedData.notes
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update business settings:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update business settings' },
      { status: 500 }
    );
  }
}