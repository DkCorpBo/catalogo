import { Producto, Categoria } from '../types';
import { createClient } from '../supabase/client';

const STORAGE_KEY = 'productos_db_v1';

const MOCK_CATEGORIAS: Categoria[] = [
  { id: 'cat-1', tienda_id: 'demo-tienda-123', nombre: 'Bebidas & Agua', orden: 1 },
  { id: 'cat-2', tienda_id: 'demo-tienda-123', nombre: 'Accesorios & Equipos', orden: 2 },
  { id: 'cat-3', tienda_id: 'tienda-super-market', nombre: 'Abarrotes & Frutas', orden: 1 },
];

const DEFAULT_PRODUCTOS: Producto[] = [
  {
    id: 'prod-1',
    tienda_id: 'demo-tienda-123',
    categoria_id: 'cat-1',
    nombre: 'Botellón de Agua 20 Litros',
    descripcion: 'Agua purificada de mesa en envase retornable de 20L.',
    precio: 3.50,
    costo: 1.20,
    stock: 45,
    stock_minimo: 10,
    imagen_url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?auto=format&fit=crop&w=400&q=80',
    disponible: true,
  },
  {
    id: 'prod-2',
    tienda_id: 'demo-tienda-123',
    categoria_id: 'cat-1',
    nombre: 'Pack 6x Botella 2L',
    descripcion: 'Pack de 6 botellas descartables de agua sin gas.',
    precio: 5.00,
    costo: 2.50,
    stock: 20,
    stock_minimo: 5,
    imagen_url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=400&q=80',
    disponible: true,
  },
  {
    id: 'prod-3',
    tienda_id: 'demo-tienda-123',
    categoria_id: 'cat-2',
    nombre: 'Dispensador de Agua Eléctrico USB',
    descripcion: 'Bomba recargable automática para botellón.',
    precio: 12.00,
    costo: 6.00,
    stock: 3,
    stock_minimo: 5,
    imagen_url: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?auto=format&fit=crop&w=400&q=80',
    disponible: true,
  },
  {
    id: 'prod-4',
    tienda_id: 'tienda-super-market',
    categoria_id: 'cat-3',
    nombre: 'Manzanas Red Delicious (1kg)',
    descripcion: 'Manzanas rojas frescas de primera calidad.',
    precio: 2.80,
    costo: 1.50,
    stock: 100,
    stock_minimo: 20,
    imagen_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
    disponible: true,
  },
];

function getLocalProductosList(): Producto[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTOS));
    } catch (err) {
      console.error('Error al leer productos de localStorage:', err);
    }
  }
  return DEFAULT_PRODUCTOS;
}

function saveLocalProductosList(prods: Producto[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prods));
    } catch (err) {
      console.error('Error al guardar productos en localStorage:', err);
    }
  }
}

export async function getProductosByTiendaId(tiendaId: string): Promise<Producto[]> {
  const localList = getLocalProductosList().filter((p) => p.tienda_id === tiendaId);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return localList;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('tienda_id', tiendaId)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return localList;
    }

    // Combinar con los creados localmente si no existen en Supabase
    const supabaseIds = new Set(data.map((d: any) => d.id));
    const merged = [...data as Producto[], ...localList.filter((p) => !supabaseIds.has(p.id))];
    return merged;
  } catch (err) {
    console.error('Error al obtener productos:', err);
    return localList;
  }
}

export async function getCategoriasByTiendaId(tiendaId: string): Promise<Categoria[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return MOCK_CATEGORIAS.filter((c) => c.tienda_id === tiendaId);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('tienda_id', tiendaId)
      .order('orden', { ascending: true });

    if (error || !data) return MOCK_CATEGORIAS.filter((c) => c.tienda_id === tiendaId);
    return data as Categoria[];
  } catch (err) {
    console.error('Error al obtener categorías:', err);
    return MOCK_CATEGORIAS.filter((c) => c.tienda_id === tiendaId);
  }
}

export async function createProducto(producto: Omit<Producto, 'id'>): Promise<Producto | null> {
  const newId = `prod-${Date.now()}`;
  const newProd: Producto = {
    ...producto,
    id: newId,
    created_at: new Date().toISOString(),
  };

  // 1. Guardar en localStorage para disponibilidad instantánea
  const allProds = getLocalProductosList();
  allProds.unshift(newProd);
  saveLocalProductosList(allProds);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return newProd;
  }

  // 2. Intentar guardar en Supabase
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('productos')
      .insert(producto)
      .select()
      .single();

    if (error || !data) {
      console.warn('Advertencia al insertar en Supabase (guardado en local):', error);
      return newProd;
    }
    return data as Producto;
  } catch (err) {
    console.error('Error al crear producto en Supabase:', err);
    return newProd;
  }
}

export async function updateProducto(id: string, updates: Partial<Producto>): Promise<boolean> {
  const allProds = getLocalProductosList().map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveLocalProductosList(allProds);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return true;
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from('productos').update(updates).eq('id', id);
    return !error;
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    return true;
  }
}

export async function deleteProducto(id: string): Promise<boolean> {
  const allProds = getLocalProductosList().filter((p) => p.id !== id);
  saveLocalProductosList(allProds);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return true;
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from('productos').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    return true;
  }
}
