'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Tienda } from '@/lib/types';
import { Store, Camera, ArrowRight, Share2, Sparkles } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tienda: Tienda;
  onStartCreateProduct: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  tienda,
  onStartCreateProduct,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center space-y-4 py-2">
        <div className="relative inline-block">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#3C50E0] to-[#219653] text-white flex items-center justify-center font-bold mx-auto shadow-xl">
            <Store size={32} />
          </div>
          <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full shadow-sm animate-bounce">
            <Sparkles size={14} />
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-[#1C2434]">
            ¡Bienvenido a {tienda.nombre}! 🎉
          </h2>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Tu tienda en línea ya está activa. Puedes crear tu primer producto para comenzar a vender por WhatsApp de inmediato.
          </p>
        </div>

        {/* Tarjeta de enlace público */}
        <div className="bg-[#3C50E0]/5 border border-[#3C50E0]/20 p-3 rounded-xl flex items-center justify-between text-xs">
          <div className="text-left overflow-hidden mr-2">
            <span className="text-[10px] uppercase font-bold text-[#3C50E0] block">Enlace de tu Catálogo</span>
            <span className="text-xs font-extrabold text-[#1C2434] truncate block">
              /tienda/{tienda.slug}
            </span>
          </div>
          <a
            href={`/tienda/${tienda.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white text-[#3C50E0] border border-[#3C50E0]/30 rounded-lg hover:bg-[#3C50E0] hover:text-white transition-all shadow-xs flex-shrink-0"
            title="Ver catálogo"
          >
            <Share2 size={16} />
          </a>
        </div>

        {/* Acciones principales */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartCreateProduct();
            }}
            className="w-full bg-[#219653] hover:bg-[#1b7a43] text-white py-3.5 px-4 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Camera size={18} /> Tomar Foto y Cargar Primer Producto
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Explorar mi panel primero
          </button>
        </div>
      </div>
    </Modal>
  );
};
