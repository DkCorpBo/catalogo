'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Pedido, Tienda } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Printer, Send, CheckCircle2, Store } from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: Pedido;
  tienda: Tienda;
  metodoPago: 'efectivo' | 'qr' | 'tarjeta';
  montoRecibido: number;
  vuelto: number;
  onNewSale: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  pedido,
  tienda,
  metodoPago,
  montoRecibido,
  vuelto,
  onNewSale,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    let msg = `🧾 *TICKET DE VENTA - ${tienda.nombre.toUpperCase()}*\n`;
    msg += `📋 *Comprobante:* #${pedido.id.slice(0, 8)}\n`;
    msg += `📅 *Fecha:* ${formatDate(pedido.created_at)}\n\n`;
    msg += `📦 *PRODUCTOS:*\n`;
    pedido.detalles?.forEach((d) => {
      msg += `▪️ ${d.cantidad}x ${d.producto_nombre} - ${formatCurrency(d.subtotal, tienda.moneda)}\n`;
    });
    msg += `\n💰 *TOTAL:* ${formatCurrency(pedido.total, tienda.moneda)}\n`;
    msg += `💳 *Método de Pago:* ${metodoPago.toUpperCase()}\n`;
    if (metodoPago === 'efectivo') {
      msg += `💵 *Monto Recibido:* ${formatCurrency(montoRecibido, tienda.moneda)}\n`;
      msg += `🪙 *Cambio / Vuelto:* ${formatCurrency(vuelto, tienda.moneda)}\n`;
    }
    msg += `\n¡Gracias por tu compra! 🙌`;

    const cleanPhone = pedido.cliente_whatsapp?.replace(/\D/g, '') || tienda.whatsapp_number;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Venta Realizada con Éxito">
      <div className="space-y-4 text-xs font-mono">
        {/* Ticket estético de caja registradora */}
        <div className="bg-[#FFFDF0] p-5 rounded-xl border border-amber-200 shadow-inner space-y-3 text-[#1C2434]">
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-amber-300">
            <div className="w-8 h-8 rounded-full bg-[#3C50E0] text-white flex items-center justify-center font-bold mx-auto">
              <Store size={18} />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider">{tienda.nombre}</h3>
            <p className="text-[10px] text-gray-500">Ticket N°: #{pedido.id.slice(0, 8)}</p>
            <p className="text-[10px] text-gray-500">{formatDate(pedido.created_at)}</p>
          </div>

          <div className="space-y-2 py-2">
            <div className="flex justify-between font-bold border-b border-amber-200 pb-1 text-[11px]">
              <span>CANT. PRODUCTO</span>
              <span>TOTAL</span>
            </div>
            {pedido.detalles?.map((det, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs">
                <span className="max-w-[180px] line-clamp-1">
                  {det.cantidad}x {det.producto_nombre}
                </span>
                <span className="font-bold">{formatCurrency(det.subtotal, tienda.moneda)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-dashed border-amber-300 space-y-1 text-right text-xs">
            <div className="flex justify-between font-extrabold text-sm">
              <span>TOTAL A PAGAR:</span>
              <span className="text-[#3C50E0]">{formatCurrency(pedido.total, tienda.moneda)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Método de Pago:</span>
              <span className="font-bold capitalize">{metodoPago}</span>
            </div>
            {metodoPago === 'efectivo' && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Monto Recibido:</span>
                  <span>{formatCurrency(montoRecibido, tienda.moneda)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-[#219653]">
                  <span>VUELTO / CAMBIO:</span>
                  <span>{formatCurrency(vuelto, tienda.moneda)}</span>
                </div>
              </>
            )}
          </div>

          <div className="text-center pt-2 text-[10px] text-gray-500 uppercase tracking-widest">
            *** GRACIAS POR PREFERIRNOS ***
          </div>
        </div>

        {/* Acciones del Ticket */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans pt-2">
          <button
            onClick={handleSendWhatsApp}
            className="w-full bg-[#219653] hover:bg-[#1b7a43] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Send size={16} /> Enviar Ticket por WhatsApp
          </button>
          <button
            onClick={handlePrint}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer size={16} /> Imprimir Comprobante
          </button>
        </div>

        <button
          onClick={onNewSale}
          className="w-full bg-[#3C50E0] hover:bg-[#2e3fb8] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer font-sans"
        >
          <CheckCircle2 size={18} /> Nueva Venta POS (Siguiente Cliente)
        </button>
      </div>
    </Modal>
  );
};
