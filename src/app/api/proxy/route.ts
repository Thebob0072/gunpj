import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const groupId = searchParams.get('groupId');

  try {
    if (type === 'line-groups') {
      // Fetch LINE groups from backend
      const response = await fetch(`${API_BASE_URL}/line-groups`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch LINE groups');
      const data = await response.json();
      return NextResponse.json(data.groups || []);
    }

    if (type === 'line-members' && groupId) {
      // Fetch LINE group members
      const response = await fetch(`${API_BASE_URL}/line-group-members/${groupId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch members');
      return NextResponse.json(await response.json());
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
