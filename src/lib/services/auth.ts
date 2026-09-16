import { RolUsuario } from '../types';
import { getTiendaBySlug, getAllTiendas } from './tiendas';
import { createClient } from '../supabase/client';

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

/**
 * Compara dos números de teléfono tolerando código de país (+591) y formatos
 */
export function matchPhone(phoneA: string, phoneB: string): boolean {
  const digitsA = cleanPhone(phoneA);
  const digitsB = cleanPhone(phoneB);
  if (!digitsA || !digitsB) return false;
  if (digitsA === digitsB) return true;
  if (digitsA.endsWith(digitsB) || digitsB.endsWith(digitsA)) return true;
  if (digitsA.length >= 7 && digitsB.length >= 7 && digitsA.slice(-7) === digitsB.slice(-7)) return true;
  return false;
}

export function registerUser(usuario: UsuarioRegistrado) {
  const existing = USUARIOS_REGISTRADOS.find(
    (u) => matchPhone(u.telefono, usuario.telefono) || u.username.toLowerCase() === usuario.username.toLowerCase()
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
 * y persiste el código OTP generado en Supabase para sincronizar entre servidor y navegador.
 */
export async function requestPhoneOtp(phoneInput: string): Promise<{
  code: string;
  waUrl: string;
}> {
  const phoneDigits = cleanPhone(phoneInput) || '78490780';
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 600000;
  const isoExpires = new Date(expiresAt).toISOString();

  ACTIVE_OTPS[phoneDigits] = { code, expiresAt };
  if (phoneDigits.length >= 8) {
    ACTIVE_OTPS[phoneDigits.slice(-8)] = { code, expiresAt };
  }

  // Persistir en Supabase (public.auth_otps)
  try {
    const supabase = createClient();
    const rows = [{ phone: phoneDigits, code, expires_at: isoExpires }];
    if (phoneDigits.length >= 8 && phoneDigits !== phoneDigits.slice(-8)) {
      rows.push({ phone: phoneDigits.slice(-8), code, expires_at: isoExpires });
    }
    await supabase.from('auth_otps').upsert(rows);
  } catch (err) {
    console.error('Error al guardar OTP en Supabase:', err);
  }

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



  // 1. Verificar primero en memoria local
  let isCodeMatch = false;
  const storedOtp = ACTIVE_OTPS[phoneDigits] || (phoneDigits.length >= 8 ? ACTIVE_OTPS[phoneDigits.slice(-8)] : undefined);
  if (storedOtp && storedOtp.code === codeClean && storedOtp.expiresAt > Date.now()) {
    isCodeMatch = true;
  }

  // 2. Si no coincide en memoria local, buscar en Supabase (generado por Sarita IA o API)
  if (!isCodeMatch) {
    try {
      const supabase = createClient();
      const last8 = phoneDigits.length >= 8 ? phoneDigits.slice(-8) : phoneDigits;
      const { data } = await supabase
        .from('auth_otps')
        .select('*')
        .or(`phone.eq.${phoneDigits},phone.eq.${last8}`)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0 && data[0].code === codeClean) {
        isCodeMatch = true;
      }
    } catch (err) {
      console.error('Error al verificar OTP en Supabase:', err);
    }
  }

  const isValidCode = isCodeMatch;

  if (!isValidCode) {
    return {
      success: false,
      error: 'Código de verificación incorrecto o expirado. Revisa el código de 4 dígitos.',
    };
  }

  const userMatch = USUARIOS_REGISTRADOS.find(
    (u) =>
      matchPhone(phoneDigits, u.telefono) ||
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
    return (
      matchPhone(phoneDigits, t.whatsapp_number) ||
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



  const userMatch = USUARIOS_REGISTRADOS.find(
    (u) =>
      matchPhone(phoneDigits, u.telefono) ||
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
    return (
      matchPhone(phoneDigits, t.whatsapp_number) ||
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

export function logoutUser(redirectTo?: unknown) {
  if (typeof window !== 'undefined') {
    const isSuper = getCurrentSession()?.rol === 'superadmin';
    localStorage.removeItem(COOKIE_NAME);
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    const targetUrl = typeof redirectTo === 'string' ? redirectTo : (isSuper ? '/superadmin/login' : '/login');
    window.location.href = targetUrl;
  }
}
