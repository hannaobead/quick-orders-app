import { NextRequest, NextResponse } from 'next/server';

const MAIN_API = 'https://momentoprint.app';

async function proxy(req: NextRequest, method: string) {
  const authorization = req.headers.get('authorization') ?? '';
  const body = method !== 'GET' ? await req.text() : undefined;

  const res = await fetch(`${MAIN_API}/api/quick-orders`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    body,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest) { return proxy(req, 'GET'); }
export async function POST(req: NextRequest) { return proxy(req, 'POST'); }
export async function PATCH(req: NextRequest) { return proxy(req, 'PATCH'); }
export async function PUT(req: NextRequest) { return proxy(req, 'PUT'); }
