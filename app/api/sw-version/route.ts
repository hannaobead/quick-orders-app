import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ version: process.env.BUILD_ID ?? Date.now().toString() });
}
