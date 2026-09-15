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
  const match = localList.find((t) => t.slug === slug);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    if (match) return match;
    
    const dynamicStore: Tienda = {
      id: `tienda-${slug}-${Date.now()}`,
      nombre: `Tienda ${slug}`,
      slug,
      whatsapp_number: '59178490780',
      moneda: 'USD',
      activo: true,
      plan: 'gratis',
      max_productos: 5,
      max_pedidos_mes: 20,
    };
    localList.unshift(dynamicStore);
    saveLocalTiendasList(localList);
    return dynamicStore;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tiendas')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      if (match) return match;
      return null;
    }

    return data as Tienda;
  } catch (err) {
    console.error('Error al consultar tienda por slug:', err);
    return match || null;
  }
}

export async function createNewTienda(
  data: Omit<Tienda, 'id' | 'activo' | 'plan' | 'max_productos' | 'max_pedidos_mes'>
): Promise<Tienda> {
  const localList = getLocalTiendasList();
  const newId = `tienda-${Date.now()}`;
  
  const newTienda: Tienda = {
    ...data,
    id: newId,
    activo: true,
    plan: 'gratis',
    max_productos: 5,
    max_pedidos_mes: 20,
    created_at: new Date().toISOString(),
  };

  localList.unshift(newTienda);
  saveLocalTiendasList(localList);

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    try {
      const supabase = createClient();
      await supabase.from('tiendas').insert({
        id: newId,
        nombre: data.nombre,
        slug: data.slug,
        whatsapp_number: data.whatsapp_number,
        descripcion: data.descripcion,
        logo_url: data.logo_url,
        moneda: data.moneda || 'USD',
        plan: 'gratis',
        max_productos: 5,
        max_pedidos_mes: 20,
      });
    } catch (err) {
      console.error('Error al insertar tienda en Supabase:', err);
    }
  }

  const newSession: SesionUsuario = {
    userId: `user-${newId}`,
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
