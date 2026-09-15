'use client';

import React, { useState } from 'react';
import { CartItem, Tienda } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';
import { createWhatsAppOrderUrl } from '@/lib/utils/whatsapp';
import { createPedido } from '@/lib/services/pedidos';
import { X, Plus, Minus, Trash2, Send, ShoppingCart } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  tienda: Tienda;
  onUpdateQuantity: (productoId: string, delta: number) => void;
  onRemoveItem: (productoId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  tienda,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo para continuar.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      // 1. Guardar el pedido en estado 'pendiente' en la Base de Datos Supabase
      const pedidoDetalles = items.map((i) => ({
        producto_id: i.producto.id,
        producto_nombre: i.producto.nombre,
        precio_unitario: i.producto.precio,
        cantidad: i.cantidad,
        subtotal: i.producto.precio * i.cantidad,
      }));

      const newPedido = await createPedido(
        {
          tienda_id: tienda.id,
          cliente_nombre: customerName.trim(),
          cliente_whatsapp: customerPhone.trim() || 'No especificado',
          cliente_direccion: customerAddress.trim() || undefined,
          total,
          estado: 'pendiente',
        },
        pedidoDetalles
      );

      // 2. Generar el enlace directo a WhatsApp
      const waUrl = createWhatsAppOrderUrl(tienda.whatsapp_number, {
        storeName: tienda.nombre,
        customerName: customerName.trim(),
        address: customerAddress.trim(),
        items,
        total,
        currency: tienda.moneda || 'USD',
        orderId: newPedido?.id,
      });

      // 3. Abrir WhatsApp en pestaña nueva o aplicación móvil
      window.open(waUrl, '_blank');

      // 4. Limpiar carrito y cerrar modal
      onClearCart();
      onClose();
    } catch (err) {
      console.error('Error al procesar pedido por WhatsApp:', err);
      setErrorMsg('Ocurrió un inconveniente al generar el pedido. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-250">
        {/* Header del Carrito */}
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-[#3C50E0]" />
            <h2 className="font-bold text-lg text-[#1C2434]">Tu Carrito de Compras</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de Productos en el Carrito */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-[#64748B]">
              <ShoppingCart size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-base">Tu carrito está vacío</p>
              <p className="text-xs text-gray-400 mt-1">Explora nuestro catálogo y agrega tus productos favoritos.</p>
            </div>
          ) : (
            items.map(({ producto, cantidad }) => (
              <div
                key={producto.id}
                className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-white shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  {producto.imagen_url && (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-[#1C2434] line-clamp-1">{producto.nombre}</h4>
                    <p className="text-xs text-[#3C50E0] font-extrabold mt-0.5">
                      {formatCurrency(producto.precio * cantidad, tienda.moneda)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-[#E2E8F0] rounded-lg bg-gray-50">
                    <button
                      onClick={() => onUpdateQuantity(producto.id, -1)}
                      className="p-1 hover:bg-gray-200 text-gray-600 rounded-l-lg"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-2 text-xs font-bold text-[#1C2434]">{cantidad}</span>
                    <button
                      onClick={() => onUpdateQuantity(producto.id, 1)}
                      className="p-1 hover:bg-gray-200 text-gray-600 rounded-r-lg"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(producto.id)}
                    className="p-1.5 text-gray-400 hover:text-[#D34053] hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Formulario de Datos del Cliente */}
          {items.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#E2E8F0] space-y-3 bg-gray-50 p-4 rounded-xl border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C2434]">
                Datos de Entrega / Pedido
              </h3>

              <div>
                <label className="block text-xs font-semibold text-[#1C2434] mb-1">
                  Tu Nombre Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ej: María Ramos"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white focus:outline-hidden focus:border-[#3C50E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2434] mb-1">
                  Tu WhatsApp / Teléfono (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: +591 70000000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white focus:outline-hidden focus:border-[#3C50E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2434] mb-1">
                  Dirección de Entrega / Notas
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Av. Las Palmas #450, entregar en portería."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white focus:outline-hidden focus:border-[#3C50E0]"
                />
              </div>

              {errorMsg && <p className="text-xs text-[#D34053] font-semibold">{errorMsg}</p>}
            </div>
          )}
        </div>

        {/* Footer y Botón Enviar Pedido a WhatsApp */}
        {items.length > 0 && (
          <div className="p-4 border-t border-[#E2E8F0] bg-white space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#64748B]">Total del Pedido:</span>
              <span className="text-xl font-extrabold text-[#3C50E0]">
                {formatCurrency(total, tienda.moneda)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-[#219653] hover:bg-[#1b7a43] text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Send size={18} />
              {loading ? 'Procesando Pedido...' : 'Pedir por WhatsApp'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
