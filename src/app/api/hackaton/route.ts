import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ─── GET /api/hackaton               → list all sessions (with stats)
// ─── GET /api/hackaton?sessionId=xxx → session + items
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  try {
    if (!sessionId) {
      const res = await fetch(`${API_BASE}/hackaton-budget/sessions`, { cache: 'no-store' });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    const res = await fetch(`${API_BASE}/hackaton-budget?sessionId=${sessionId}`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// ─── POST /api/hackaton
//   _target: 'new-session' → create session
//   _target: 'session'     → update session metadata
//   (default)              → create budget item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const target = body._target;

    if (target === 'new-session') {
      const res = await fetch(`${API_BASE}/hackaton-budget/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    if (target === 'session') {
      const res = await fetch(`${API_BASE}/hackaton-budget/session`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    // default: create budget item
    const res = await fetch(`${API_BASE}/hackaton-budget/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// ─── PUT /api/hackaton  (update budget item by id)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const res = await fetch(`${API_BASE}/hackaton-budget/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rest),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// ─── DELETE /api/hackaton?id=xxx        → delete budget item
// ─── DELETE /api/hackaton?sessionId=xxx → delete session + all items
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  try {
    if (sessionId) {
      const res = await fetch(`${API_BASE}/hackaton-budget/sessions/${sessionId}`, { method: 'DELETE' });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    if (id) {
      const res = await fetch(`${API_BASE}/hackaton-budget/items/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json({ error: 'id or sessionId required' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
