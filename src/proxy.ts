import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_HOME = '/dashboard';
const SUPERVISOR_HOME = '/mis-obras';

// URL prefixes owned exclusively by each role
const ADMIN_PATHS = ['/dashboard', '/obras', '/usuarios'];
const SUPERVISOR_PATHS = ['/mis-obras'];

function isUnder(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // ── Unauthenticated ──────────────────────────────────────────────────────────
  if (!token) {
    if (pathname === '/login') return NextResponse.next();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const role = token.role;
  const roleHome = new URL(role === 'ADMIN' ? ADMIN_HOME : SUPERVISOR_HOME, request.url);

  // ── Authenticated: neutral routes → role home ────────────────────────────────
  if (pathname === '/' || pathname === '/login') {
    return NextResponse.redirect(roleHome);
  }

  // ── Authenticated: enforce role boundaries ───────────────────────────────────
  if (isUnder(pathname, ADMIN_PATHS) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(SUPERVISOR_HOME, request.url));
  }

  if (isUnder(pathname, SUPERVISOR_PATHS) && role !== 'SUPERVISOR') {
    return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/obras/:path*',
    '/usuarios/:path*',
    '/mis-obras/:path*',
  ],
};
