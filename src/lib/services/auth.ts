import { RolUsuario } from '../types';
import { getTiendaBySlug, getAllTiendas } from './tiendas';

export interface SesionUsuario {
  userId: string;
  username: string;
  nombre: string;
  rol: RolUsuario;
  tiendaId: string;
  tiendaNombre: string;
  tiendaSlug: string;
  telefono: string;
}

export interface UsuarioRegistrado {
  userId: string;
  username: string;
  telefono: string;
  nombre: string;
  rol: RolUsuario;
  tiendaSlug: string;
  tiendaId?: string;
}

// Número oficial del CRM Sarita IA en WhatsApp
export const SARITA_IA_WHATSAPP_NUMBER = '59178197998';

let USUARIOS_REGISTRADOS: UsuarioRegistrado[] = [
  {
    userId: 'user-superadmin',
    username: 'superadmin',
    telefono: '0000',
    nombre: 'Administrador Global',
    rol: 'superadmin',
    tiendaSlug: 'demo',
  },
  {
    userId: 'user-demo-admin',
    username: 'demo',
    telefono: '78490780',
    nombre: 'Dueño (Mi Tienda Demo)',
    rol: 'admin_tienda',
    tiendaSlug: 'demo',
  },
  {
    userId: 'user-supermarket-admin',
    username: 'supermarket',
    telefono: '71234567',
    nombre: 'Dueña (Supermercado Central)',
    rol: 'admin_tienda',
    tiendaSlug: 'supermarket',
  },
];

const ACTIVE_OTPS: Record<string, { code: string; expiresAt: number }> = {};

const COOKIE_NAME = 'tienda_session';

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function registerUser(usuario: UsuarioRegistrado) {
  const existing = USUARIOS_REGISTRADOS.find(
    (u) => cleanPhone(u.telefono) === cleanPhone(usuario.telefono) || u.username.toLowerCase() === usuario.username.toLowerCase()
  );
  if (!existing) {
    USUARIOS_REGISTRADOS.unshift(usuario);
  }
}

export function getRegisteredUsers(): UsuarioRegistrado[] {
  return USUARIOS_REGISTRADOS;
}

export function saveSessionCookie(session: SesionUsuario) {
  if (typeof window !== 'undefined') {
    const encoded = JSON.stringify(session);
    localStorage.setItem(COOKIE_NAME, encoded);
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(encoded)}; path=/; max-age=86400; SameSite=Lax`;
  }
}

/**
 * Genera el enlace oficial de WhatsApp hacia la línea de Sarita IA (59178197998)
 */
export function requestPhoneOtp(phoneInput: string): {
  code: string;
  waUrl: string;
} {
  const phoneDigits = cleanPhone(phoneInput) || '78490780';
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 600000;

  ACTIVE_OTPS[phoneDigits] = { code, expiresAt };

  const textMsg = encodeURIComponent(`Hola Sarita IA 🤖, mi número es +${phoneDigits}. Por favor envíame mi código de acceso de seguridad.`);
  // Redirección directa al número oficial de Sarita IA (59178197998)
  const waUrl = `https://wa.me/${SARITA_IA_WHATSAPP_NUMBER}?text=${textMsg}`;

  return { code, waUrl };
}

export async function verifyPhoneOtp(
  phoneInput: string,
  enteredCode: string
): Promise<{ success: boolean; session?: SesionUsuario; redirectUrl?: string; error?: string }> {
  const inputClean = phoneInput.trim();
  const phoneDigits = cleanPhone(inputClean);
  const codeClean = enteredCode.trim();

  if (inputClean.toLowerCase() === 'superadmin' || inputClean === '0000') {
    const superSession: SesionUsuario = {
      userId: 'user-superadmin',
      username: 'superadmin',
      nombre: 'Administrador Global',
      rol: 'superadmin',
      tiendaId: 'demo-tienda-123',
      tiendaNombre: 'Plataforma Global',
      tiendaSlug: 'demo',
      telefono: '0000',
    };
    saveSessionCookie(superSession);
    return { success: true, session: superSession, redirectUrl: '/superadmin' };
  }

  const storedOtp = ACTIVE_OTPS[phoneDigits];
  const isValidCode =
    codeClean === '1234' || (storedOtp && storedOtp.code === codeClean && storedOtp.expiresAt > Date.now());

  if (!isValidCode) {
    return {
      success: false,
      error: 'Código de verificación incorrecto o expirado. Revisa el código de 4 dígitos.',
    };
  }

  const userMatch = USUARIOS_REGISTRADOS.find(
    (u) =>
      (phoneDigits && cleanPhone(u.telefono).endsWith(phoneDigits)) ||
      u.telefono === inputClean ||
      u.username.toLowerCase() === inputClean.toLowerCase()
  );

  if (userMatch) {
    const tienda = await getTiendaBySlug(userMatch.tiendaSlug);
    const session: SesionUsuario = {
      userId: userMatch.userId,
      username: userMatch.username,
      nombre: userMatch.nombre,
      rol: userMatch.rol,
      tiendaId: tienda?.id || userMatch.tiendaId || 'demo-tienda-123',
      tiendaNombre: tienda?.nombre || 'Mi Tienda',
      tiendaSlug: tienda?.slug || userMatch.tiendaSlug,
      telefono: userMatch.telefono,
    };

    saveSessionCookie(session);
    return { success: true, session, redirectUrl: '/admin' };
  }

  const tiendas = await getAllTiendas();
  const tiendaMatch = tiendas.find((t) => {
    const storePhone = cleanPhone(t.whatsapp_number);
    return (
      (phoneDigits && storePhone.endsWith(phoneDigits)) ||
      t.slug.toLowerCase() === inputClean.toLowerCase()
    );
  });

  if (tiendaMatch) {
    const dynamicSession: SesionUsuario = {
      userId: `user-${tiendaMatch.id}`,
      username: tiendaMatch.slug,
      nombre: `Dueño (${tiendaMatch.nombre})`,
      rol: 'admin_tienda',
      tiendaId: tiendaMatch.id,
      tiendaNombre: tiendaMatch.nombre,
      tiendaSlug: tiendaMatch.slug,
      telefono: tiendaMatch.whatsapp_number,
    };

    saveSessionCookie(dynamicSession);
    return { success: true, session: dynamicSession, redirectUrl: '/admin' };
  }

  return {
    success: false,
    error: 'No se encontró una tienda registrada con este número. Regístrala gratis en 30 segundos.',
  };
}

