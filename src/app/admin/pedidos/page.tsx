'use client';

import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getPedidosByTiendaId, updateEstadoPedido } from '@/lib/services/pedidos';
import { getTiendaBySlug } from '@/lib/services/tiendas';
import { getCurrentSession, SesionUsuario } from '@/lib/services/auth';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Pedido, EstadoPedido, Tienda } from '@/lib/types';
import { ShoppingCart, Eye, Check } from 'lucide-react';

export default function AdminPedidosPage() {
  const [session, setSession] = useState<SesionUsuario | null>(null);
  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [selectedEstadoFilter, setSelectedEstadoFilter] = useState<string>('todos');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadPedidos();
  }, []);

  async function loadPedidos() {
    setLoading(true);
    const currentSes = getCurrentSession();
    setSession(currentSes);

    const targetSlug = currentSes?.tiendaSlug || 'demo';
    const store = await getTiendaBySlug(targetSlug);
    setTienda(store);

    if (store) {
      const peds = await getPedidosByTiendaId(store.id);
      setPedidos(peds);
    }
    setLoading(false);
  }

  const handleUpdateStatus = async (pedidoId: string, newStatus: EstadoPedido) => {
    setUpdatingId(pedidoId);
    await updateEstadoPedido(pedidoId, newStatus);
    await loadPedidos();
    if (selectedPedido && selectedPedido.id === pedidoId) {
      setSelectedPedido((prev) => (prev ? { ...prev, estado: newStatus } : null));
    }
    setUpdatingId(null);
  };

  const filteredPedidos = pedidos.filter((p) =>
    selectedEstadoFilter === 'todos' ? true : p.estado === selectedEstadoFilter
  );

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <AdminSidebar slug={tienda?.slug || session?.tiendaSlug || 'demo'} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader storeName={tienda?.nombre} plan={tienda?.plan} />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[#1C2434]">Gestión de Ventas y Pedidos</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Administra los pedidos de tus clientes, confirma entregas y actualiza automáticamente el inventario.
              </p>
            </div>
          </div>

          {/* Filtros de estado */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['todos', 'pendiente', 'confirmado', 'completado', 'cancelado'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedEstadoFilter(st)}
                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  selectedEstadoFilter === st
                    ? 'bg-[#3C50E0] text-white shadow-xs'
                    : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-gray-50'
                }`}
              >
                {st === 'todos' ? `Todos (${pedidos.length})` : st}
              </button>
            ))}
          </div>

          {/* Tabla de Pedidos */}
          <Card>
            {loading ? (
              <div className="py-8 text-center text-xs text-[#64748B]">Cargando pedidos...</div>
            ) : filteredPedidos.length === 0 ? (
              <div className="py-12 text-center text-[#64748B]">
                <ShoppingCart size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="font-semibold text-sm">No hay pedidos en esta categoría</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-gray-50 text-[11px] font-extrabold uppercase text-[#64748B]">
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">WhatsApp</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs font-medium text-[#1C2434]">
                    {filteredPedidos.map((ped) => (
                      <tr key={ped.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#3C50E0]">#{ped.id.slice(0, 8)}</td>
                        <td className="py-3 px-4 font-bold">{ped.cliente_nombre}</td>
                        <td className="py-3 px-4 text-[#64748B]">{ped.cliente_whatsapp}</td>
                        <td className="py-3 px-4 text-[#64748B]">{formatDate(ped.created_at)}</td>
                        <td className="py-3 px-4 font-extrabold text-[#1C2434]">
                          {formatCurrency(ped.total, tienda?.moneda)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge status={ped.estado} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedPedido(ped)}
                              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Ver detalle del pedido"
                            >
                              <Eye size={16} />
                            </button>

                            {ped.estado === 'pendiente' && (
                              <button
                                onClick={() => handleUpdateStatus(ped.id, 'confirmado')}
                                disabled={updatingId === ped.id}
                                className="px-2.5 py-1 bg-[#3C50E0] hover:bg-[#2e3fb8] text-white rounded-md text-[11px] font-bold transition-all cursor-pointer"
                              >
                                Confirmar
                              </button>
                            )}

                            {ped.estado === 'confirmado' && (
                              <button
                                onClick={() => handleUpdateStatus(ped.id, 'completado')}
                                disabled={updatingId === ped.id}
                                className="px-2.5 py-1 bg-[#219653] hover:bg-[#1b7a43] text-white rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Check size={12} /> Completar
                              </button>
                            )}
                          </div>
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

      {/* Modal de Detalle del Pedido */}
      {selectedPedido && (
        <Modal
          isOpen={!!selectedPedido}
          onClose={() => setSelectedPedido(null)}
          title={`Detalle del Pedido #${selectedPedido.id.slice(0, 8)}`}
          footer={
            <div className="flex items-center gap-2">
              {selectedPedido.estado === 'pendiente' && (
                <button
                  onClick={() => handleUpdateStatus(selectedPedido.id, 'confirmado')}
                  className="px-4 py-2 bg-[#3C50E0] text-white rounded-lg text-xs font-bold hover:bg-[#2e3fb8]"
                >
                  Confirmar y Descontar Stock
                </button>
              )}
              {selectedPedido.estado !== 'completado' && selectedPedido.estado !== 'cancelado' && (
                <button
                  onClick={() => handleUpdateStatus(selectedPedido.id, 'completado')}
                  className="px-4 py-2 bg-[#219653] text-white rounded-lg text-xs font-bold hover:bg-[#1b7a43]"
                >
                  Marcar Completado
                </button>
              )}
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="bg-gray-50 p-3 rounded-lg border border-[#E2E8F0] space-y-1">
              <p>
                <strong className="text-[#1C2434]">Cliente:</strong> {selectedPedido.cliente_nombre}
              </p>
              <p>
                <strong className="text-[#1C2434]">WhatsApp:</strong> {selectedPedido.cliente_whatsapp}
              </p>
              <p>
                <strong className="text-[#1C2434]">Dirección:</strong>{' '}
                {selectedPedido.cliente_direccion || 'Sin especificar'}
              </p>
              <p>
                <strong className="text-[#1C2434]">Estado Actual:</strong> <Badge status={selectedPedido.estado} />
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm text-[#1C2434] mb-2">Items Solicitados:</h4>
              <div className="divide-y divide-[#E2E8F0] border rounded-lg overflow-hidden bg-white">
                {selectedPedido.detalles?.map((det, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#1C2434]">{det.producto_nombre}</p>
                      <p className="text-[11px] text-[#64748B]">
                        {det.cantidad}x {formatCurrency(det.precio_unitario, tienda?.moneda)}
                      </p>
                    </div>
                    <span className="font-extrabold text-[#3C50E0]">
                      {formatCurrency(det.subtotal, tienda?.moneda)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t text-sm font-extrabold">
              <span>Total del Pedido:</span>
              <span className="text-[#3C50E0] text-base">
                {formatCurrency(selectedPedido.total, tienda?.moneda)}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
