'use client';

import React, { useEffect, useState } from 'react';
import { getAllTiendas, updatePlanTienda, updateTiendaConfig } from '@/lib/services/tiendas';
import { getCurrentSession, logoutUser, SesionUsuario } from '@/lib/services/auth';
import { Tienda, PlanTienda } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { ShieldCheck, Store, ExternalLink, Zap, Lock, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminPage() {
  const [session, setSession] = useState<SesionUsuario | null>(null);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setSession(getCurrentSession());
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await getAllTiendas();
    setTiendas(data);
    setLoading(false);
  }

  const handleTogglePlan = async (tiendaId: string, currentPlan: PlanTienda) => {
    setUpdatingId(tiendaId);
    const newPlan: PlanTienda = currentPlan === 'pro' ? 'gratis' : 'pro';
    await updatePlanTienda(tiendaId, newPlan);
    await loadData();
    setUpdatingId(null);
  };

  const handleToggleActivo = async (tienda: Tienda) => {
    setUpdatingId(tienda.id);
    await updateTiendaConfig(tienda.id, { activo: !tienda.activo });
    await loadData();
    setUpdatingId(null);
  };

  const totalTiendas = tiendas.length;
  const tiendasActivas = tiendas.filter((t) => t.activo).length;
  const tiendasPro = tiendas.filter((t) => t.plan === 'pro').length;

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1C2434]">
      {/* Header SuperAdmin con botón Cerrar Sesión */}
      <header className="bg-[#1C2434] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3C50E0] flex items-center justify-center font-bold text-white shadow-xs">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight">Panel SuperAdmin</h1>
            <p className="text-xs text-[#AEB7C0]">Gestión Global de Tiendas y Planes</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-xs text-white bg-[#24303F] hover:bg-[#333A48] px-3.5 py-2 rounded-lg font-bold transition-colors"
          >
            Ver Tienda Demo
          </Link>
          <Link
            href="/crear-tienda"
            className="bg-[#3C50E0] hover:bg-[#2e3fb8] text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            + Registrar Tienda
          </Link>

          {/* Botón de Cerrar Sesión */}
          <button
            onClick={logoutUser}
            className="bg-[#D34053]/20 hover:bg-[#D34053]/40 text-[#D34053] border border-[#D34053]/30 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-2 cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Banner informativo */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#1C2434]">Control Central de Tiendas</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Administra todas las tiendas registradas, activa sus suscripciones al Plan Pro o modifica sus límites.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-[#3C50E0]/10 text-[#3C50E0] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#3C50E0]/20">
            <Zap size={16} /> Monetización Freemium Activa
          </div>
        </div>

        {/* Tarjetas de Métricas Globales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total de Tiendas"
            value={totalTiendas}
            icon={<Store size={22} />}
            variant="default"
            subtext={`${tiendasActivas} tiendas activas`}
          />
          <StatCard
            title="Suscripciones Plan Pro"
            value={tiendasPro}
            icon={<Zap size={22} />}
            variant="success"
            subtext="Tiendas con productos ilimitados"
          />
          <StatCard
            title="Tiendas Plan Gratuito"
            value={totalTiendas - tiendasPro}
            icon={<Lock size={22} />}
            variant="warning"
            subtext="Limitadas a 5 productos"
          />
        </div>

        {/* Tabla de Tiendas */}
        <Card title="Tiendas Registradas en la Plataforma">
          {loading ? (
            <div className="py-8 text-center text-xs text-[#64748B]">Cargando tiendas...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-gray-50 text-[11px] font-extrabold uppercase text-[#64748B]">
                    <th className="py-3 px-4">Comercio / Tienda</th>
                    <th className="py-3 px-4">Slug URL</th>
                    <th className="py-3 px-4">WhatsApp Pedidos</th>
                    <th className="py-3 px-4 text-center">Plan Actual</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs font-medium text-[#1C2434]">
                  {tiendas.map((t) => {
                    const isPro = t.plan === 'pro';
                    return (
                      <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#1C2434]">
                          <div className="flex items-center gap-2.5">
                            {t.logo_url ? (
                              <img
                                src={t.logo_url}
                                alt={t.nombre}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#3C50E0]/10 text-[#3C50E0] flex items-center justify-center font-bold text-xs">
                                <Store size={16} />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-[#1C2434]">{t.nombre}</p>
                              <p className="text-[10px] text-[#64748B]">{t.moneda || 'USD'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#3C50E0]">
                          <a
                            href={`/tienda/${t.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            /tienda/{t.slug} <ExternalLink size={12} />
                          </a>
                        </td>
                        <td className="py-3 px-4 text-[#64748B]">{t.whatsapp_number}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleTogglePlan(t.id, t.plan)}
                            disabled={updatingId === t.id}
                            className={`px-3 py-1 rounded-full text-[11px] font-extrabold border transition-all cursor-pointer ${
                              isPro
                                ? 'bg-[#219653]/10 text-[#219653] border-[#219653]/30 hover:bg-[#219653]/20'
                                : 'bg-[#FFA70B]/10 text-[#FFA70B] border-[#FFA70B]/30 hover:bg-[#FFA70B]/20'
                            }`}
                          >
                            {isPro ? '★ Plan Pro (Ilimitado)' : 'Plan Gratuito (5 prods)'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleActivo(t)}
                            disabled={updatingId === t.id}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                              t.activo
                                ? 'bg-gray-100 text-gray-700 border-gray-300'
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}
                          >
                            {t.activo ? 'Activa' : 'Inactiva'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`/tienda/${t.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#3C50E0] hover:bg-[#2e3fb8] text-white rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1"
                          >
                            Ver Tienda <ExternalLink size={12} />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
