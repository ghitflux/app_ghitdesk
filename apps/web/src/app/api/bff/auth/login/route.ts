import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      return NextResponse.json(
        { error: error.detail || 'Login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Copiar cookies do backend para o frontend
    const setCookieHeader = response.headers.get('set-cookie');
    const result = NextResponse.json(data);

    if (setCookieHeader) {
      // Parse múltiplos cookies
      const cookies = setCookieHeader.split(',').map(c => c.trim());
      cookies.forEach(cookie => {
        result.headers.append('set-cookie', cookie);
      });
    }

    return result;
  } catch (error) {
    console.error('BFF Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
