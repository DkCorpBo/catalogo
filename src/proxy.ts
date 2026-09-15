import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const cookieSession = request.cookies.get('tienda_session');

  let sessionUser = null;
  if (cookieSession?.value) {
    try {
      sessionUser = JSON.parse(decodeURIComponent(cookieSession.value));
    } catch {
      // Sesión inválida
    }
  }

  const isAuthenticated = !!sessionUser;
  const isSuperAdmin = sessionUser?.rol === 'superadmin';

  // 1. Proteger rutas administrativas (/admin/* y /superadmin/*) si no hay sesión
  if (!isAuthenticated) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Si está autenticado
  if (isAuthenticated) {
    // Si intenta ir a /login teniendo sesión activa, mandarlo a su panel correspondiente
    if (pathname === '/login') {
      const targetPath = isSuperAdmin ? '/superadmin' : '/admin';
      return NextResponse.redirect(new URL(targetPath, request.url));
    }

    // Proteger /superadmin para que solo lo vea un superadmin
    if (pathname.startsWith('/superadmin') && !isSuperAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/superadmin/:path*', '/login'],
};
