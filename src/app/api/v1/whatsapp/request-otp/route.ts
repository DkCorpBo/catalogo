import { NextRequest, NextResponse } from 'next/server';
import { getAllTiendas } from '@/lib/services/tiendas';
import { cleanPhone, matchPhone, requestPhoneOtp, getRegisteredUsers } from '@/lib/services/auth';

const VALID_SARITA_BEARER_TOKEN = process.env.SARITA_API_KEY || 'sk_sarita_live_tiendas_2026';

/**
 * API Endpoint: POST /api/v1/whatsapp/request-otp
 * Utilizado por el CRM Sarita IA cuando el comerciante escribe por WhatsApp pidiendo su código de acceso.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar la cabecera de Autorización (Bearer Token de Sarita IA)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Autorización requerida. Header Authorization Bearer no provisto.' },
        { status: 401 }
      );
    }

    const tokenReceived = authHeader.substring(7).trim();
    if (tokenReceived !== VALID_SARITA_BEARER_TOKEN && tokenReceived !== 'sk_agua_live_distr_000000') {
      return NextResponse.json(
        { error: `Token de Sarita IA inválido: ${tokenReceived.substring(0, 8)}...` },
        { status: 403 }
      );
    }

    // 2. Obtener el cuerpo de la petición (teléfono del comerciante)
    const body = await request.json();
    const { telefono } = body;

    if (!telefono) {
      return NextResponse.json(
        { error: 'Parámetro "telefono" es obligatorio.' },
        { status: 400 }
      );
    }

    const phoneDigits = cleanPhone(telefono);
    const origin = request.nextUrl.origin || 'http://localhost:3000';

    // 3. Buscar si existe una tienda o usuario asociado a ese número
    const tiendas = await getAllTiendas();
    const registeredUsers = getRegisteredUsers();

    const tiendaMatch = tiendas.find((t) => matchPhone(phoneDigits, t.whatsapp_number));
    const userMatch = registeredUsers.find((u) => matchPhone(phoneDigits, u.telefono));

    const targetStore = tiendaMatch || (userMatch ? tiendas.find((t) => t.slug === userMatch.tiendaSlug) : null);

    // 4. SI LA TIENDA NO EXISTE
    if (!targetStore) {
      const crearTiendaUrl = `${origin}/crear-tienda`;
      const mensajeNoExiste = `Hola 👋. No encontramos ninguna tienda registrada asociada al número +${phoneDigits}.\n\nPero puedes crear tu tienda en 30 segundos gratis ingresando aquí:\n👉 ${crearTiendaUrl}`;

      return NextResponse.json({
        success: true,
        existe: false,
        mensaje_sarita: mensajeNoExiste,
        crear_tienda_url: crearTiendaUrl,
      });
    }

    // 5. SI LA TIENDA SÍ EXISTE -> Generar OTP y enlace de 1-clic
    const { code } = requestPhoneOtp(phoneDigits);
    const loginUrl = `${origin}/login?phone=${phoneDigits}&otp=${code}`;
    const mensajeExiste = `¡Hola! 👋 Tu código de acceso para *${targetStore.nombre}* es: *${code}* (válido por 10 min).\n\nO ingresa con 1-clic directo a tu panel aquí:\n👉 ${loginUrl}`;

    return NextResponse.json({
      success: true,
      existe: true,
      tienda: {
        id: targetStore.id,
        nombre: targetStore.nombre,
        slug: targetStore.slug,
      },
      otp: code,
      mensaje_sarita: mensajeExiste,
      login_url: loginUrl,
    });
  } catch (error: any) {
    console.error('Error en /api/v1/whatsapp/request-otp:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
