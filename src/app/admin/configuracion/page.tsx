'use client';

import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/Header';
import { Card } from '@/components/ui/Card';
import { getTiendaBySlug, updateTiendaConfig } from '@/lib/services/tiendas';
import { getCurrentSession, SesionUsuario } from '@/lib/services/auth';
import { Tienda } from '@/lib/types';
import { Save, Check, Copy, ExternalLink } from 'lucide-react';

export default function AdminConfiguracionPage() {
  const [session, setSession] = useState<SesionUsuario | null>(null);
  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    whatsapp_number: '',
    descripcion: '',
    moneda: 'USD',
    logo_url: '',
  });

  useEffect(() => {
    async function loadStore() {
      setLoading(true);
      const currentSes = getCurrentSession();
      setSession(currentSes);

      const targetSlug = currentSes?.tiendaSlug || 'demo';
      const store = await getTiendaBySlug(targetSlug);
      setTienda(store);

      if (store) {
        setFormData({
          nombre: store.nombre || '',
          slug: store.slug || '',
          whatsapp_number: store.whatsapp_number || '',
          descripcion: store.descripcion || '',
          moneda: store.moneda || 'USD',
          logo_url: store.logo_url || '',
        });
      }
      setLoading(false);
    }
    loadStore();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tienda) return;

    await updateTiendaConfig(tienda.id, {
      nombre: formData.nombre.trim(),
      slug: formData.slug.trim(),
      whatsapp_number: formData.whatsapp_number.trim(),
      descripcion: formData.descripcion.trim(),
      moneda: formData.moneda,
      logo_url: formData.logo_url.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const storePublicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tienda/${formData.slug}`
    : `/tienda/${formData.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storePublicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <AdminSidebar slug={formData.slug || session?.tiendaSlug || 'demo'} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader storeName={formData.nombre || tienda?.nombre} plan={tienda?.plan} />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto max-w-3xl">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-extrabold text-[#1C2434]">Configuración de la Tienda</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Personaliza el nombre, número de WhatsApp para pedidos y la dirección pública de tu catálogo.
            </p>
          </div>

          {/* Card de Enlace Público de la Tienda */}
          <Card title="Enlace Público de tu Tienda">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                readOnly
                value={storePublicUrl}
                className="w-full px-3 py-2.5 bg-gray-50 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#1C2434]"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-[#3C50E0] hover:bg-[#2e3fb8] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-2xs cursor-pointer"
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  {copiedLink ? 'Copiado' : 'Copiar Enlace'}
                </button>
                <a
                  href={`/tienda/${formData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                >
                  <ExternalLink size={16} /> Abrir
                </a>
              </div>
            </div>
          </Card>

          {/* Formulario de Configuración */}
          <Card title="Ajustes Generales">
            {loading ? (
              <div className="py-6 text-center text-xs text-[#64748B]">Cargando ajustes...</div>
            ) : (
              <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1C2434] mb-1">Nombre Comercial de la Tienda *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-lg border-[#E2E8F0] focus:border-[#3C50E0]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#1C2434] mb-1">Slug URL de la Tienda *</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-lg border-[#E2E8F0] focus:border-[#3C50E0]"
                    />
                    <p className="text-[11px] text-[#64748B] mt-1">Dirección: /tienda/{formData.slug}</p>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1C2434] mb-1">Número de WhatsApp (con código país) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 59170000000"
                      value={formData.whatsapp_number}
                      onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-lg border-[#E2E8F0] focus:border-[#3C50E0]"
                    />
                    <p className="text-[11px] text-[#64748B] mt-1">Donde recibirás las notificaciones de compra.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#1C2434] mb-1">Moneda Principal</label>
                    <select
                      value={formData.moneda}
                      onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-lg border-[#E2E8F0] focus:border-[#3C50E0] bg-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="BOB">BOB (Bs.)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="MXN">MXN ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1C2434] mb-1">URL del Logo de la Tienda</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-lg border-[#E2E8F0] focus:border-[#3C50E0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1C2434] mb-1">Descripción de la Tienda</label>
                  <textarea
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-lg border-[#E2E8F0] focus:border-[#3C50E0]"
                  />
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                  {savedSuccess ? (
                    <span className="text-[#219653] font-bold flex items-center gap-1">
                      <Check size={16} /> ¡Ajustes guardados correctamente!
                    </span>
                  ) : (
                    <span></span>
                  )}

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#3C50E0] hover:bg-[#2e3fb8] text-white rounded-lg font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Save size={16} /> Guardar Ajustes
                  </button>
                </div>
              </form>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
