'use client';

import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/Header';
import { OnboardingWizard } from '@/components/admin/OnboardingWizard';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getKpisByTiendaId, getPedidosByTiendaId } from '@/lib/services/pedidos';
import { getTiendaBySlug } from '@/lib/services/tiendas';
import { getCurrentSession, SesionUsuario } from '@/lib/services/auth';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Pedido, Tienda } from '@/lib/types';
import { DollarSign, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShoppingCart, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [session, setSession] = useState<SesionUsuario | null>(null);
  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [kpis, setKpis] = useState({
    ventasTotales: 0,
    pedidosPendientes: 0,
    pedidosCompletados: 0,
    productosStockBajo: 0,
    totalProductos: 0,
  });
  const [pedidosRecientes, setPedidosRecientes] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const currentSes = getCurrentSession();
      setSession(currentSes);

      const targetSlug = currentSes?.tiendaSlug || 'demo';
      const store = await getTiendaBySlug(targetSlug);
      setTienda(store);

      if (store) {
        const [kpiData, peds] = await Promise.all([
          getKpisByTiendaId(store.id),
          getPedidosByTiendaId(store.id),
        ]);
        setKpis(kpiData);
        setPedidosRecientes(peds.slice(0, 5));
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <AdminSidebar slug={tienda?.slug || session?.tiendaSlug || 'demo'} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader storeName={tienda?.nombre} plan={tienda?.plan} />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Header de Bienvenida */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[#1C2434]">Resumen de Control</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Estado general de ventas, inventario y pedidos de {tienda?.nombre || 'tu tienda'}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/productos"
                className="bg-[#3C50E0] hover:bg-[#2e3fb8] text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs"
              >
                <Plus size={16} /> Crear Producto
              </Link>
            </div>
          </div>

          {/* Onboarding Wizard de Configuración Inicial */}
          {tienda && (
            <OnboardingWizard tienda={tienda} productosCount={kpis.totalProductos} />
          )}

          {/* Tarjetas de KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Ventas Totales"
              value={formatCurrency(kpis.ventasTotales, tienda?.moneda)}
              icon={<DollarSign size={22} />}
              variant="success"
              subtext="Monto generado por ventas"
            />
            <StatCard
              title="Pedidos Pendientes"
              value={kpis.pedidosPendientes}
              icon={<Clock size={22} />}
              variant="warning"
              subtext="Requieren confirmación"
            />
            <StatCard
              title="Pedidos Completados"
              value={kpis.pedidosCompletados}
              icon={<CheckCircle2 size={22} />}
              variant="default"
              subtext="Entregados exitosamente"
            />
            <StatCard
              title="Alertas de Stock Bajo"
              value={kpis.productosStockBajo}
              icon={<AlertTriangle size={22} />}
              variant="danger"
              subtext={`De ${kpis.totalProductos} productos totales`}
            />
          </div>

          {/* Tabla de Pedidos Recientes */}
          <Card
            title="Pedidos Recientes por WhatsApp"
            subtitle="Últimos pedidos registrados desde el catálogo público de tu tienda"
            action={
              <Link
                href="/admin/pedidos"
                className="text-xs font-bold text-[#3C50E0] hover:underline flex items-center gap-1"
              >
                Ver todos <ArrowRight size={14} />
              </Link>
            }
          >
            {loading ? (
              <div className="py-8 text-center text-xs text-[#64748B]">Cargando datos...</div>
            ) : pedidosRecientes.length === 0 ? (
              <div className="py-8 text-center text-[#64748B]">
                <ShoppingCart size={36} className="mx-auto mb-2 text-gray-300" />
                <p className="font-semibold text-sm">No hay pedidos registrados aún</p>
                <p className="text-xs text-gray-400 mt-1">Comparte el enlace de tu tienda para comenzar a recibir ventas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-gray-50 text-[11px] font-extrabold uppercase text-[#64748B]">
                      <th className="py-3 px-4">N° Pedido</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Dirección</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs font-medium text-[#1C2434]">
                    {pedidosRecientes.map((ped) => (
                      <tr key={ped.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#3C50E0]">#{ped.id.slice(0, 8)}</td>
                        <td className="py-3 px-4 font-bold">{ped.cliente_nombre}</td>
                        <td className="py-3 px-4 text-[#64748B] max-w-xs truncate">
                          {ped.cliente_direccion || 'Sin dirección'}
                        </td>
                        <td className="py-3 px-4 text-[#64748B]">{formatDate(ped.created_at)}</td>
                        <td className="py-3 px-4 font-extrabold text-[#1C2434]">
                          {formatCurrency(ped.total, tienda?.moneda)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge status={ped.estado} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
