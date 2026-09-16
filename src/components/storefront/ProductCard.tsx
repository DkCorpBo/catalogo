'use client';

import React from 'react';
import { Producto } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';
import { Plus, Check, PackageX, ZoomIn } from 'lucide-react';

interface ProductCardProps {
  producto: Producto;
  currency?: string;
  onAddToCart: (producto: Producto) => void;
  onViewDetails?: (producto: Producto) => void;
  added?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  producto,
  currency = 'USD',
  onAddToCart,
  onViewDetails,
  added = false,
}) => {
  const isOutOfStock = producto.stock <= 0 || !producto.disponible;

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(producto);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group">
      <div onClick={handleCardClick} className="cursor-pointer">
        {producto.imagen_url ? (
          <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Overlay sutil para indicar que se puede ampliar la foto */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-white/90 text-[#1C2434] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                <ZoomIn size={13} /> Ver foto
              </span>
            </div>

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-black text-xs uppercase tracking-wider">
                Agotado
              </div>
            )}
          </div>
        ) : (
          <div className="h-36 bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-1 border-b border-gray-100">
            <PackageX size={28} />
            <span className="text-[10px]">Sin foto</span>
          </div>
        )}

        <div className="p-4 space-y-1">
          <h3 className="font-extrabold text-[#1C2434] text-sm leading-snug group-hover:text-[#3C50E0] transition-colors">
            {producto.nombre}
          </h3>
          {producto.descripcion && (
            <p className="text-xs text-[#64748B] line-clamp-2">{producto.descripcion}</p>
          )}
        </div>
      </div>

      <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-100 mt-2 pt-3">
        <div>
          <span className="text-[10px] text-[#64748B] block font-medium uppercase">Precio</span>
          <span className="text-base font-black text-[#3C50E0]">
            {formatCurrency(producto.precio, currency)}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(producto);
          }}
          disabled={isOutOfStock}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : added
              ? 'bg-[#219653] text-white shadow-xs'
              : 'bg-[#3C50E0] hover:bg-[#2e3fb8] text-white shadow-xs active:scale-95'
          }`}
        >
          {added ? (
            <>
              <Check size={16} /> Añadido
            </>
          ) : (
            <>
              <Plus size={16} /> Agregar
            </>
          )}
        </button>
      </div>
    </div>
  );
};
