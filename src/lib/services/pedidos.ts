import { Pedido, PedidoDetalle, EstadoPedido } from '../types';
import { createClient } from '../supabase/client';
import { updateProducto, getProductosByTiendaId } from './productos';

let MOCK_PEDIDOS: Pedido[] = [
  {
    id: 'ped-1001-abcd',
    tienda_id: 'demo-tienda-123',
    cliente_nombre: 'María Ramos',
    cliente_whatsapp: '59178912345',
    cliente_direccion: 'Av. Las Palmas #450, Piso 2',
    total: 12.00,
    estado: 'pendiente',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    detalles: [
      { producto_nombre: 'Dispensador de Agua Eléctrico USB', precio_unitario: 12.00, cantidad: 1, subtotal: 12.00 },
    ],
  },
  {
    id: 'ped-1002-efgh',
    tienda_id: 'demo-tienda-123',
    cliente_nombre: 'Carlos Gutiérrez',
    cliente_whatsapp: '59171234567',
    cliente_direccion: 'Calle Jordan #123',
    total: 7.00,
    estado: 'completado',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    detalles: [
      { producto_nombre: 'Botellón de Agua 20 Litros', precio_unitario: 3.50, cantidad: 2, subtotal: 7.00 },
    ],
  },
  {
    id: 'ped-2001-xyz',
    tienda_id: 'tienda-super-market',
    cliente_nombre: 'Roberto Fernández',
    cliente_whatsapp: '59172223344',
    cliente_direccion: 'Plaza Principal #10',
    total: 5.60,
    estado: 'confirmado',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    detalles: [
      { producto_nombre: 'Manzanas Red Delicious (1kg)', precio_unitario: 2.80, cantidad: 2, subtotal: 5.60 },
    ],
  },
];

export async function createPedido(
  pedidoData: Omit<Pedido, 'id'>,
  detalles: PedidoDetalle[]
): Promise<Pedido | null> {
  const newId = `ped-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6)}`;
  const newPedido: Pedido = {
    ...pedidoData,
    id: newId,
    estado: 'pendiente',
    created_at: new Date().toISOString(),
    detalles,
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    MOCK_PEDIDOS.unshift(newPedido);
    return newPedido;
  }

  try {
    const supabase = createClient();
    const { data: insertedPedido, error: errPedido } = await supabase
      .from('pedidos')
      .insert({
        tienda_id: pedidoData.tienda_id,
        cliente_nombre: pedidoData.cliente_nombre,
        cliente_whatsapp: pedidoData.cliente_whatsapp,
        cliente_direccion: pedidoData.cliente_direccion,
        total: pedidoData.total,
        estado: 'pendiente',
      })
      .select()
      .single();

    if (errPedido || !insertedPedido) throw errPedido;

    const detallesFormat = detalles.map((d) => ({
      pedido_id: insertedPedido.id,
      producto_id: d.producto_id,
      producto_nombre: d.producto_nombre,
      precio_unitario: d.precio_unitario,
      cantidad: d.cantidad,
      subtotal: d.subtotal,
    }));

    await supabase.from('pedido_detalles').insert(detallesFormat);

    return { ...insertedPedido, detalles: detallesFormat } as Pedido;
  } catch (err) {
    console.error('Error al registrar pedido en Supabase:', err);
    MOCK_PEDIDOS.unshift(newPedido);
    return newPedido;
  }
}

export async function getPedidosByTiendaId(tiendaId: string): Promise<Pedido[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    // FILTRADO ESTRICTO POR TIENDA_ID
    return MOCK_PEDIDOS.filter((p) => p.tienda_id === tiendaId);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, detalles:pedido_detalles(*)')
      .eq('tienda_id', tiendaId)
      .order('created_at', { ascending: false });

    if (error || !data) return MOCK_PEDIDOS.filter((p) => p.tienda_id === tiendaId);
    return data as Pedido[];
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    return MOCK_PEDIDOS.filter((p) => p.tienda_id === tiendaId);
  }
}

export async function updateEstadoPedido(
  pedidoId: string,
  nuevoEstado: EstadoPedido
): Promise<boolean> {
  const targetPedido = MOCK_PEDIDOS.find((p) => p.id === pedidoId);
  const estadoAnterior = targetPedido?.estado;

  if (targetPedido) {
    targetPedido.estado = nuevoEstado;

    // Si pasa a 'confirmado' o 'completado' desde 'pendiente', descontar stock automáticamente
    if ((nuevoEstado === 'confirmado' || nuevoEstado === 'completado') && estadoAnterior === 'pendiente') {
      const productos = await getProductosByTiendaId(targetPedido.tienda_id);
      targetPedido.detalles?.forEach((d) => {
        if (d.producto_id) {
          const prod = productos.find((p) => p.id === d.producto_id);
          if (prod) {
            const nuevoStock = Math.max(0, prod.stock - d.cantidad);
            updateProducto(prod.id, { stock: nuevoStock });
          }
        }
      });
    }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return true;
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', pedidoId);
    return !error;
  } catch (err) {
    console.error('Error al actualizar estado del pedido:', err);
    return false;
  }
}

export async function getKpisByTiendaId(tiendaId: string) {
  const pedidos = await getPedidosByTiendaId(tiendaId);
  const productos = await getProductosByTiendaId(tiendaId);

  const ventasTotales = pedidos
    .filter((p) => p.estado === 'completado' || p.estado === 'confirmado')
    .reduce((sum, p) => sum + (p.total || 0), 0);

  const pedidosPendientes = pedidos.filter((p) => p.estado === 'pendiente').length;
  const pedidosCompletados = pedidos.filter((p) => p.estado === 'completado').length;
  const productosStockBajo = productos.filter((p) => p.stock <= p.stock_minimo).length;

  return {
    ventasTotales,
    pedidosPendientes,
    pedidosCompletados,
    productosStockBajo,
    totalProductos: productos.length,
  };
}
