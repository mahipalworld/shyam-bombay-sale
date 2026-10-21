const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAtkeqhZCW6IBS4ccYH03HjkQdiZC2g77ztlZAe5ZC4DWYf2QMDb5P9buVBFqA1joNZCxZCcuMIyC65a3xr6lmw1rlTTmuTDCgiHhbunexUcDhpvoBePaZB8vHfyDQo0X4iboHRlMSg3GZBPMkQNE0Ljh353rySX4oV57ea4uKZA3hSkbpzQ9kE9vdSM4zzYYiAZAwXU1tJUl4E76E';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1351691691356682';

/**
 * Normalizes any phone string to E.164 digits format (91XXXXXXXXXX).
 */
function normalizePhoneForWhatsApp(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits.length >= 10 ? digits : null;
}

/**
 * Sends a WhatsApp text notification to the customer.
 */
async function sendWhatsAppNotification(toPhone, messageText) {
  try {
    const recipient = normalizePhoneForWhatsApp(toPhone);
    if (!recipient) {
      console.warn('[WhatsAppService] Skipped: Invalid recipient phone', toPhone);
      return { success: false, reason: 'invalid_phone' };
    }

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.warn('[WhatsAppService] Skipped: Missing WhatsApp Cloud API credentials');
      return { success: false, reason: 'missing_credentials' };
    }

    const url = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'text',
        text: { body: messageText },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[WhatsAppService] Meta API Error:', data);
      return { success: false, error: data };
    }

    console.log(`[WhatsAppService] Notification delivered to ${recipient}:`, data.messages?.[0]?.id);
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    console.error('[WhatsAppService] Exception sending WhatsApp notification:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sends order status update notification to the customer via WhatsApp.
 */
async function sendOrderStatusNotification(order, status, meta = {}) {
  try {
    const rawPhone = order.shipping_address?.phone || order.phone;
    if (!rawPhone) {
      console.warn(`[WhatsAppService] Order #${order.order_number} has no phone number on record.`);
      return;
    }

    const customerName = order.shipping_address?.name || 'Valued Customer';
    const trackingNumber = meta.trackingNumber || order.tracking_number;
    const courier = meta.courier;
    const trackingUrl = meta.trackingUrl;

    const statusEmojis = {
      Processing: '⏳',
      Confirmed: '✅',
      Packed: '📦',
      Shipped: '🚚',
      Delivered: '🎉',
      Cancelled: '❌',
    };
    const emoji = statusEmojis[status] || '📦';

    let text = `${emoji} *Shyam Bombay Sale — Order Update*\n\nHello *${customerName}*! Your order *#${order.order_number}* is now *${status}*.\n\n💰 *Total Amount:* ₹${Number(order.total || 0).toLocaleString('en-IN')}`;

    if (trackingNumber) {
      text += `\n📍 *Tracking Number:* ${trackingNumber}`;
    }
    if (courier) {
      text += `\n🚚 *Courier Partner:* ${courier}`;
    }
    if (trackingUrl) {
      text += `\n🔗 *Track Live:* ${trackingUrl}`;
    } else {
      text += `\n🔗 *View Order Details:* https://sbsstore.in/orders`;
    }

    text += `\n\nNeed to modify your order or talk to our staff? Simply reply directly to this WhatsApp message!`;

    await sendWhatsAppNotification(rawPhone, text);
  } catch (err) {
    console.error('[WhatsAppService] sendOrderStatusNotification error:', err.message);
  }
}

module.exports = {
  sendWhatsAppNotification,
  sendOrderStatusNotification,
};
