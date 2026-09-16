'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createNewTienda } from '@/lib/services/tiendas';
import { registerUser } from '@/lib/services/auth';
import { Store, ArrowRight, CheckCircle, Smartphone, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CrearTiendaPage() {
  const router = useRouter();
  const [nombreTienda, setNombreTienda] = useState('');
  const [slug, setSlug] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [nombreAdmin, setNombreAdmin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNombreTiendaChange = (val: string) => {
    setNombreTienda(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreTienda.trim() || !whatsappNumber.trim()) {
      setErrorMsg('Por favor ingresa el nombre de tu tienda y tu número de celular.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const targetSlug = slug.trim() || nombreTienda.toLowerCase().replace(/\s+/g, '-');

      // 1. Crear la tienda (valida que no tenga tienda previa en Plan Gratuito)
      const newStore = await createNewTienda({
        nombre: nombreTienda.trim(),
        slug: targetSlug,
        whatsapp_number: whatsappNumber.trim(),
        moneda: 'USD',
      });

      // 2. Registrar el usuario usando su número de celular como clave de acceso principal
      registerUser({
        userId: `user-${newStore.id}`,
        username: targetSlug,
        telefono: whatsappNumber.trim(),
        nombre: nombreAdmin.trim() || `Dueño (${newStore.nombre})`,
        rol: 'admin_tienda',
        tiendaSlug: newStore.slug,
        tiendaId: newStore.id,
      });

      // 3. Redirigir al panel de la nueva tienda con bienvenida
      router.push('/admin?welcome=1');
    } catch (err: any) {
      console.error('Error al crear tienda:', err);
      if (err?.code === 'MULTIPLE_STORES_PRO_REQUIRED' || err?.message?.includes('Plan Pro')) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ocurrió un error al registrar la tienda. Intenta nuevamente o usa otro slug.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4 py-8">
      <div className="bg-white border border-[#E2E8F0] shadow-xl rounded-2xl w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#3C50E0] text-white flex items-center justify-center font-bold mx-auto shadow-md">
            <Store size={26} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1C2434]">Crea tu Tienda Gratis</h2>
          <p className="text-xs text-[#64748B]">Acceso ultra sencillo sin contraseñas complicadas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#1C2434] mb-1">Nombre de tu Tienda / Comercio *</label>
            <input
              type="text"
              required
              placeholder="Ej: Calzados El Sol"
              value={nombreTienda}
              onChange={(e) => handleNombreTiendaChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border rounded-xl border-[#E2E8F0] focus:border-[#3C50E0] text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1C2434] mb-1">Tu Número de Celular / WhatsApp *</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-2.5 text-[#3C50E0]" size={18} />
              <input
                type="text"
                required
                placeholder="Ej: 70000000 o 59170000000"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl border-[#E2E8F0] focus:border-[#3C50E0] text-sm font-extrabold text-[#3C50E0]"
              />
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Usarás este número para iniciar sesión de forma rápida y recibir los pedidos de tus clientes.
            </p>
          </div>

          <div>
            <label className="block font-bold text-[#1C2434] mb-1">Tu Nombre o Nombre de Contacto</label>
            <input
              type="text"
              placeholder="Ej: Carlos Ramos"
              value={nombreAdmin}
              onChange={(e) => setNombreAdmin(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border rounded-lg border-[#E2E8F0] focus:border-[#3C50E0]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1C2434] mb-1">Enlace URL Personalizado de tu Tienda</label>
            <div className="flex items-center">
              <span className="bg-gray-100 border border-r-0 border-[#E2E8F0] px-3 py-2 rounded-l-lg text-gray-500 font-semibold text-xs">
                /tienda/
              </span>
              <input
                type="text"
                placeholder="calzados-el-sol"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border rounded-r-lg border-[#E2E8F0] focus:border-[#3C50E0] font-bold text-[#3C50E0]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-[#D34053] font-bold bg-red-50 p-3.5 rounded-xl border border-red-200 space-y-2">
              <p>{errorMsg}</p>
              {errorMsg.includes('Plan Pro') && (
                <div className="pt-1">
                  <a
                    href={`https://wa.me/59178490780?text=${encodeURIComponent(`Hola, quiero actualizar a Plan Pro Multi-Tienda para mi número +${whatsappNumber.replace(/\D/g, '')}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#219653] hover:bg-[#1b7a43] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    <Zap size={13} /> Solicitar Plan Pro Multi-Tienda
                  </a>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3C50E0] hover:bg-[#2e3fb8] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? 'Creando Tienda...' : 'Crear mi Tienda Gratis Ahora'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="bg-[#219653]/5 p-4 rounded-xl border border-[#219653]/20 text-[11px] space-y-1.5 text-[#64748B]">
          <p className="font-bold text-[#219653] flex items-center gap-1">
            <Zap size={14} /> Tu Plan Gratuito Incluye:
          </p>
          <p className="flex items-center gap-1.5 text-[#1C2434]">
            <CheckCircle size={14} className="text-[#219653]" /> 100% Gratis sin tarjeta de crédito.
          </p>
          <p className="flex items-center gap-1.5 text-[#1C2434]">
            <CheckCircle size={14} className="text-[#219653]" /> Hasta 5 productos con stock e imágenes.
          </p>
          <p className="flex items-center gap-1.5 text-[#1C2434]">
            <CheckCircle size={14} className="text-[#219653]" /> Recepción de ventas directo a tu WhatsApp.
          </p>
        </div>

        <div className="text-center pt-1 border-t text-[11px] text-[#64748B]">
          <p>¿Ya tienes una tienda creada? <Link href="/login" className="text-[#3C50E0] font-bold">Ingresar con tu Celular</Link>.</p>
        </div>
      </div>
    </div>
  );
}
