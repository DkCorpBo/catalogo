'use client';

import React, { useEffect, useState, use } from 'react';
import { Tienda, Producto, Categoria, CartItem } from '@/lib/types';
import { getTiendaBySlug } from '@/lib/services/tiendas';
import { getProductosByTiendaId, getCategoriasByTiendaId } from '@/lib/services/productos';
import { StoreHeader } from '@/components/storefront/Header';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductDetailModal } from '@/components/storefront/ProductDetailModal';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { Search, ShoppingBag } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function StorefrontPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const storeData = await getTiendaBySlug(slug);
      setTienda(storeData);

      if (storeData) {
        const [prods, cats] = await Promise.all([
          getProductosByTiendaId(storeData.id),
          getCategoriasByTiendaId(storeData.id),
        ]);
        setProductos(prods);
        setCategorias(cats);
      }
      setLoading(false);
    }
    loadData();
  }, [slug]);

  const handleAddToCart = (producto: Producto, cantidad: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.producto.id === producto.id);
      if (existing) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, { producto, cantidad }];
    });

    // Feedback visual en el botón
    setAddedItemIds((prev) => ({ ...prev, [producto.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [producto.id]: false }));
    }, 1200);
  };

  const handleUpdateQuantity = (productoId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.producto.id === productoId) {
            const newQty = item.cantidad + delta;
            return newQty > 0 ? { ...item, cantidad: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productoId: string) => {
    setCart((prev) => prev.filter((item) => item.producto.id !== productoId));
  };

  const totalCartItemsCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  const filteredProductos = productos.filter((p) => {
    const matchesCategory = selectedCategoria ? p.categoria_id === selectedCategoria : true;
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#3C50E0] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold text-[#64748B]">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  if (!tienda) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-4">
        <div className="text-center bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm max-w-sm space-y-2">
          <h2 className="text-lg font-black text-[#1C2434]">Tienda no encontrada</h2>
          <p className="text-xs text-[#64748B]">La tienda "{slug}" no está disponible o ha sido desactivada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-24">
      {/* Header Público de la Tienda */}
      <StoreHeader
        tienda={tienda}
        cartCount={totalCartItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Buscador y Categorías */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-5">
        {/* Buscador de productos */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar productos en el catálogo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-hidden focus:border-[#3C50E0] shadow-2xs"
          />
        </div>

        {/* Filtro de Categorías */}
        {categorias.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategoria(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategoria === null
                  ? 'bg-[#3C50E0] text-white shadow-2xs'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-gray-50'
              }`}
            >
              Todos ({productos.length})
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoria(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategoria === cat.id
                    ? 'bg-[#3C50E0] text-white shadow-2xs'
                    : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-gray-50'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Grid de Productos */}
        {filteredProductos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center text-[#64748B] space-y-1">
            <p className="font-extrabold text-base text-[#1C2434]">No hay productos disponibles</p>
            <p className="text-xs text-gray-400">Intenta con otra búsqueda o categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProductos.map((prod) => (
              <ProductCard
                key={prod.id}
                producto={prod}
                currency={tienda.moneda}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onViewDetails={(p) => setSelectedProduct(p)}
                added={!!addedItemIds[prod.id]}
              />
            ))}
          </div>
        )}
      </main>

      {/* Botón Flotante Ver Carrito Móvil */}
      {totalCartItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#3C50E0] hover:bg-[#2e3fb8] text-white py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-between shadow-xl transition-all active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} />
              <span>Ver Carrito ({totalCartItemsCount})</span>
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold">Ver Desglose →</span>
          </button>
        </div>
      )}

      {/* Modal de Detalle y Foto Ampliada del Producto */}
      <ProductDetailModal
        producto={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        currency={tienda.moneda}
        onAddToCart={handleAddToCart}
      />

      {/* Drawer / Modal del Carrito */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        tienda={tienda}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
      />
    </div>
  );
}
