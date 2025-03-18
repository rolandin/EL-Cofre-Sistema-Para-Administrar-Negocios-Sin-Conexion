import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const statusSchema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = statusSchema.parse(body);

    const user = db
      .prepare('SELECT role FROM users WHERE id = ?')
      .get(params.id) as { role: string } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role === 'superadmin') {
      return NextResponse.json(
        { error: 'Cannot modify superadmin status' },
        { status: 403 }
      );
    }

    db.prepare('UPDATE users SET isActive = ? WHERE id = ?')
      .run(validatedData.isActive ? 1 : 0, params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update user status:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid status data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}