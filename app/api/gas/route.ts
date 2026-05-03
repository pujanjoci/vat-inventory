import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gasUrl = process.env.NEXT_PUBLIC_GAS_URL;

  if (!gasUrl) {
    return NextResponse.json({ success: false, error: 'GAS URL not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`${gasUrl}?${searchParams.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gasUrl = process.env.NEXT_PUBLIC_GAS_URL;
  const body = await request.json();

  if (!gasUrl) {
    return NextResponse.json({ success: false, error: 'GAS URL not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`${gasUrl}?${searchParams.toString()}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
