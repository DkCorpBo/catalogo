'use client';

import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/Header';
import { getProductosByTiendaId, getCategoriasByTiendaId } from '@/lib/services/productos';
import { getTiendaBySlug } from '@/lib/services/tiendas';
import { createPedido } from '@/lib/services/pedidos';
import { getCurrentSession, SesionUsuario } from '@/lib/services/auth';
import { formatCurrency } from '@/lib/utils/formatters';
import { Producto, Categoria, Tienda, CartItem, Pedido } from '@/lib/types';
import { TicketModal } from '@/components/pos/TicketModal';
import { Search, ShoppingCart, Plus, Minus, Trash2, DollarSign, QrCode, CreditCard, CheckCircle2, Zap, Package } from 'lucide-react';

export default function AdminPosPage() {
  const [session, setSession] = useState<SesionUsuario | null>(null);
  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'qr' | 'tarjeta'>('efectivo');
  const [montoRecibidoInput, setMontoRecibidoInput] = useState<string>('');
  const [clienteNombre, setClienteNombre] = useState('Cliente de Mostrador');
  const [clienteWhatsapp, setClienteWhatsapp] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingSale, setProcessingSale] = useState(false);
  const [completedPedido, setCompletedPedido] = useState<Pedido | null>(null);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const currentSes = getCurrentSession();
    setSession(currentSes);

    const targetSlug = currentSes?.tiendaSlug || 'demo';
    const store = await getTiendaBySlug(targetSlug);
    setTienda(store);

    if (store) {
      const [prods, cats] = await Promise.all([
        getProductosByTiendaId(store.id),
        getCategoriasByTiendaId(store.id),
      ]);
      setProductos(prods);
      setCategorias(cats);
    }
    setLoading(false);
  }

  const handleAddToCart = (producto: Producto) => {
    if (producto.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.producto.id === producto.id);
      if (existing) {
        if (existing.cantidad >= producto.stock) return prev; // No superar el stock
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const handleUpdateQuantity = (productoId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.producto.id === productoId) {
            const newQty = item.cantidad + delta;
            if (newQty > item.producto.stock) return item;
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

  const total = cart.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  const montoRecibido = parseFloat(montoRecibidoInput) || total;
  const vuelto = Math.max(0, montoRecibido - total);

  const handleCheckoutPOS = async () => {
    if (!tienda || cart.length === 0) return;

    setProcessingSale(true);

    try {
      const detalles = cart.map((item) => ({
        producto_id: item.producto.id,
        producto_nombre: item.producto.nombre,
        precio_unitario: item.producto.precio,
        cantidad: item.cantidad,
        subtotal: item.producto.precio * item.cantidad,
      }));

      // Registrar pedido directamente en estado COMPLETADO
      const newPedido = await createPedido(
        {
          tienda_id: tienda.id,
          cliente_nombre: clienteNombre.trim() || 'Cliente Mostrador POS',
          cliente_whatsapp: clienteWhatsapp.trim() || tienda.whatsapp_number,
          total,
          estado: 'completado',
        },
        detalles
      );

      if (newPedido) {
        setCompletedPedido(newPedido);
        setIsTicketOpen(true);
      }

      await loadData();
    } catch (err) {
      console.error('Error al procesar venta POS:', err);
    } finally {
      setProcessingSale(false);
    }
  };

  const handleNewSale = () => {
    setCart([]);
    setMontoRecibidoInput('');
    setClienteNombre('Cliente de Mostrador');
    setClienteWhatsapp('');
    setIsTicketOpen(false);
    setCompletedPedido(null);
  };

  const filteredProductos = productos.filter((p) => {
    const matchesCategory = selectedCategoria ? p.categoria_id === selectedCategoria : true;
    const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <AdminSidebar slug={tienda?.slug || session?.tiendaSlug || 'demo'} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader storeName={tienda?.nombre} plan={tienda?.plan} />

        <main className="p-6 flex-1 flex flex-col md:flex-row gap-6 min-h-0 overflow-y-auto">
          {/* LADO IZQUIERDO: Catálogo Rápido POS */}
          <div className="flex-1 space-y-4 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#1C2434] flex items-center gap-2">
                  <Zap className="text-[#3C50E0]" size={24} /> Punto de Venta (POS Caja)
                </h2>
                <p className="text-xs text-[#64748B]">Venta rápida en mostrador para caja registradora</p>
              </div>
            </div>

            {/* Buscador de productos */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre de producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-hidden focus:border-[#3C50E0] shadow-2xs"
              />
            </div>

            {/* Filtro por Categorías */}
            {categorias.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCategoria(null)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
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
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
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

            {/* Grid de Tarjetas Táctiles POS */}
            {loading ? (
              <div className="py-12 text-center text-xs text-[#64748B]">Cargando catálogo POS...</div>
            ) : filteredProductos.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
                <Package size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="font-semibold text-sm">Sin productos en esta vista</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProductos.map((prod) => {
                  const isOutOfStock = prod.stock <= 0;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => handleAddToCart(prod)}
                      disabled={isOutOfStock}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none ${
                        isOutOfStock
                          ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                          : 'bg-white border-[#E2E8F0] hover:border-[#3C50E0] hover:shadow-md active:scale-97'
                      }`}
                    >
                      <div>
                        {prod.imagen_url ? (
                          <img
                            src={prod.imagen_url}
                            alt={prod.nombre}
                            className="w-full h-20 object-cover rounded-lg mb-2"
                          />
                        ) : (
                          <div className="w-full h-16 bg-gray-50 rounded-lg mb-2 flex items-center justify-center text-gray-300">
                            <Package size={24} />
                          </div>
                        )}
                        <h4 className="font-bold text-xs text-[#1C2434] line-clamp-2 leading-tight">
                          {prod.nombre}
                        </h4>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="font-black text-sm text-[#3C50E0]">
                          {formatCurrency(prod.precio, tienda?.moneda)}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-600'
                              : prod.stock <= prod.stock_minimo
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isOutOfStock ? '0' : prod.stock} unids
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* LADO DERECHO: Carrito y Cobro POS */}
          <div className="w-full md:w-96 bg-white border border-[#E2E8F0] rounded-xl shadow-lg flex flex-col justify-between overflow-hidden">
            {/* Header Carrito POS */}
            <div className="p-4 bg-[#1C2434] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-[#80CAEE]" />
                <h3 className="font-bold text-sm">Registro de Venta POS</h3>
              </div>
              <span className="text-xs font-bold bg-[#3C50E0] px-2.5 py-0.5 rounded-full">
                {cart.length} items
              </span>
            </div>

            {/* Lista de Items POS */}
            <div className="p-4 flex-1 overflow-y-auto space-y-2.5 max-h-[350px]">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-[#64748B]">
                  <ShoppingCart size={36} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-semibold text-xs">Selecciona productos para registrar venta</p>
                </div>
              ) : (
                cart.map(({ producto, cantidad }) => (
                  <div
                    key={producto.id}
                    className="p-2.5 rounded-lg border border-[#E2E8F0] bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#1C2434] line-clamp-1">{producto.nombre}</h4>
                      <p className="text-[11px] text-[#3C50E0] font-extrabold mt-0.5">
                        {formatCurrency(producto.precio * cantidad, tienda?.moneda)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center border border-[#E2E8F0] rounded-md bg-white">
                        <button
                          onClick={() => handleUpdateQuantity(producto.id, -1)}
                          className="p-1 hover:bg-gray-100 text-gray-600 rounded-l-md"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#1C2434]">{cantidad}</span>
                        <button
                          onClick={() => handleUpdateQuantity(producto.id, 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600 rounded-r-md"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(producto.id)}
                        className="p-1 text-gray-400 hover:text-[#D34053]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Opciones de Cobro POS */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-[#E2E8F0] bg-gray-50 space-y-3 text-xs">
                {/* Selección de Método de Pago */}
                <div>
                  <label className="block font-bold text-[#1C2434] mb-1.5">Método de Pago</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setMetodoPago('efectivo')}
                      className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 text-[11px] transition-all cursor-pointer ${
                        metodoPago === 'efectivo'
                          ? 'bg-[#3C50E0] text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200'
                      }`}
                    >
                      <DollarSign size={16} /> Efectivo
                    </button>
                    <button
                      onClick={() => setMetodoPago('qr')}
                      className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 text-[11px] transition-all cursor-pointer ${
                        metodoPago === 'qr'
                          ? 'bg-[#3C50E0] text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200'
                      }`}
                    >
                      <QrCode size={16} /> Pago QR
                    </button>
                    <button
                      onClick={() => setMetodoPago('tarjeta')}
                      className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 text-[11px] transition-all cursor-pointer ${
                        metodoPago === 'tarjeta'
                          ? 'bg-[#3C50E0] text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200'
                      }`}
                    >
                      <CreditCard size={16} /> Tarjeta
                    </button>
                  </div>
                </div>

                {/* Cálculo de Cambio si es Efectivo */}
                {metodoPago === 'efectivo' && (
                  <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Efectivo Recibido</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder={total.toString()}
                        value={montoRecibidoInput}
                        onChange={(e) => setMontoRecibidoInput(e.target.value)}
                        className="w-full px-2 py-1 border rounded-md font-bold text-xs text-[#1C2434]"
                      />
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-gray-600 mb-0.5">Vuelto / Cambio</span>
                      <span className="text-base font-black text-[#219653]">
                        {formatCurrency(vuelto, tienda?.moneda)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Nombre de cliente opcional */}
                <div>
                  <input
                    type="text"
                    placeholder="Nombre del cliente (opcional)"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg bg-white text-xs"
                  />
                </div>

                {/* Resumen Total y Botón Cobrar */}
                <div className="pt-2 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm font-black">
                    <span>TOTAL A COBRAR:</span>
                    <span className="text-xl text-[#3C50E0]">{formatCurrency(total, tienda?.moneda)}</span>
                  </div>

                  <button
                    onClick={handleCheckoutPOS}
                    disabled={processingSale}
                    className="w-full bg-[#219653] hover:bg-[#1b7a43] text-white py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 size={18} />
                    {processingSale ? 'Registrando Venta...' : 'COBRAR Y REGISTRAR VENTA'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de Comprobante / Ticket POS */}
      {completedPedido && tienda && (
        <TicketModal
          isOpen={isTicketOpen}
          onClose={() => setIsTicketOpen(false)}
          pedido={completedPedido}
          tienda={tienda}
          metodoPago={metodoPago}
          montoRecibido={montoRecibido}
          vuelto={vuelto}
          onNewSale={handleNewSale}
        />
      )}
    </div>
  );
}
