'use client';

import React, { useState } from 'react';
import { Producto } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';
import { X, Plus, Minus, Check, ShoppingBag, Package } from 'lucide-react';

interface ProductDetailModalProps {
  producto: Producto | null;
  onClose: () => void;
  currency?: string;
  onAddToCart: (producto: Producto, cantidad: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  producto,
  onClose,
  currency = 'USD',
  onAddToCart,
}) => {
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);

  if (!producto) return null;

  const isOutOfStock = producto.stock <= 0 || !producto.disponible;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(producto, cantidad);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 relative">
        {/* Botón Cerrar Flotante */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X size={18} />
        </button>

        {/* Imagen del Producto en Alta Resolución */}
        <div className="relative w-full h-64 sm:h-80 bg-gray-100 flex-shrink-0">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <Package size={48} />
              <span className="text-xs font-semibold">Sin imagen disponible</span>
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-sm uppercase tracking-widest">
              Agotado
            </div>
          )}
        </div>

        {/* Información Detallada */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-[#1C2434] leading-snug">{producto.nombre}</h2>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {isOutOfStock ? 'Agotado' : 'Disponible en Stock'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#64748B] block font-medium">Precio</span>
              <span className="text-2xl font-black text-[#3C50E0]">
                {formatCurrency(producto.precio, currency)}
              </span>
            </div>
          </div>

          {producto.descripcion && (
            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-xs text-[#64748B] leading-relaxed">
              <span className="font-bold text-[#1C2434] block mb-1">Detalles / Nota del producto:</span>
              <p className="whitespace-pre-line">{producto.descripcion}</p>
            </div>
          )}

          {/* Selector de Cantidad y Botón Agregar */}
          {!isOutOfStock && (
            <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
              <div className="flex items-center border rounded-xl border-[#E2E8F0] bg-gray-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                  className="p-3 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer"
                >
                  <Minus size={16} />
                </button>
                <span className="px-3 text-sm font-black text-[#1C2434] min-w-[2.5rem] text-center">
                  {cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => setCantidad((prev) => prev + 1)}
                  className="p-3 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                  added ? 'bg-[#219653] text-white' : 'bg-[#3C50E0] hover:bg-[#2e3fb8] text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check size={18} /> ¡Añadido al Carrito!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Agregar ({formatCurrency(producto.precio * cantidad, currency)})
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
