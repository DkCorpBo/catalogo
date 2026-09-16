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

  // 1. Ruta de login de SuperAdmin
  if (pathname === '/superadmin/login') {
    if (isAuthenticated && isSuperAdmin) {
      return NextResponse.redirect(new URL('/superadmin', request.url));
    }
    return NextResponse.next();
  }

  // 2. Proteger rutas /superadmin/* (excepto /superadmin/login)
  if (pathname.startsWith('/superadmin')) {
    if (!isAuthenticated || !isSuperAdmin) {
      const loginUrl = new URL('/superadmin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Proteger rutas de tiendas (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Si ya tiene sesión activa e intenta ir a /login, redirigir a su panel
  if (pathname === '/login' && isAuthenticated) {
    const targetPath = isSuperAdmin ? '/superadmin' : '/admin';
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/superadmin/:path*', '/login'],
};