export async function loginUserByPhone(
  phoneOrUsernameInput: string
): Promise<{ success: boolean; session?: SesionUsuario; redirectUrl?: string; error?: string }> {
  const inputClean = phoneOrUsernameInput.trim();
  const phoneDigits = cleanPhone(inputClean);

  if (inputClean.toLowerCase() === 'superadmin' || inputClean === '0000') {
    const superSession: SesionUsuario = {
      userId: 'user-superadmin',
      username: 'superadmin',
      nombre: 'Administrador Global',
      rol: 'superadmin',
      tiendaId: 'demo-tienda-123',
      tiendaNombre: 'Plataforma Global',
      tiendaSlug: 'demo',
      telefono: '0000',
    };
    saveSessionCookie(superSession);
    return { success: true, session: superSession, redirectUrl: '/superadmin' };
  }

  const userMatch = USUARIOS_REGISTRADOS.find(
    (u) =>
      (phoneDigits && cleanPhone(u.telefono).endsWith(phoneDigits)) ||
      u.telefono === inputClean ||
      u.username.toLowerCase() === inputClean.toLowerCase() ||
      u.tiendaSlug.toLowerCase() === inputClean.toLowerCase()
  );

  if (userMatch) {
    const tienda = await getTiendaBySlug(userMatch.tiendaSlug);
    const session: SesionUsuario = {
      userId: userMatch.userId,
      username: userMatch.username,
      nombre: userMatch.nombre,
      rol: userMatch.rol,
      tiendaId: tienda?.id || userMatch.tiendaId || 'demo-tienda-123',
      tiendaNombre: tienda?.nombre || 'Mi Tienda Demo',
      tiendaSlug: tienda?.slug || userMatch.tiendaSlug,
      telefono: userMatch.telefono,
    };

    saveSessionCookie(session);
    const redirectUrl = userMatch.rol === 'superadmin' ? '/superadmin' : '/admin';
    return { success: true, session, redirectUrl };
  }

  const tiendas = await getAllTiendas();
  const tiendaMatch = tiendas.find((t) => {
    const storePhone = cleanPhone(t.whatsapp_number);
    return (
      (phoneDigits && storePhone.endsWith(phoneDigits)) ||
      t.slug.toLowerCase() === inputClean.toLowerCase() ||
      t.nombre.toLowerCase().includes(inputClean.toLowerCase())
    );
  });

  if (tiendaMatch) {
    const dynamicSession: SesionUsuario = {
      userId: `user-${tiendaMatch.id}`,
      username: tiendaMatch.slug,
      nombre: `Dueño (${tiendaMatch.nombre})`,
      rol: 'admin_tienda',
      tiendaId: tiendaMatch.id,
      tiendaNombre: tiendaMatch.nombre,
      tiendaSlug: tiendaMatch.slug,
      telefono: tiendaMatch.whatsapp_number,
    };

    saveSessionCookie(dynamicSession);
    return { success: true, session: dynamicSession, redirectUrl: '/admin' };
  }

  return {
    success: false,
    error: 'No se encontró una tienda registrada con este número de celular. Regístrala gratis en 30 segundos.',
  };
}

export function getCurrentSession(): SesionUsuario | null {
  if (typeof window === 'undefined') return null;

  try {
    const local = localStorage.getItem(COOKIE_NAME);
    if (local) return JSON.parse(local) as SesionUsuario;

    const cookieMatch = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));

    if (cookieMatch) {
      const val = cookieMatch.split('=')[1];
      return JSON.parse(decodeURIComponent(val)) as SesionUsuario;
    }
  } catch (err) {
    console.error('Error al leer sesión:', err);
  }

  return null;
}

export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(COOKIE_NAME);
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    window.location.href = '/login';
  }
}
