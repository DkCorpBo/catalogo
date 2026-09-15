import React from 'react';
import { Producto } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';
import { Plus, Check, PackageX } from 'lucide-react';

interface ProductCardProps {
  producto: Producto;
  currency?: string;
  onAddToCart: (producto: Producto) => void;
  added?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  producto,
  currency = 'USD',
  onAddToCart,
  added = false,
}) => {
  const isOutOfStock = producto.stock <= 0 || !producto.disponible;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        {producto.imagen_url ? (
          <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                Agotado
              </div>
            )}
          </div>
        ) : (
          <div className="h-32 bg-gray-50 flex items-center justify-center text-gray-400">
            <PackageX size={32} />
          </div>
        )}

        <div className="p-4">
          <h3 className="font-bold text-[#1C2434] text-base leading-snug">{producto.nombre}</h3>
          {producto.descripcion && (
            <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{producto.descripcion}</p>
          )}
        </div>
      </div>

      <div className="p-4 pt-0 flex items-center justify-between mt-2 border-t border-gray-100 pt-3">
        <div>
          <span className="text-xs text-[#64748B] block">Precio</span>
          <span className="text-base font-extrabold text-[#3C50E0]">
            {formatCurrency(producto.precio, currency)}
          </span>
        </div>

        <button
          onClick={() => onAddToCart(producto)}
          disabled={isOutOfStock}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
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
