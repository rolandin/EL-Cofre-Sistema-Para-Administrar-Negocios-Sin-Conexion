import { NextResponse } from 'next/server';
import { checkFirstRun } from '@/lib/auth';

export async function GET() {
  try {
    const isFirstRun = await checkFirstRun();
    return NextResponse.json({ isFirstRun });
  } catch (error) {
    console.error('Failed to check setup status:', error);
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
}