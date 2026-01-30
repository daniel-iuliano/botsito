
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { decryptSession } from '@/lib/crypto';

export async function POST(req: Request) {
  const token = req.headers.get('Authorization');
  const body = await req.json();

  if (!token || !decryptSession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (body.action === 'START') {
    return NextResponse.json({ success: true, status: 'RUNNING', startTime: Date.now() });
  } else {
    return NextResponse.json({ success: true, status: 'OFF', endTime: Date.now() });
  }
}
