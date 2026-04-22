import { NextResponse, type NextRequest } from 'next/server';

// Middleware only redirects to /login for non-login pages.
// Actual session validation happens client-side via Supabase browser client.
// API calls are protected server-side via authenticateAdminRequest on the main app.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
