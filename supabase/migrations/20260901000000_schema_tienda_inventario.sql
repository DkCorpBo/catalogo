-- ===================================================
-- SCRIPT DE MIGRACIÓN: TIENDA & INVENTARIO SAAS (KATARA)
-- ===================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE TIENDAS (TENANTS)
CREATE TABLE IF NOT EXISTS public.tiendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  logo_url TEXT,
  whatsapp_number TEXT NOT NULL,
  moneda TEXT DEFAULT 'USD',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE USUARIOS / DUEÑOS DE TIENDA
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tienda_id UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  rol TEXT CHECK (rol IN ('superadmin', 'admin_tienda')) NOT NULL DEFAULT 'admin_tienda',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORÍAS DE PRODUCTO
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tienda_id UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE PRODUCTOS E INVENTARIO
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tienda_id UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  costo NUMERIC(10,2) DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  stock_minimo INT DEFAULT 5,
  imagen_url TEXT,
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE PEDIDOS / VENTAS
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tienda_id UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  cliente_nombre TEXT NOT NULL,
  cliente_whatsapp TEXT NOT NULL,
  cliente_direccion TEXT,
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  estado TEXT CHECK (estado IN ('pendiente', 'confirmado', 'completado', 'cancelado')) DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DETALLES DE PEDIDO
CREATE TABLE IF NOT EXISTS public.pedido_detalles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES public.productos(id) ON DELETE SET NULL,
  producto_nombre TEXT NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  cantidad INT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);
