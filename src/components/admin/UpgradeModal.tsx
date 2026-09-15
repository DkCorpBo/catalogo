'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Zap, Check, Star } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Límite del Plan Gratuito Alcanzado">
      <div className="space-y-5 text-xs text-center py-2">
        <div className="w-14 h-14 rounded-2xl bg-[#FFA70B]/10 text-[#FFA70B] flex items-center justify-center mx-auto shadow-xs border border-[#FFA70B]/20">
          <Zap size={32} />
        </div>

        <div>
          <h3 className="text-lg font-black text-[#1C2434]">¡Actualiza a Plan Pro!</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-xs mx-auto">
            Has alcanzado el límite máximo de **5 productos** permitidos en el Plan Gratuito.
          </p>
        </div>

        <div className="bg-[#F1F5F9] p-4 rounded-xl text-left border border-[#E2E8F0] space-y-2">
          <p className="font-extrabold text-[#1C2434] text-xs flex items-center gap-1.5">
            <Star size={16} className="text-[#FFA70B]" /> Beneficios del Plan Pro:
          </p>
          <ul className="space-y-1.5 text-[11px] text-[#1C2434] font-medium pl-1">
            <li className="flex items-center gap-2">
              <Check size={14} className="text-[#219653]" /> Productos e inventario **ilimitados**.
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-[#219653]" /> Pedidos y ventas mensuales **ilimitadas**.
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-[#219653]" /> Insignia de negocio verificado.
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-[#219653]" /> Soporte prioritario 24/7 por WhatsApp.
            </li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <a
            href="https://wa.me/59170000000?text=Hola,%20quiero%20actualizar%20mi%20tienda%20al%20Plan%20Pro"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#219653] hover:bg-[#1b7a43] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            Solicitar Plan Pro por WhatsApp
          </a>

          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg font-bold text-xs hover:bg-gray-200"
          >
            Entendido, volver
          </button>
        </div>
      </div>
    </Modal>
  );
};
