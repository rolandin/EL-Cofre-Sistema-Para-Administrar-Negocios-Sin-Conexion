import { NextResponse } from 'next/server';
import { checkFirstRun, createSuperAdmin } from '@/lib/auth';
import { z } from 'zod';

const setupSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    // Check if this is first run
    const isFirstRun = await checkFirstRun();
    if (!isFirstRun) {
      return NextResponse.json(
        { error: 'Setup already completed' },
        { status: 400 }
      );
    }

    // Validate input data
    const body = await request.json();
    const validatedData = setupSchema.parse(body);

    // Create superadmin account
    await createSuperAdmin(validatedData.username, validatedData.password);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Setup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create super admin account'
      },
      { status: 500 }
    );
  }
}