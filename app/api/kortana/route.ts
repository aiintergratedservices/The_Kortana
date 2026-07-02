import { NextResponse } from 'next/server';
import { buildKortanaReply } from '../../../lib/kortana';

export async function POST(request: Request) {
  try {
    const { message, history = [] } = await request.json();
    const reply = buildKortanaReply(message ?? '', history);

    return NextResponse.json({
      ok: true,
      reply,
      presence: 'online',
      available: true,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Unable to reach Kortana right now.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: 'Kortana backend is online',
    presence: 'online',
  });
}
