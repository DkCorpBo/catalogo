import { CartItem } from '../types';
import { formatCurrency } from './formatters';

interface BuildOrderMessageParams {
  storeName: string;
  customerName: string;
  whatsappNumber?: string;
  address?: string;
  items: CartItem[];
  total: number;
  currency?: string;
  orderId?: string;
}

/**
 * Limpia el número telefónico dejando solo los dígitos para la API de WhatsApp
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Construye el mensaje estructurado de texto formateado con emojis para el pedido
 */
export function buildOrderWhatsAppMessage({
  storeName,
  customerName,
  address,
  items,
  total,
  currency = 'USD',
  orderId,
}: BuildOrderMessageParams): string {
  let message = `🛒 *NUEVO PEDIDO - ${storeName.toUpperCase()}*\n`;
  
  if (orderId) {
    message += `📋 *Pedido N°:* #${orderId.slice(0, 8)}\n`;
  }
  
  message += `👤 *Cliente:* ${customerName}\n`;
  if (address && address.trim()) {
    message += `📍 *Dirección:* ${address.trim()}\n`;
  }
  
  message += `\n📦 *DESGLOSE DEL PEDIDO:*\n`;
  items.forEach((item) => {
    const subtotal = item.producto.precio * item.cantidad;
    message += `▪️ ${item.cantidad}x ${item.producto.nombre} - ${formatCurrency(subtotal, currency)}\n`;
  });

  message += `\n💰 *TOTAL A PAGAR: ${formatCurrency(total, currency)}*\n\n`;
  message += `Quedo atento a la confirmación y tiempo estimado de entrega. ¡Gracias! 🙌`;

  return message;
}

/**
 * Genera la URL completa wa.me/<numero>?text=<mensaje_encodado>
 */
export function createWhatsAppOrderUrl(
  phone: string,
  params: BuildOrderMessageParams
): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const textMessage = buildOrderWhatsAppMessage({ ...params, storeName: params.storeName });
  const encodedText = encodeURIComponent(textMessage);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
