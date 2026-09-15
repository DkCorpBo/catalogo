'use client';

import React from 'react';
import { Tienda, Producto } from '@/lib/types';
import { CheckCircle2, Circle, ArrowRight, Store, Image, Package, Share2 } from 'lucide-react';
import Link from 'next/link';

interface OnboardingWizardProps {
  tienda: Tienda;
  productosCount: number;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ tienda, productosCount }) => {
  const steps = [
    {
      id: 1,
      title: 'Configura el nombre y número de WhatsApp',
      desc: 'Donde recibirás las notificaciones de pedidos.',
      completed: !!tienda.nombre && !!tienda.whatsapp_number,
      href: '/admin/configuracion',
      icon: Store,
    },
    {
      id: 2,
      title: 'Personaliza tu Logo y Descripción',
      desc: 'Dale a tus clientes una gran primera impresión.',
      completed: !!tienda.logo_url && !!tienda.descripcion,
      href: '/admin/configuracion',
      icon: Image,
    },
    {
      id: 3,
      title: 'Crea tus primeros productos en catálogo',
      desc: 'Agrega precios, imágenes e inventario disponible.',
      completed: productosCount > 0,
      href: '/admin/productos',
      icon: Package,
    },
    {
      id: 4,
      title: 'Comparte el enlace público de tu tienda',
      desc: `Comparte /tienda/${tienda.slug} en tus redes y chats.`,
      completed: productosCount > 0 && !!tienda.whatsapp_number,
      href: `/tienda/${tienda.slug}`,
      isExternal: true,
      icon: Share2,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100);

  // Si completó todos los pasos, mostrar una tarjeta compacta
  if (completedCount === steps.length) {
    return (
      <div className="bg-gradient-to-r from-[#219653]/10 to-[#3C50E0]/10 border border-[#219653]/30 rounded-xl p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#219653] text-white flex items-center justify-center font-bold">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#1C2434]">¡Tu Tienda está 100% Configurada!</h3>
            <p className="text-xs text-[#64748B]">
              Tu catálogo público está listo para recibir pedidos por WhatsApp.
            </p>
          </div>
        </div>

        <a
          href={`/tienda/${tienda.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#219653] hover:bg-[#1b7a43] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
        >
          Ver mi Tienda pública <ArrowRight size={14} />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
      {/* Header del Wizard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#3C50E0] tracking-wider">
            Guía de Configuración Inicial
          </span>
          <h3 className="text-base font-extrabold text-[#1C2434] mt-0.5">
            ¡Comienza en 4 sencillos pasos! ({completedCount} de {steps.length} completados)
          </h3>
        </div>

        {/* Barra de progreso */}
        <div className="w-full sm:w-48 space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-[#64748B]">
            <span>Progreso</span>
            <span className="text-[#3C50E0]">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3C50E0] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Lista de Pasos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                step.completed
                  ? 'bg-gray-50 border-gray-200 opacity-80'
                  : 'bg-white border-[#3C50E0]/30 hover:border-[#3C50E0] shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {step.completed ? (
                    <CheckCircle2 size={20} className="text-[#219653]" />
                  ) : (
                    <Circle size={20} className="text-[#3C50E0]" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C2434] flex items-center gap-1.5">
                    <Icon size={14} className="text-[#64748B]" /> {step.title}
                  </h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{step.desc}</p>
                </div>
              </div>

              {!step.completed && (
                step.isExternal ? (
                  <a
                    href={step.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-[#3C50E0] hover:underline flex items-center gap-0.5 whitespace-nowrap mt-1"
                  >
                    Ir <ArrowRight size={12} />
                  </a>
                ) : (
                  <Link
                    href={step.href}
                    className="text-[11px] font-bold text-[#3C50E0] hover:underline flex items-center gap-0.5 whitespace-nowrap mt-1"
                  >
                    Ir <ArrowRight size={12} />
                  </Link>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
