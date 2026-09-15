'use client';

import React, { useEffect, useState } from 'react';
import { Store, User, Zap, LogOut } from 'lucide-react';
import { PlanTienda } from '@/lib/types';
import { getCurrentSession, logoutUser, SesionUsuario } from '@/lib/services/auth';

interface HeaderProps {
  storeName?: string;
  plan?: PlanTienda;
}

export const AdminHeader: React.FC<HeaderProps> = ({ storeName, plan = 'gratis' }) => {
  const [session, setSession] = useState<SesionUsuario | null>(null);

  useEffect(() => {
    setSession(getCurrentSession());
  }, []);

  const isPro = plan === 'pro';
  const displayStoreName = storeName || session?.tiendaNombre || 'Mi Tienda';

  return (
    <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-2">
        <Store className="text-[#3C50E0]" size={20} />
        <h1 className="text-base font-bold text-[#1C2434]">{displayStoreName}</h1>

        <span
          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ml-2 flex items-center gap-1 ${
            isPro
              ? 'bg-[#219653]/10 text-[#219653] border-[#219653]/30'
              : 'bg-[#FFA70B]/10 text-[#FFA70B] border-[#FFA70B]/30'
          }`}
        >
          {isPro ? (
            <>
              <Zap size={12} /> Plan Pro
            </>
          ) : (
            'Plan Gratuito (Max 5 Prods)'
          )}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#3C50E0]/10 text-[#3C50E0] flex items-center justify-center font-bold text-xs">
          <User size={16} />
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-xs font-bold text-[#1C2434]">{session?.nombre || 'Dueño de Tienda'}</p>
          <p className="text-[10px] text-[#64748B]">@{session?.username || 'admin'}</p>
        </div>

        <button
          onClick={logoutUser}
          className="p-2 text-gray-400 hover:text-[#D34053] hover:bg-red-50 rounded-lg transition-colors ml-2"
          title="Cerrar Sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
