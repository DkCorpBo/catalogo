import { EstadoPedido } from '../types';

/**
 * Formatea un monto numérico a formato de moneda (ej: $12.50 USD)
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return `$${formatted} ${currency}`;
}

/**
 * Formatea una fecha ISO a formato de lectura humana local
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Devuelve la configuración visual del Badge según el estado del pedido (Estilo Katara)
 */
export function getStatusBadge(status: EstadoPedido): { label: string; colorClass: string } {
  switch (status) {
    case 'pendiente':
      return {
        label: 'Pendiente',
        colorClass: 'bg-[#FFA70B]/10 text-[#FFA70B] border-[#FFA70B]/30',
      };
    case 'confirmado':
      return {
        label: 'Confirmado',
        colorClass: 'bg-[#3C50E0]/10 text-[#3C50E0] border-[#3C50E0]/30',
      };
    case 'completado':
      return {
        label: 'Completado',
        colorClass: 'bg-[#219653]/10 text-[#219653] border-[#219653]/30',
      };
    case 'cancelado':
      return {
        label: 'Cancelado',
        colorClass: 'bg-[#D34053]/10 text-[#D34053] border-[#D34053]/30',
      };
    default:
      return {
        label: status,
        colorClass: 'bg-gray-100 text-gray-700 border-gray-300',
      };
  }
}
