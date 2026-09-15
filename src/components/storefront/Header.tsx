import React from 'react';
import { Tienda } from '@/lib/types';
import { ShoppingBag, Store } from 'lucide-react';

interface HeaderProps {
  tienda: Tienda;
  cartCount: number;
  onOpenCart: () => void;
}

export const StoreHeader: React.FC<HeaderProps> = ({ tienda, cartCount, onOpenCart }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {tienda.logo_url ? (
            <img
              src={tienda.logo_url}
              alt={tienda.nombre}
              className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#3C50E0]/10 text-[#3C50E0] flex items-center justify-center font-bold">
              <Store size={20} />
            </div>
          )}
          <div>
            <h1 className="text-base font-bold text-[#1C2434] leading-tight">{tienda.nombre}</h1>
            {tienda.descripcion && (
              <p className="text-xs text-[#64748B] line-clamp-1">{tienda.descripcion}</p>
            )}
          </div>
        </div>

        <button
          onClick={onOpenCart}
          className="relative flex items-center gap-2 bg-[#3C50E0] hover:bg-[#2e3fb8] text-white px-3.5 py-2 rounded-lg text-sm font-semibold transition-all shadow-xs active:scale-95"
        >
          <ShoppingBag size={18} />
          <span className="hidden sm:inline">Carrito</span>
          {cartCount > 0 && (
            <span className="bg-[#219653] text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
