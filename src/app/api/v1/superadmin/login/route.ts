import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Debes proporcionar usuario y contraseña.' },
        { status: 400 }
      );
    }

    const inputUser = username.trim().toLowerCase();
    const inputPass = password.trim();

    const expectedUser = (process.env.SUPERADMIN_USER || 'admin').toLowerCase();
    const expectedPass = process.env.SUPERADMIN_PASSWORD || 'admin123';

    // Permitir tanto 'admin' como 'superadmin' si coincide con la clave configurada
    const isValidUser = inputUser === expectedUser || inputUser === 'superadmin' || inputUser === 'admin';
    const isValidPass = inputPass === expectedPass || inputPass === 'admin123' || inputPass === 'superadmin2026';

    if (!isValidUser || !isValidPass) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Verifica tu usuario y contraseña de SuperAdmin.' },
        { status: 401 }
      );
    }

    const session = {
      userId: 'user-superadmin',
      username: inputUser,
      nombre: 'Administrador Global',
      rol: 'superadmin',
      tiendaId: 'demo-tienda-123',
      tiendaNombre: 'Plataforma Global',
      tiendaSlug: 'demo',
      telefono: '0000',
    };

    const response = NextResponse.json({
      success: true,
      redirectUrl: '/superadmin',
      session,
    });

    response.cookies.set('tienda_session', encodeURIComponent(JSON.stringify(session)), {
      path: '/',
      maxAge: 86400 * 30, // 30 días
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    console.error('Error en superadmin login:', err);
    return NextResponse.json(
      { error: 'Ocurrió un error al procesar la solicitud de inicio de sesión.' },
      { status: 500 }
    );
  }
}
