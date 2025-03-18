import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
        { error: 'Cannot delete superadmin' },
        { status: 403 }
      );
    }

    db.prepare('DELETE FROM users WHERE id = ?')
      .run(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}