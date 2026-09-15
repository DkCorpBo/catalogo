export type RolUsuario = 'superadmin' | 'admin_tienda';
export type PlanTienda = 'gratis' | 'pro';

export interface Tienda {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  logo_url?: string | null;
  whatsapp_number: string;
  moneda: string;
  activo: boolean;
  plan: PlanTienda;
  max_productos: number;
  max_pedidos_mes: number;
  created_at?: string;
  updated_at?: string;
}

export interface Usuario {
  id: string;
  tienda_id: string;
  nombre: string;
  username: string;
  rol: RolUsuario;
  activo: boolean;
  created_at?: string;
}

export interface Categoria {
  id: string;
  tienda_id: string;
  nombre: string;
  orden: number;
  created_at?: string;
}

export interface Producto {
  id: string;
  tienda_id: string;
  categoria_id?: string | null;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  costo?: number;
  stock: number;
  stock_minimo: number;
  imagen_url?: string | null;
  disponible: boolean;
  created_at?: string;
  updated_at?: string;
}

export type EstadoPedido = 'pendiente' | 'confirmado' | 'completado' | 'cancelado';

export interface Pedido {
  id: string;
  tienda_id: string;
  cliente_nombre: string;
  cliente_whatsapp: string;
  cliente_direccion?: string | null;
  total: number;
  estado: EstadoPedido;
  created_at?: string;
  detalles?: PedidoDetalle[];
}

export interface PedidoDetalle {
  id?: string;
  pedido_id?: string;
  producto_id?: string | null;
  producto_nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
}
