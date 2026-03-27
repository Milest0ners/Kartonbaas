import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_AUTH_COOKIE, getAdminPassword } from '@/lib/admin-auth';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const expectedPassword = getAdminPassword();
  const authCookie = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  const isAuthenticated = Boolean(expectedPassword) && authCookie === expectedPassword;

  const isAdminLogin = pathname === '/admin/login';
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  if (isAdminLogin && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/orders', request.url));
  }

  if ((isAdminRoute || isAdminApiRoute) && !isAdminLogin && !isAuthenticated) {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const redirectUrl = new URL('/admin/login', request.url);
    if (pathname !== '/admin') {
      redirectUrl.searchParams.set('next', `${pathname}${search}`);
    }
    if (!expectedPassword) {
      redirectUrl.searchParams.set('error', 'config');
    }
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

