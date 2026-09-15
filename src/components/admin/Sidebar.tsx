'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Settings, ExternalLink, Store, ShieldCheck, PlusCircle, Zap } from 'lucide-react';
import { getCurrentSession, SesionUsuario } from '@/lib/services/auth';

interface SidebarProps {
  slug?: string;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ slug = 'demo' }) => {
  const pathname = usePathname();
  const [session, setSession] = useState<SesionUsuario | null>(null);

  useEffect(() => {
    setSession(getCurrentSession());
  }, []);

  const isSuperAdmin = session?.rol === 'superadmin';

  const navItems = [
    { label: 'Resumen General', href: '/admin', icon: LayoutDashboard },
    { label: 'Punto de Venta (POS)', href: '/admin/pos', icon: Zap },
    { label: 'Ventas & Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
    { label: 'Productos & Stock', href: '/admin/productos', icon: Package },
    { label: 'Ajustes de Tienda', href: '/admin/configuracion', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#1C2434] text-white min-h-screen flex flex-col justify-between p-4 flex-shrink-0">
      <div>
        {/* Brand logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-[#2E3A47]">
          <div className="w-9 h-9 rounded-xl bg-[#3C50E0] flex items-center justify-center font-bold text-white shadow-xs">
            <Store size={20} />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-wide text-white leading-tight">Panel Tienda</h2>
            <p className="text-[11px] text-[#AEB7C0]">Control de Inventario</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#333A48] text-white shadow-xs'
                    : 'text-[#AEB7C0] hover:bg-[#333A48]/50 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#3C50E0]' : ''} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Botón rápido crear nueva tienda */}
        <div className="mt-6 pt-4 border-t border-[#2E3A47]">
          <Link
            href="/crear-tienda"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#3C50E0]/20 text-[#80CAEE] border border-[#3C50E0]/40 text-xs font-bold hover:bg-[#3C50E0]/30 transition-colors"
          >
            <PlusCircle size={16} /> + Crear Nueva Tienda
          </Link>
        </div>
      </div>

      {/* Secciones inferiores */}
      <div className="pt-4 border-t border-[#2E3A47] space-y-2">
        {/* Solo el SuperAdmin tiene acceso visible al Panel SuperAdmin */}
        {isSuperAdmin && (
          <Link
            href="/superadmin"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-[#FFA70B] bg-[#FFA70B]/10 border border-[#FFA70B]/30 hover:bg-[#FFA70B]/20 transition-colors"
          >
            <ShieldCheck size={16} /> Panel SuperAdmin
          </Link>
        )}

        <a
          href={`/tienda/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#24303F] text-xs font-semibold text-white hover:bg-[#333A48] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Store size={16} className="text-[#80CAEE]" /> Ver Tienda Pública
          </span>
          <ExternalLink size={14} className="text-[#AEB7C0]" />
        </a>
      </div>
    </aside>
  );
};
