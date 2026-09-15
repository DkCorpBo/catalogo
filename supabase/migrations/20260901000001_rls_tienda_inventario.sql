-- ===================================================
-- SCRIPT DE MIGRACIÓN: POLÍTICAS RLS MULTI-TENANT
-- ===================================================

ALTER TABLE public.tiendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_detalles ENABLE ROW LEVEL SECURITY;

-- 1. Tiendas visibles públicamente por slug
CREATE POLICY "Tiendas activas visibles públicamente" ON public.tiendas
  FOR SELECT USING (activo = true);

-- 2. Productos visibles públicamente por tienda
CREATE POLICY "Productos disponibles visibles públicamente" ON public.productos
  FOR SELECT USING (disponible = true);

-- 3. Categorías visibles públicamente
CREATE POLICY "Categorías visibles públicamente" ON public.categorias
  FOR SELECT USING (true);

-- 4. Creación pública de pedidos desde el carrito de la tienda
CREATE POLICY "Permitir a los clientes registrar pedidos" ON public.pedidos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir a los clientes registrar detalles del pedido" ON public.pedido_detalles
  FOR INSERT WITH CHECK (true);
