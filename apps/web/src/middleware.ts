import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/login', '/'];
const protectedPaths = ['/dashboard', '/inbox', '/tickets', '/reports', '/demo'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  // Se tem token e está tentando acessar login, redireciona para dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Se não tem token e está tentando acessar rota protegida, redireciona para login
  if (!token && protectedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
