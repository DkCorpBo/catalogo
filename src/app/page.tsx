import React from 'react';
import Link from 'next/link';
import { Store, ShoppingBag, ShieldCheck, Zap, ArrowRight, CheckCircle2, Star, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1C2434] flex flex-col justify-between">
      {/* Header Landing */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3C50E0] text-white flex items-center justify-center font-bold shadow-md">
              <Store size={22} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-[#1C2434]">Tienda & Inventario</h1>
              <p className="text-[11px] text-[#64748B]">Plataforma de Tiendas Online</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/superadmin"
              className="text-xs font-bold text-gray-600 hover:text-[#1C2434] px-3 py-2 rounded-lg transition-colors hidden sm:block"
            >
              SuperAdmin
            </Link>
            <Link
              href="/tienda/demo"
              className="text-xs font-bold text-[#3C50E0] hover:bg-[#3C50E0]/10 px-3.5 py-2 rounded-lg transition-colors hidden sm:block"
            >
              Ver Demo
            </Link>
            <Link
              href="/crear-tienda"
              className="bg-[#3C50E0] hover:bg-[#2e3fb8] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              Crear Tienda Gratis <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 py-16 text-center space-y-10 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 bg-[#3C50E0]/10 text-[#3C50E0] px-4 py-1.5 rounded-full text-xs font-bold border border-[#3C50E0]/20 mx-auto">
          <Zap size={14} /> Tu Tienda Online lista en 30 segundos
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#1C2434] tracking-tight leading-tight max-w-4xl mx-auto">
          Vende por <span className="text-[#219653]">WhatsApp</span> y controla tu <span className="text-[#3C50E0]">Inventario</span>
        </h1>

        <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
          Publica tus productos con un catálogo móvil ultra rápido, recibe pedidos directamente en WhatsApp y lleva el control automático de tus existencias.
        </p>

        {/* Acciones principales */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/crear-tienda"
            className="w-full sm:w-auto bg-[#3C50E0] hover:bg-[#2e3fb8] text-white px-8 py-4 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Store size={20} /> Crear mi Tienda Gratis Ahora
          </Link>
          <Link
            href="/admin"
            className="w-full sm:w-auto bg-white border border-[#E2E8F0] hover:bg-gray-50 text-[#1C2434] px-8 py-4 rounded-xl font-bold text-sm shadow-2xs transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={20} className="text-[#3C50E0]" /> Ver Panel Demo
          </Link>
        </div>

        {/* Planes Freemium */}
        <div className="pt-12">
          <h2 className="text-2xl font-black text-[#1C2434] mb-2">Planes Sencillos y Transparentes</h2>
          <p className="text-xs text-[#64748B] mb-8">Comienza gratis y actualiza solo cuando tu negocio crezca.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            {/* Plan Gratuito */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4 relative">
              <div>
                <span className="text-xs font-bold uppercase text-[#64748B] tracking-wider">Plan Inicial</span>
                <h3 className="text-2xl font-black text-[#1C2434] mt-1">Gratis</h3>
                <p className="text-xs text-[#64748B] mt-1">Ideal para emprendedores y nuevos negocios.</p>
              </div>

              <ul className="space-y-2 text-xs text-[#1C2434] font-medium pt-2 border-t">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#219653]" /> Hasta 5 productos en catálogo.
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#219653]" /> Catálogo móvil ultra rápido.
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#219653]" /> Pedidos directos a tu WhatsApp.
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#219653]" /> Control de inventario en tiempo real.
                </li>
              </ul>

              <Link
                href="/crear-tienda"
                className="w-full bg-[#1C2434] hover:bg-black text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all mt-4"
              >
                Comenzar Gratis
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#3C50E0] shadow-lg space-y-4 relative">
              <div className="absolute -top-3 right-6 bg-[#3C50E0] text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                Recomendado
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-[#3C50E0] tracking-wider flex items-center gap-1">
                  <Star size={14} className="fill-[#3C50E0]" /> Plan Pro
                </span>
                <h3 className="text-2xl font-black text-[#1C2434] mt-1">Suscripción Pro</h3>
                <p className="text-xs text-[#64748B] mt-1">Para negocios en expansión que venden a diario.</p>
              </div>

              <ul className="space-y-2 text-xs text-[#1C2434] font-medium pt-2 border-t">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#219653]" /> Productos e inventario **ilimitados**.
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#219653]" /> Pedidos y ventas **ilimitadas**.
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#219653]" /> Insignia de negocio verificado.
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#219653]" /> Soporte prioritario por WhatsApp.
                </li>
              </ul>

              <Link
                href="/crear-tienda"
                className="w-full bg-[#3C50E0] hover:bg-[#2e3fb8] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-4"
              >
                Crear Tienda Pro
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-6 text-center text-xs text-[#64748B]">
        <p>© 2026 Tienda & Inventario — Plataforma de Comercio Electrónico por WhatsApp.</p>
      </footer>
    </div>
  );
}
