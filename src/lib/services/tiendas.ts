import { Tienda, PlanTienda } from '../types';
import { createClient } from '../supabase/client';
import { saveSessionCookie, SesionUsuario } from './auth';

const STORAGE_KEY = 'tiendas_db_v1';

const DEFAULT_TIENDAS: Tienda[] = [
  {
    id: 'demo-tienda-123',
    nombre: 'Mi Tienda Demo',
    slug: 'demo',
    descripcion: 'Tienda de prueba con productos de excelente calidad.',
    whatsapp_number: '59178490780',
    moneda: 'USD',
    activo: true,
    plan: 'gratis',
    max_productos: 5,
    max_pedidos_mes: 20,
    logo_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=200&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tienda-super-market',
    nombre: 'Supermercado Central',
    slug: 'supermarket',
    descripcion: 'Abarrotes, verduras frescas y bebidas al mejor precio.',
    whatsapp_number: '59171234567',
    moneda: 'BOB',
    activo: true,
    plan: 'pro',
    max_productos: 9999,
    max_pedidos_mes: 9999,
    logo_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

function getLocalTiendasList(): Tienda[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Tienda[] = JSON.parse(stored);
        // Actualizar número de WhatsApp a 78490780 en la tienda demo guardada
        const demo = parsed.find((t) => t.slug === 'demo');
        if (demo) demo.whatsapp_number = '59178490780';
        return parsed;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TIENDAS));
    } catch (err) {
      console.error('Error al leer tiendas de localStorage:', err);
    }
  }
  return DEFAULT_TIENDAS;
}

function saveLocalTiendasList(tiendas: Tienda[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tiendas));
    } catch (err) {
      console.error('Error al guardar tiendas en localStorage:', err);
    }
  }
}

export async function getAllTiendas(): Promise<Tienda[]> {
  const localList = getLocalTiendasList();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return localList;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('tiendas').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return localList;
    return data as Tienda[];
  } catch (err) {
    console.error('Error al obtener lista de tiendas:', err);
    return localList;
  }
}

export async function getTiendaBySlug(slug: string): Promise<Tienda | null> {
  const localList = getLocalTiendasList();
  const match = localList.find((t) => t.slug.toLowerCase() === slug.toLowerCase());

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tiendas')
        .select('*')
        .eq('slug', slug.toLowerCase())
        .maybeSingle();

      if (data) {
        const store = data as Tienda;
        if (match) {
          Object.assign(match, store);
          saveLocalTiendasList(localList);
        } else {
          localList.unshift(store);
          saveLocalTiendasList(localList);
        }
        return store;
      }
    } catch (err) {
      console.error('Error al consultar tienda por slug en Supabase:', err);
    }
  }

  if (match) return match;
  return null;
}

export async function getTiendasByPhone(phone: string): Promise<Tienda[]> {
  const all = await getAllTiendas();
  const digits = phone.replace(/\D/g, '');
  if (!digits) return [];
  return all.filter((t) => {
    const tDigits = (t.whatsapp_number || '').replace(/\D/g, '');
    if (tDigits === digits) return true;
    if (tDigits.endsWith(digits) || digits.endsWith(tDigits)) return true;
    if (tDigits.length >= 7 && digits.length >= 7 && tDigits.slice(-7) === digits.slice(-7)) return true;
    return false;
  });
}

export async function createNewTienda(
  data: Omit<Tienda, 'id' | 'activo' | 'plan' | 'max_productos' | 'max_pedidos_mes'>
): Promise<Tienda> {
  // Validación de Regla de Negocio: En Plan Gratuito solo se permite 1 tienda por número.
  // Múltiples tiendas está restringido a usuarios con Plan Pro.
  const existingStores = await getTiendasByPhone(data.whatsapp_number);
  if (existingStores.length > 0) {
    const hasPro = existingStores.some((s) => s.plan === 'pro');
    if (!hasPro) {
      const error: any = new Error(
        `Tu número ya tiene registrada la tienda "${existingStores[0].nombre}" en el Plan Gratuito. El uso de múltiples tiendas con un mismo número es exclusivo para usuarios de Plan Pro.`
      );
      error.code = 'MULTIPLE_STORES_PRO_REQUIRED';
      error.existingStore = existingStores[0];
      throw error;
    }
  }

  const localList = getLocalTiendasList();
  const newUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'a0eebc99-9c0b-4ef8-bb6d-' + Date.now().toString(16).padStart(12, '0');
  
  const newTienda: Tienda = {
    ...data,
    id: newUuid,
    slug: data.slug.toLowerCase().trim(),
    activo: true,
    plan: 'gratis',
    max_productos: 5,
    max_pedidos_mes: 20,
    created_at: new Date().toISOString(),
  };

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    try {
      const supabase = createClient();
      const { data: inserted, error } = await supabase
        .from('tiendas')
        .insert({
          id: newUuid,
          nombre: data.nombre,
          slug: newTienda.slug,
          whatsapp_number: data.whatsapp_number,
          descripcion: data.descripcion,
          logo_url: data.logo_url,
          moneda: data.moneda || 'USD',
          plan: 'gratis',
          max_productos: 5,
          max_pedidos_mes: 20,
          activo: true,
        })
        .select()
        .single();

      if (inserted) {
        newTienda.id = inserted.id;
      }
      if (error) {
        console.error('Error al insertar tienda en Supabase:', error);
      }
    } catch (err) {
      console.error('Error al insertar tienda en Supabase:', err);
    }
  }

  localList.unshift(newTienda);
  saveLocalTiendasList(localList);

  const newSession: SesionUsuario = {
    userId: `user-${newTienda.id}`,
    username: newTienda.slug,
    nombre: `Dueño (${newTienda.nombre})`,
    rol: 'admin_tienda',
    tiendaId: newTienda.id,
    tiendaNombre: newTienda.nombre,
    tiendaSlug: newTienda.slug,
    telefono: newTienda.whatsapp_number,
  };

  saveSessionCookie(newSession);

  return newTienda;
}

export async function updateTiendaConfig(id: string, updates: Partial<Tienda>): Promise<boolean> {
  const localList = getLocalTiendasList();
  const target = localList.find((t) => t.id === id);
  
  if (target) {
    Object.assign(target, updates);
    saveLocalTiendasList(localList);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return true;
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from('tiendas').update(updates).eq('id', id);
    return !error;
  } catch (err) {
    console.error('Error al actualizar tienda:', err);
    return false;
  }
}

export async function updatePlanTienda(id: string, plan: PlanTienda): Promise<boolean> {
  const max_productos = plan === 'pro' ? 9999 : 5;
  const max_pedidos_mes = plan === 'pro' ? 9999 : 20;

  return await updateTiendaConfig(id, { plan, max_productos, max_pedidos_mes });
}
