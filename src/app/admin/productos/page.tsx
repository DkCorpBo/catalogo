'use client';

import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/Header';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { UpgradeModal } from '@/components/admin/UpgradeModal';
import { CreateProductModal } from '@/components/admin/CreateProductModal';
import { getProductosByTiendaId, updateProducto, deleteProducto } from '@/lib/services/productos';
import { getTiendaBySlug } from '@/lib/services/tiendas';
import { getCurrentSession, SesionUsuario } from '@/lib/services/auth';
import { formatCurrency } from '@/lib/utils/formatters';
import { Producto, Tienda } from '@/lib/types';
import { Package, Plus, Edit2, Trash2, AlertTriangle, Zap, Camera } from 'lucide-react';

export default function AdminProductosPage() {
  const [session, setSession] = useState<SesionUsuario | null>(null);
  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingStockProduct, setEditingStockProduct] = useState<Producto | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);

  useEffect(() => {
    loadProductos();
  }, []);

  async function loadProductos() {
    setLoading(true);
    const currentSes = getCurrentSession();
    setSession(currentSes);

    const targetSlug = currentSes?.tiendaSlug || 'demo';
    const store = await getTiendaBySlug(targetSlug);
    setTienda(store);

    if (store) {
      const prods = await getProductosByTiendaId(store.id);
      setProductos(prods);
    }
    setLoading(false);
  }

  const handleOpenCreateModal = () => {
    // Verificar límite del Plan Gratuito (Max 5 productos)
    if (tienda && tienda.plan === 'gratis' && productos.length >= (tienda.max_productos || 5)) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleProductCreated = () => {
    loadProductos();
  };

  const handleSaveStock = async () => {
    if (!editingStockProduct) return;
    await updateProducto(editingStockProduct.id, { stock: newStockValue });
    setEditingStockProduct(null);
    await loadProductos();
  };

  const handleToggleDisponible = async (prod: Producto) => {
    await updateProducto(prod.id, { disponible: !prod.disponible });
    await loadProductos();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto del inventario?')) {
      await deleteProducto(id);
      await loadProductos();
    }
  };

  const isLimitReached = tienda?.plan === 'gratis' && productos.length >= (tienda?.max_productos || 5);

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <AdminSidebar slug={tienda?.slug || session?.tiendaSlug || 'demo'} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader storeName={tienda?.nombre} plan={tienda?.plan} />

        <main className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Header de página */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[#1C2434]">Inventario de Productos</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Carga productos con foto de cámara, controla el stock y configura precios. ({productos.length} de {tienda?.plan === 'pro' ? '∞' : tienda?.max_productos || 5} prods)
              </p>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="bg-[#3C50E0] hover:bg-[#2e3fb8] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
            >
              <Camera size={16} /> Cargar Producto
            </button>
          </div>

          {/* Banner si alcanzó el límite del Plan Gratuito */}
          {isLimitReached && (
            <div className="bg-[#FFA70B]/10 border border-[#FFA70B]/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Zap className="text-[#FFA70B] flex-shrink-0" size={20} />
                <p className="text-xs font-bold text-[#1C2434]">
                  Has alcanzado el límite de 5 productos del Plan Gratuito.
                </p>
              </div>
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="bg-[#FFA70B] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                Actualizar a Plan Pro
              </button>
            </div>
          )}

          {/* Tabla / Grid de Productos */}
          <Card>
            {loading ? (
              <div className="py-8 text-center text-xs text-[#64748B]">Cargando inventario...</div>
            ) : productos.length === 0 ? (
              <div className="py-12 text-center text-[#64748B] space-y-3">
                <Package size={44} className="mx-auto text-gray-300" />
                <div>
                  <p className="font-extrabold text-sm text-[#1C2434]">Aún no tienes productos en tu catálogo</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Toma una foto con tu cámara o sube una imagen para publicar tu primer producto.
                  </p>
                </div>
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 bg-[#219653] hover:bg-[#1b7a43] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <Camera size={16} /> Tomar Foto y Crear Producto
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-gray-50 text-[11px] font-extrabold uppercase text-[#64748B]">
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4">Precio Venta</th>
                      <th className="py-3 px-4 text-center">Stock Disponible</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs font-medium text-[#1C2434]">
                    {productos.map((prod) => {
                      const isLowStock = prod.stock <= (prod.stock_minimo || 3);
                      return (
                        <tr key={prod.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {prod.imagen_url ? (
                                <img
                                  src={prod.imagen_url}
                                  alt={prod.nombre}
                                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-2xs"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                  <Package size={22} />
                                </div>
                              )}
                              <div>
                                <p className="font-extrabold text-[#1C2434] text-sm">{prod.nombre}</p>
                                {prod.descripcion && (
                                  <p className="text-[11px] text-[#64748B] line-clamp-1 max-w-xs">{prod.descripcion}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-black text-sm text-[#3C50E0]">
                            {formatCurrency(prod.precio, tienda?.moneda)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5 font-bold">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-xs ${
                                  isLowStock
                                    ? 'bg-[#D34053]/10 text-[#D34053] border border-[#D34053]/20 font-extrabold'
                                    : 'bg-gray-100 text-[#1C2434]'
                                }`}
                              >
                                {prod.stock} unids
                              </span>
                              {isLowStock && (
                                <span title="Stock Bajo">
                                  <AlertTriangle size={14} className="text-[#D34053]" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleDisponible(prod)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                                prod.disponible
                                  ? 'bg-[#219653]/10 text-[#219653] border-[#219653]/30 hover:bg-[#219653]/20'
                                  : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              {prod.disponible ? 'Disponible' : 'Agotado'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingStockProduct(prod);
                                  setNewStockValue(prod.stock);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                                title="Ajustar inventario"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-2 text-[#D34053] hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Eliminar producto"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
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

      {/* Modal Reutilizable para Cargar Productos */}
      {tienda && (
        <CreateProductModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          tienda={tienda}
          currentProductsCount={productos.length}
          onSuccess={handleProductCreated}
          onUpgradeRequired={() => setIsUpgradeModalOpen(true)}
        />
      )}

      {/* Modal para Editar Stock */}
      {editingStockProduct && (
        <Modal
          isOpen={!!editingStockProduct}
          onClose={() => setEditingStockProduct(null)}
          title={`Ajustar Stock: ${editingStockProduct.nombre}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-gray-600">Modifica el inventario disponible de este producto:</p>
            <div>
              <label className="block font-bold text-[#1C2434] mb-1">Unidades Disponibles en Stock</label>
              <input
                type="number"
                min="0"
                value={newStockValue}
                onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-xl text-xl font-extrabold text-[#3C50E0] text-center"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setEditingStockProduct(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveStock}
                className="px-4 py-2 bg-[#219653] text-white rounded-xl font-bold hover:bg-[#1b7a43] cursor-pointer"
              >
                Actualizar Stock
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Upgrade de Plan */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
