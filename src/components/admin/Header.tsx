import React, { useEffect, useState, useRef } from 'react';
import { Store, User, Zap, LogOut, ChevronDown, Check, Plus, ShieldCheck } from 'lucide-react';
import { PlanTienda, Tienda } from '@/lib/types';
import { getCurrentSession, logoutUser, selectStoreSession, SesionUsuario } from '@/lib/services/auth';
import { getTiendasByPhone } from '@/lib/services/tiendas';
import Link from 'next/link';

interface HeaderProps {
  storeName?: string;
  plan?: PlanTienda;
}

export const AdminHeader: React.FC<HeaderProps> = ({ storeName, plan = 'gratis' }) => {
  const [session, setSession] = useState<SesionUsuario | null>(null);
  const [userStores, setUserStores] = useState<Tienda[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const curSes = getCurrentSession();
    setSession(curSes);

    if (curSes?.telefono) {
      getTiendasByPhone(curSes.telefono).then((stores) => {
        setUserStores(stores);
      });
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchStore = (store: Tienda) => {
    selectStoreSession(store);
    setIsDropdownOpen(false);
    window.location.href = '/admin';
  };

  const isPro = plan === 'pro';
  const displayStoreName = storeName || session?.tiendaNombre || 'Mi Tienda';
  const hasMultipleStores = userStores.length > 1;

  return (
    <>
      {/* Banner de Modo Auditor SuperAdmin */}
      {session?.rol === 'superadmin' && (
        <div className="bg-[#FFA70B] text-[#1C2434] px-6 py-2 text-xs font-black flex items-center justify-between shadow-xs border-b border-[#E08F00] z-40 relative">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>MODO SUPERADMIN: Auditando panel de "{displayStoreName}"</span>
          </div>
          <Link
            href="/superadmin"
            className="bg-[#1C2434] hover:bg-black text-white px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all flex items-center gap-1 shadow-2xs"
          >
            ← Volver a Lista de Tiendas (SuperAdmin)
          </Link>
        </div>
      )}

      <header className="bg-white border-b border-[#E2E8F0] px-6 py-3.5 flex items-center justify-between shadow-2xs relative z-30">
      <div className="flex items-center gap-2">
        <Store className="text-[#3C50E0]" size={20} />

        {/* Si tiene múltiples tiendas: Selector desplegable */}
        {hasMultipleStores ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 font-extrabold text-base text-[#1C2434] hover:text-[#3C50E0] transition-colors cursor-pointer group"
            >
              <span>{displayStoreName}</span>
              <ChevronDown size={16} className={`text-gray-400 group-hover:text-[#3C50E0] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-[#E2E8F0] shadow-xl py-2 z-50 animate-in fade-in duration-150">
                <p className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Mis Tiendas ({userStores.length})
                </p>
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                  {userStores.map((s) => {
                    const isCurrent = s.id === session?.tiendaId || s.slug === session?.tiendaSlug;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleSwitchStore(s)}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${
                          isCurrent ? 'bg-indigo-50/50 font-bold text-[#3C50E0]' : 'text-[#1C2434]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="text-xs font-bold truncate">{s.nombre}</p>
                          <p className="text-[10px] text-gray-400 truncate">/tienda/{s.slug}</p>
                        </div>
                        {isCurrent && <Check size={14} className="text-[#3C50E0] shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 px-2 mt-1 border-t border-[#E2E8F0]">
                  <Link
                    href="/crear-tienda"
                    className="w-full px-3 py-1.5 rounded-lg text-xs font-bold text-[#3C50E0] hover:bg-indigo-50 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus size={14} /> Registrar otra tienda
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <h1 className="text-base font-bold text-[#1C2434]">{displayStoreName}</h1>
        )}

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
    </>
  );
};
